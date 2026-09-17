import React from 'react';
import { useMolecule } from 'bunshi/react';
import { BasicCanvasController } from '../canvas/CanvasController';
import { CanvasProvider } from '../canvas/CanvasScope';
import { CanvasSelectionMolecule } from '../canvas/plugins/CanvasSelectionMolecule';
import { SelectedNodeController } from '../core/selection/SelectedNodeController';
import { LocalBedrockComponents } from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
import { DocumentCssEditor } from './DocumentCssMolecule';
import { StylePanel } from './StyleMolecule';

export default {
  title: 'Css Editing',
};

const plainHtml = `<div class="card">
  <h2>Card title</h2>
  <p>Select an element in the canvas, then edit its CSS on the left.</p>
</div>`;

const kitchenSinkHtml = `<my-ui-component first="Ada" last="Lovelace"></my-ui-component>`;

const NoSelection = () => (
  <p style={{ color: '#888' }}>Select an element in the canvas to style it.</p>
);

const Editor: React.FC<{ Panel: React.ComponentType }> = ({ Panel }) => {
  useMolecule(CanvasSelectionMolecule);
  return (
    <div style={LayoutStyle}>
      <div style={SidebarStyle}>
        <Panel />
      </div>
      <div style={MainStyle}>
        <BasicCanvasController />
      </div>
    </div>
  );
};

const CssEditor: React.FC<{ Panel: React.ComponentType }> = ({ Panel }) => (
  <CanvasProvider>
    <Editor Panel={Panel} />
  </CanvasProvider>
);

const SelectedStylePanel = () => (
  <SelectedNodeController
    HasSelectionComponent={StylePanel}
    NoSelectionComponent={NoSelection}
  />
);

const BothPanels = () => (
  <>
    <SelectedStylePanel />
    <hr />
    <DocumentCssEditor />
  </>
);

/**
 * Per-instance CSS for the selected element. Plain HTML declares no
 * `::part(name)` surfaces, so only the `:host` section is editable.
 */
export const ElementStyles = () => (
  <BasicStory startingHtml={plainHtml}>
    <CssEditor Panel={SelectedStylePanel} />
  </BasicStory>
);

/**
 * Page-wide CSS. Unlike per-instance CSS this is not scoped, so selectors
 * apply across the whole canvas — try `h2 { color: rebeccapurple }`.
 */
export const DocumentCss = () => (
  <BasicStory startingHtml={plainHtml}>
    <CssEditor Panel={DocumentCssEditor} />
  </BasicStory>
);

/**
 * Both surfaces together, as they appear in a real editor. Document CSS is
 * emitted before per-instance CSS, so instance rules win on equal specificity.
 */
export const ElementAndDocumentCss = () => (
  <BasicStory startingHtml={plainHtml}>
    <CssEditor Panel={BothPanels} />
  </BasicStory>
);

/**
 * `::part(name)` sections, one per part the component's schema declares.
 * `<my-ui-component>` declares `@csspart greeting` and `@csspart date`.
 *
 * Requires the kitchen-sink dev server:
 *   cd examples/my-kitchen-sink && npm run start:raisins
 */
export const CssParts = () => (
  <BasicStory
    startingHtml={kitchenSinkHtml}
    startingPackages={LocalBedrockComponents}
  >
    <CssEditor Panel={SelectedStylePanel} />
  </BasicStory>
);

const LayoutStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 13,
};

const SidebarStyle: React.CSSProperties = {
  flex: '0 0 320px',
  overflowY: 'auto',
  padding: 12,
  borderRight: '1px solid #e0e0e0',
};

const MainStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 12,
};
