import * as schema from '@raisins/schema/schema';
import { JsonDocs, JsonDocsTag } from '@stencil/core/internal';
import splitOnFirst from './split-on-first';

export type HasDocsTags = { docsTags: JsonDocsTag[] };
type WalkableValue = string;
interface WalkableObject {
  [key: string]: WalkableObject | WalkableValue[];
}

function walk(
  obj: WalkableObject | WalkableValue[],
  cb: (value: string) => object,
  ignoreKeys: Set<string> = new Set()
) {
  const newSet = new Set(ignoreKeys);
  if (typeof obj === 'string' || !obj) return cb(obj);
  if (Array.isArray(obj)) {
    const tags = obj.filter(tag => !newSet.has(tag));
    tags.forEach(tag => newSet.add(tag));
    return tags.map(cb);
  }

  const keys = Object.keys(obj).filter(key => !newSet.has(key));
  keys.forEach(key => newSet.add(key));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return keys.reduce((prev, key): any => {
    return {
      ...prev,
      [key]: {
        children: walk(obj[key], cb, newSet),
        ...cb(key),
      },
    };
  }, {});
}

export function convertToGrapesJSMeta(docs: JsonDocs): schema.Module {
  const getStates = (tag: string): schema.ComponentState[] => {
    const component = docs.components.find(c => c.tag === tag);
    const states: schema.ComponentState[] =
      component?.props.reduce((arr, p) => {
        const demosForProp = p.docsTags
          .filter(t => t.name === 'componentState')
          .map(t => {
            const parsed = JSON.parse(t.text!);
            const { title, slot, dependencies, props, ...meta } = parsed;
            const componentState: schema.ComponentState = {
              title,
              // @ts-expect-error: add slot to type
              slot,
              dependencies,
              meta,
              props: {
                [p.name]: props,
              },
            };
            // Sorry future people for doing mutable.
            return componentState;
          });
        return [...arr, ...demosForProp];
      }, [] as schema.ComponentState[]) || [];

    return states;
  };

  const tags: schema.CustomElement[] = docs.components
    .filter(documented)
    .map(comp => {
      try {
        const ignoreTags = new Set<string>([comp.tag]);
        const includeTag = (tag: string) => {
          const states = getStates(tag);
          const component = docs.components.find(c => c.tag === tag);
          const dependencies = component?.dependencies || [];

          const children = walk(dependencies, includeTag, ignoreTags);
          return {
            states,
            tag,
            children,
          };
        };
        const stateNode = includeTag(comp.tag);

        const attributes = comp.props
          .filter(p => typeof p.attr !== 'undefined')
          .filter(documented)
          .map(p => {
            const attr: schema.Attribute = {
              name: p.attr ?? p.name,
              type: uiType(p) ?? p.type,
              title: uiName(p) ?? p.attr ?? p.name,
              description: p.docs,
              default: defaultValue(p) ?? (p.default && JSON.parse(p.default)),
              // TODO: Support enums -- need to add to Raisins model
              // Reference: https://coda.io/d/Self-Serve-Widget_dtoEr2girWN/Raisins-Schema_sucK8#_luqov
              enum: jsonTagValue(p, 'uiEnum'),
              enumNames: jsonTagValue(p, 'uiEnumNames'),
              uiWidget: uiWidget(p),
              uiWidgetOptions: jsonTagValue(p, 'uiWidgetOptions'),
              maximum: jsonTagValue(p, 'maximum'),
              minimum: jsonTagValue(p, 'minimum'),
              maxLength: jsonTagValue(p, 'maxLength'),
              minLength: jsonTagValue(p, 'minLength'),
              format: tagValue(p.docsTags, 'format'),
              uiGroup: tagValue(p.docsTags, 'uiGroup'),
              // uiGroupSwitch: tagValue(p.docsTags, 'uiGroupSwitch'),
              uiOrder: jsonTagValue(p, 'uiOrder'),
              required: required(p),
              requiredFeatures: jsonTagValue(p, 'requiredFeatures'),
              featureTooltip: tagValue(p.docsTags, 'featureTooltip'),
            };

            return attr;
          });

        const elem: schema.CustomElement = {
          tagName: comp.tag,
          title: uiName(comp) ?? comp.tag,
          slots: jsonTagValue(comp, 'slots') as schema.Slot[],
          attributes,
          requiredFeatures: jsonTagValue(comp, 'requiredFeatures'),
          featureTooltip: tagValue(comp.docsTags, 'featureTooltip'),
          exampleGroup: tagValue(comp.docsTags, 'exampleGroup'),
          examples: comp.docsTags
            .filter(d => d.name === 'example')
            .map(d => {
              const [title, content] = splitOnFirst(d.text ?? '', ' - ');
              if (!title || !content) {
                throw new Error(
                  `Invalid example on ${comp.tag} is missing a title or content`
                );
              }
              return {
                title,
                content,
                tagName: comp.tag,
                exampleGroup: tagValue(comp.docsTags, 'exampleGroup'),
              };
            }),
          ...(stateNode.states.length ? { demoStates: stateNode } : {}),
          validParents: jsonTagValue(comp, 'validParents'),
          slotEditor: slotEditor(comp),
          canvasRenderer: canvasRenderer(comp),
        };
        return elem;
      } catch (e) {
        throw new Error(`Invalid docs tag for ${comp.tag}. ` + e);
      }
    });

  return {
    tags,
  };
}
function canvasRenderer(
  comp: HasDocsTags
): 'in-place-update' | 'always-replace' | undefined {
  const value = tagValue(comp.docsTags, 'canvasRenderer')?.trim();
  if (value === undefined) return value;
  if (value === 'in-place-update') return value;
  if (value === 'always-replace') return value;
  throw new Error('Invalid value for @canvasRenderer tag value:' + value);
}

function tagValue(tags: JsonDocsTag[], name: string): string | undefined {
  return tags?.find(t => t.name === name)?.text;
}
function jsonTagValue(tags: HasDocsTags, name: string) {
  const value = tagValue(tags.docsTags, name);
  try {
    return value && JSON.parse(value);
  } catch (e) {
    throw new Error(`Unable to parse JSON for ${name} tag. Reason: ` + e);
  }
}
const documented = (x: HasDocsTags) =>
  !x.docsTags.find(tag => tag.name === 'undocumented');
const uiName = (x: HasDocsTags) => tagValue(x.docsTags, 'uiName');
const uiType = (x: HasDocsTags) => tagValue(x.docsTags, 'uiType');
const defaultValue = (x: HasDocsTags) => tagValue(x.docsTags, 'default');
const uiWidget = (x: HasDocsTags) => tagValue(x.docsTags, 'uiWidget');
const slotEditor = (x: HasDocsTags) => tagValue(x.docsTags, 'slotEditor');
const required = (x: HasDocsTags) =>
  !!x.docsTags.find(tag => tag.name === 'required');
