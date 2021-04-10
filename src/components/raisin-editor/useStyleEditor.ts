import { useMemo, useState } from '@saasquatch/universal-hooks';
import csstree from 'css-tree';
import { StateUpdater } from '../../model/EditorModel';
import { RaisinNode, RaisinNodeWithChildren } from '../../model/RaisinNode';
import { ComponentModel } from './useComponentModel';

type Props = { node: RaisinNode; setNode: StateUpdater<RaisinNode>; parents: WeakMap<RaisinNode, RaisinNodeWithChildren>; componentModel: ComponentModel };

export function useStyleEditor({}: Props) {
  const initialCss = useMemo(() => {
    var obj = csstree.parse(
      `
      html {
        background: red;
      }
      .foo {
        border: 1px solid blue;
      }
      :root {
      --sl-color-black: #000;
      --sl-color-white: #fff;
      --sl-color-gray-50: #f9fafb;
      --sl-color-gray-100: #f3f4f6;
      --sl-color-gray-200: #e5e7eb;
      --sl-color-gray-300: #d1d5db;
      --sl-color-gray-400: #9ca3af;
      --sl-color-gray-500: #6b7280;
      --sl-color-gray-600: #4b5563;
      --sl-color-gray-700: #374151;
      --sl-color-gray-800: #1f2937;
      --sl-color-gray-900: #111827;
      --sl-color-gray-950: #0d131e;
      --sl-color-primary-50: #f0f9ff;
      --sl-color-primary-100: #e0f2fe
    }`,
      {},
    );
    return obj;
  }, []);
  const [fakeCSS, setFakeCss] = useState(initialCss);

  return {
    stylesheet: fakeCSS,
    setStyleSheet: setFakeCss,
    styleString: csstree.generate(fakeCSS, {}),
  };
}
