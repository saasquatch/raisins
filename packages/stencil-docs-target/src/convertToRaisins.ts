import { JsonDocs, JsonDocsTag } from '@stencil/core/internal';
import * as schema from '@raisins/schema/schema';
import splitOnFirst from './split-on-first';

export type HasDocsTags = { docsTags: JsonDocsTag[] };

export function convertToGrapesJSMeta(docs: JsonDocs): schema.Module {
  const tags: schema.CustomElement[] = docs.components
    .filter(isUndocumented)
    .map(comp => {
      try{
        const attributes = comp.props.filter(isUndocumented).map(p => {
          const attr: schema.Attribute = {
            name: p.attr ?? p.name,
            type: uiType(p) ?? p.type,
            title: uiName(p) ?? p.attr ?? p.name,
            description: p.docs,
            default: uiDefault(p) ?? (p.default && JSON.parse(p.default)),
            // TODO: Support enums -- need to add to Raisins model
            // enum: jsonTagValue(p, 'uiEnum'),
            // enumNames: jsonTagValue(p, 'uiEnumNames'),
          };
          return attr;
        });
  
        // TODO: Widget, help, etc.
        // 'ui:widget': tagValue(prop.docsTags, 'uiWidget'),
        // 'ui:name': uiName(prop),
        // 'ui:help': prop.docs,
        // 'ui:options': jsonTagValue(prop, 'uiOptions'),
        // 'ui:order': jsonTagValue(comp, 'uiOrder'),
  
        const elem: schema.CustomElement = {
          tagName: comp.tag,
          title: uiName(comp) ?? comp.tag,
          slots: comp.slots.map(s => {
            const [title, description] = splitOnFirst(s.docs, ' - ');
            const rSlot: schema.Slot = {
              name: s.name,
              title,
              description,
            };
            return rSlot;
          }),
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
        };
        return elem;
      }catch(e){
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
  return tags.find(t => t.name === name)?.text;
}
// function jsonTagValue(tags: HasDocsTags, name: string) {
//   const value = tagValue(tags.docsTags, name);
//   return value && JSON.parse(value);
// }
function hasTag(tagName: string) {
  return (d: HasDocsTags) =>
    d.docsTags?.find(t => t.name === tagName) ? true : false;
}
const isUndocumented = () => hasTag('undocumented');
const uiName = (x: HasDocsTags) => tagValue(x.docsTags, 'uiName');
const uiType = (x: HasDocsTags) => tagValue(x.docsTags, 'uiType');
const uiDefault = (x: HasDocsTags) => tagValue(x.docsTags, 'uiDefault');
