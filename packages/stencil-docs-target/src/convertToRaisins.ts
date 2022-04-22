import { JsonDocs, JsonDocsTag } from '@stencil/core/internal';
import * as schema from '@raisins/schema/schema';
import splitOnFirst from './split-on-first';

export type HasDocsTags = { docsTags: JsonDocsTag[] };

export function convertToGrapesJSMeta(docs: JsonDocs): schema.Module {
  const tags: schema.CustomElement[] = docs.components
    .filter(isUndocumented)
    .map(comp => {
      try {
        const demos: schema.ComponentState[] = comp.props.reduce((arr, p) => {
          const demosForProp = p.docsTags
            .filter(t => t.name == 'demo')
            .map(t => {
              const [title, propsRaw] = splitOnFirst(t.text!, ' - ');
              const componentState: schema.ComponentState = {
                title: title!,
                props: {
                  [p.name]: JSON.parse(propsRaw!),
                },
              };
              // Sorry future people for doing mutable.
              return componentState;
            });
          return [...arr, ...demosForProp];
        }, [] as schema.ComponentState[]);
        const attributes = comp.props
          .filter(p => typeof p.attr !== 'undefined')
          .filter(isUndocumented)
          .map(p => {
            const attr: schema.Attribute = {
              name: p.attr ?? p.name,
              type: uiType(p) ?? p.type,
              title: uiName(p) ?? p.attr ?? p.name,
              description: p.docs,
              default: uiDefault(p) ?? (p.default && JSON.parse(p.default)),
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
              required: jsonTagValue(p, 'required'),
            };

            return attr;
          });

        const elem: schema.CustomElement = {
          tagName: comp.tag,
          title: uiName(comp) ?? comp.tag,
          slots: jsonTagValue(comp, 'slots') as schema.Slot[],
          // comp.slots.map(s => {
          //   const [title, description] = splitOnFirst(s.docs, ' - ');
          //   let editor = undefined;
          //   if (s.name === '' || !s.name) {
          //     editor = slotEditor(comp);
          //   }
          //   const rSlot: schema.Slot = {
          //     name: s.name,
          //     title,
          //     description,
          //     editor,
          //     // TODO: validChildren
          //   };
          //   return rSlot;
          // }),
          attributes,
          examples: comp.docsTags
            .filter(d => d.name === 'example')
            .map(d => {
              const [title, content] = splitOnFirst(d.text ?? '', ' - ');
              if (!title || !content) {
                throw new Error(
                  `Invalid example om ${comp.tag} is missing a title or content`
                );
              }
              return {
                title,
                content,
              };
            }),
          demoStates: demos.length > 0 ? demos : undefined,
          validParents: jsonTagValue(comp, 'validParents'),
        };
        return elem;
      } catch (e) {
        throw new Error(`Invalid docs tag for ${comp.tag}. ` + e);
      }
    });

  return {
    title: 'a library',
    description: 'It does stuff',
    tags,
  };
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
function hasTag(tagName: string) {
  return (d: HasDocsTags) =>
    d.docsTags?.find(t => t.name === tagName) ? true : false;
}
const isUndocumented = () => hasTag('undocumented');
const uiName = (x: HasDocsTags) => tagValue(x.docsTags, 'uiName');
const uiType = (x: HasDocsTags) => tagValue(x.docsTags, 'uiType');
const uiDefault = (x: HasDocsTags) => tagValue(x.docsTags, 'uiDefault');
const uiWidget = (x: HasDocsTags) => tagValue(x.docsTags, 'uiWidget');
// const slotEditor = (x: HasDocsTags) => tagValue(x.docsTags, 'slotEditor');
