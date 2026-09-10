import * as schema from '@raisins/schema/schema';
import { convertToGrapesJSMeta } from '../src/convertToRaisins';

function tagFor(docsTags: Array<{ name: string; text: string }>) {
  const module = convertToGrapesJSMeta({
    components: [
      {
        tag: 'my-component',
        docsTags,
        props: [],
        dependencies: [],
      },
    ],
  } as any);
  return module.tags?.[0] as schema.CustomElement;
}

describe('convertToGrapesJSMeta', () => {
  it.each(['csspart', 'cssprop'])(
    'rejects an empty @%s name',
    (tagName: string) => {
      expect(() => tagFor([{ name: tagName, text: '' }])).toThrow(
        `Invalid @${tagName} tag on component "my-component" is missing a name.`
      );
    }
  );

  describe('@csspart', () => {
    it('reads a name and description', () => {
      expect(
        tagFor([{ name: 'csspart', text: 'header - The card header' }]).cssParts
      ).toEqual([{ name: 'header', description: 'The card header' }]);
    });

    it('reads a name with no description', () => {
      expect(tagFor([{ name: 'csspart', text: 'header' }]).cssParts).toEqual([
        { name: 'header', description: undefined },
      ]);
    });

    it('trims surrounding whitespace', () => {
      expect(
        tagFor([{ name: 'csspart', text: '  header  -  The card header  ' }])
          .cssParts
      ).toEqual([{ name: 'header', description: 'The card header' }]);
    });

    it('keeps later separators in the description', () => {
      expect(
        tagFor([{ name: 'csspart', text: 'header - a - b' }]).cssParts
      ).toEqual([{ name: 'header', description: 'a - b' }]);
    });

    it('reads every part, in order', () => {
      expect(
        tagFor([
          { name: 'csspart', text: 'header' },
          { name: 'csspart', text: 'body' },
        ]).cssParts
      ).toEqual([
        { name: 'header', description: undefined },
        { name: 'body', description: undefined },
      ]);
    });

    it('is undefined when the component declares none', () => {
      expect(tagFor([]).cssParts).toBeUndefined();
    });
  });

  describe('@cssprop', () => {
    it('reads a name and description', () => {
      expect(
        tagFor([{ name: 'cssprop', text: '--brand - The brand color' }])
          .cssProperties
      ).toEqual([{ name: '--brand', description: 'The brand color' }]);
    });

    it('reads a name with no description', () => {
      expect(
        tagFor([{ name: 'cssprop', text: '--brand' }]).cssProperties
      ).toEqual([{ name: '--brand', description: undefined }]);
    });

    it('is undefined when the component declares none', () => {
      expect(tagFor([]).cssProperties).toBeUndefined();
    });

    it('checks that props is valid and starts with "--"', () => {
      expect(() => tagFor([{ name: 'cssprop', text: 'brand - The brand color' }])).toThrow(
        `Invalid @cssprop tag on component "my-component" must start with "--".`
      );
    });
  });
});
