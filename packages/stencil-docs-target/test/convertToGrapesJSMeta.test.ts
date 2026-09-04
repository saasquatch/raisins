import { convertToGrapesJSMeta } from '../src/convertToRaisins';

describe('convertToGrapesJSMeta', () => {
  it.each(['csspart', 'cssprop'])(
    'rejects an empty @%s name',
    (tagName: string) => {
      expect(() =>
        convertToGrapesJSMeta({
          components: [
            {
              tag: 'my-invalid-component',
              docsTags: [{ name: tagName, text: '' }],
              props: [],
              dependencies: [],
            },
          ],
        } as any)
      ).toThrow(
        `Invalid @${tagName} tag on component "my-invalid-component" is missing a name.`
      );
    }
  );
});