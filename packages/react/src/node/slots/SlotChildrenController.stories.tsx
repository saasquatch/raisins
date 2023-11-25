import { htmlUtil, RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { atom, useAtom, useSetAtom } from 'jotai';
import { molecule, useMolecule } from 'bunshi/react';
import { useAtomValue } from 'jotai/utils';
import React, { CSSProperties, FC, useCallback, useState } from 'react';
import { ComponentModelMolecule } from '../../component-metamodel/ComponentModel';
import { CoreMolecule } from '../../core/CoreAtoms';
import { EditMolecule } from '../../core/editting/EditAtoms';
import { PickAndPlopMolecule } from '../../core/selection/PickAndPlopMolecule';
import { NodeRichTextController } from '../../rich-text/RichTextEditor';
import { BasicStory } from '../../index.stories';
import { big, MintComponents, mintMono } from '../../examples/MintComponents';
import {
  ChildrenEditorForAtoms,
  NodeChildrenEditor,
} from '../NodeChildrenEditor';
import { NodeMolecule } from '../NodeMolecule';
import { NodeScopeProvider, useNodeAtom } from '../NodeScope';
import { SlotChildrenController } from './SlotChildrenController';
import { SlotMolecule, SlotScopeProvider } from './SlotScope';
import {
  BasicCanvasController,
  CanvasHoveredMolecule,
  CanvasPickAndPlopMolecule,
  CanvasProvider,
  CanvasSelectionMolecule,
} from '../../canvas';
import { AttributesController } from '../../attributes';
import { SelectedNodeController } from '../../core';
import {
  referrerWidget,
  VanillaComponents,
} from '../../examples/VanillaComponents';
import { CanvasFull } from '../../canvas/CanvasController.stories';

const meta: Meta = {
  title: 'Slot Children Controller',
  excludeStories: ['LayersController'],
};
export default meta;

const { clone } = htmlUtil;

const Label: CSSProperties = {
  cursor: 'pointer',
  lineHeight: '28px',
};

const Layer: CSSProperties = {
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  padding: '10px 0',
  outlineOffset: '-2px',
};

const SelectedLayer: CSSProperties = {
  background: 'green',
};

const SlotContainer: CSSProperties = {
  marginLeft: '3px',
  display: 'flex',
  padding: '0 0 3px 0',
};

const SlotName: CSSProperties = {
  writingMode: 'vertical-lr',
  textOrientation: 'sideways',
  fontSize: '0.7em',
  padding: '5px 0 5px 2px',
  color: 'grey',
  background: 'rgba(0, 0, 0, 0.1)',
};

const SlotChildren: CSSProperties = {
  width: '100%',
};

const TitleBar: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
};

const AddBlock: CSSProperties = {
  flex: '1',
  width: '100%',
  justifySelf: 'stretch',
  alignSelf: 'stretch',
  background: 'rgba(0, 0, 255, 0.1)',
  color: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const AttributeEditor = () => {
  return (
    <SelectedNodeController
      HasSelectionComponent={AttributesController}
    ></SelectedNodeController>
  );
};

export const BigLayersOnly = () => (
  <BasicStory startingHtml={big}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <LayersController />
      </div>
      {/* <pre style={{ width: '50%' }}>{stateTuple[0]}</pre> */}
    </div>
  </BasicStory>
);
export const MintLayersOnly = () => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <LayersController />
      </div>
      {/* <pre style={{ width: '50%' }}>{stateTuple[0]}</pre> */}
    </div>
  </BasicStory>
);

export const SVGLayersOnly = () => (
  <BasicStory
    startingHtml={`
    <style>body { color:red; }</style>
    <svg  version="1.1"
    width="300" height="200"
    xmlns="http://www.w3.org/2000/svg"
    xmlsn:xlink="http://www.w3.org/2000/svg"
    xlink="http://www.w3.org/2000/svg">
    <clipPath></clipPath>
    <foreignObject></foreignObject>
    <linearGradient></linearGradient>
    <pattern></pattern>
    <radialGradient></radialGradient>
    <rect></rect>
    </svg>
  `}
    startingPackages={MintComponents}
  >
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <LayersController />
      </div>
      {/* <pre style={{ width: '50%' }}>{stateTuple[0]}</pre> */}
    </div>
  </BasicStory>
);

function Canvas() {
  useMolecule(CanvasSelectionMolecule);
  useMolecule(CanvasHoveredMolecule);
  useMolecule(CanvasPickAndPlopMolecule);
  return <BasicCanvasController />;
}

export const MintLayersFull = () => {
  return (
    <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '33%' }}>
          <LayersController />
        </div>
        <div style={{ width: '33%' }}>
          <CanvasProvider>
            <Canvas />
          </CanvasProvider>
        </div>
        <div style={{ width: '33%' }}>
          <AttributeEditor />
        </div>
        {/* <pre style={{ width: '50%' }}>{stateTuple[0]}</pre> */}
      </div>
    </BasicStory>
  );
};

const referralTableExamples = `
<sqm-referral-table
per-page="4"
hidden-columns="2"
more-label="Next"
prev-label="Prev"
show-labels
sm-breakpoint="599"
md-breakpoint="799"
>
<sqm-referral-table-user-column
  column-title="User"
  anonymous-user="Anonymous User"
  deleted-user="Deleted User"
></sqm-referral-table-user-column>
<sqm-referral-table-user-column
  column-title="User"
  anonymous-user="Anonymous User"
  deleted-user="Deleted User"
>
</sqm-referral-table-user-column>
<sqm-referral-table-status-column
  column-title="Referral status"
  converted-status-text="Converted"
  in-progress-status-text="In Progress"
>
</sqm-referral-table-status-column>
<sqm-referral-table-rewards-column
  column-title="Rewards"
  expiring-text="Expiring in"
  fuel-tank-text="Your code is"
  pending-for-text="{status} for {date}"
  reward-received-text="Reward received on"
  status-long-text="{status, select, AVAILABLE {Reward expiring on} CANCELLED {Reward cancelled on} PENDING {Available on} EXPIRED {Reward expired on} other {Not available} }"
  status-text="{status, select, AVAILABLE {Available} CANCELLED {Cancelled} PENDING {Pending} EXPIRED {Expired} REDEEMED {Redeemed} other {Not available} }"
>
</sqm-referral-table-rewards-column>
<sqm-referral-table-date-column
  column-title="Date referred"
  date-shown="dateReferralStarted"
>
</sqm-referral-table-date-column>
<sqm-empty
  slot="empty"
  empty-state-image="https://res.cloudinary.com/saasquatch/image/upload/v1644000223/squatch-assets/empty_referral2.png"
  empty-state-header="View your referral details"
  empty-state-text="Refer a friend to view the status of your referrals and rewards earned"
></sqm-empty>
</sqm-referral-table>
`;

export const ReferralTableFull = () => (
  <BasicStory
    startingHtml={referralTableExamples}
    startingPackages={MintComponents}
  >
    <div style={{ display: 'flex' }}>
      <div style={{ width: '33%' }}>
        <LayersController />
      </div>
      <div style={{ width: '33%' }}>
        <CanvasProvider>
          <CanvasFull />
        </CanvasProvider>
      </div>
      <div style={{ width: '33%' }}>
        <AttributeEditor />
      </div>
      {/* <pre style={{ width: '50%' }}>{stateTuple[0]}</pre> */}
    </div>
  </BasicStory>
);

export const VanillaLayersFull = () => (
  <BasicStory
    startingHtml={referrerWidget}
    startingPackages={VanillaComponents}
  >
    <div style={{ display: 'flex' }}>
      <div style={{ width: '33%' }}>
        <LayersController />
      </div>
      <div style={{ width: '33%' }}>
        <CanvasProvider>
          <CanvasFull />
        </CanvasProvider>
      </div>
      <div style={{ width: '33%' }}>
        <AttributeEditor />
      </div>
      {/* <pre style={{ width: '50%' }}>{stateTuple[0]}</pre> */}
    </div>
  </BasicStory>
);

export const LayersController: FC<{}> = () => {
  const atoms = useMolecule(LayersMolecule);
  const hasChildren = useAtomValue(atoms.RootHasChildren);

  return (
    <div data-layers>
      {' '}
      Don't re-render unless number of children changes!
      <div data-layers-root>
        <NodeScopeProvider nodeAtom={atoms.RootNodeAtom}>
          {hasChildren && (
            <SlotScopeProvider slot="">
              <NodeChildrenEditor Component={ElementLayer} />
            </SlotScopeProvider>
          )}
          {!hasChildren && <AddNew idx={0} />}
        </NodeScopeProvider>
      </div>
    </div>
  );
};

function AddNew(props: { idx: number; slot?: string }) {
  const atoms = useMolecule(LayersMolecule);
  const node = useAtomValue(useNodeAtom());
  const insert = useSetAtom(atoms.InsertNodeAtom);
  const comp = useAtomValue(atoms.ComponentModelAtom);

  const [open, setOpen] = useState(false);
  const validChildren = comp.getValidChildren(node, props.slot);
  if (validChildren.length <= 0) {
    return <></>;
  }
  return (
    <>
      {!open && (
        <div style={AddBlock} onClick={() => setOpen(true)}>
          <div>Insert</div>
        </div>
      )}
      {open && (
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {validChildren.map((b) => {
            const meta = comp.getComponentMeta(b.content.tagName);
            return (
              <button
                onClick={() => {
                  const cloned = clone(b.content) as RaisinElementNode;
                  // TODO: add "insert into slot" into core model?
                  props.slot && (cloned.attribs.slot = props.slot);
                  insert({
                    node: cloned,
                    parent: node as RaisinElementNode,
                    idx: props.idx,
                  });
                }}
              >
                {meta.title}
                <br />
                <small>{b.title}</small>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

const LayersMolecule = molecule((getMol) => {
  const { InsertNodeAtom } = getMol(EditMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const RootHasChildren = atom(
    (get) => (get(RootNodeAtom) as RaisinDocumentNode).children.length > 0
  );

  return {
    ...getMol(PickAndPlopMolecule),
    InsertNodeAtom,
    ComponentModelAtom,
    RootHasChildren,
    RootNodeAtom,
  };
});

function ElementLayer() {
  const {
    duplicateForNode,
    isNodeAnElement,
    isNodePicked,
    isSelectedForNode,
    nameForNode,
    nodeHovered,
    nodeSoul,
    removeForNode,
    setSelectedForNode,
    allSlotsForNode,
    togglePickNode,
  } = useMolecule(NodeMolecule);

  const atoms = useMolecule(LayersMolecule);
  const setSelected = useSetAtom(setSelectedForNode);
  const isAnElement = useAtomValue(isNodeAnElement);
  const isSelected = useAtomValue(isSelectedForNode);
  const isPicked = useAtomValue(isNodePicked);
  const [isHovered, setHovered] = useAtom(nodeHovered);
  const slots = useAtomValue(allSlotsForNode);

  const removeNode = useSetAtom(removeForNode);
  const duplicate = useSetAtom(duplicateForNode);
  const title = useAtomValue(nameForNode);
  const moveNode = useSetAtom(togglePickNode);
  const soul = useAtomValue(nodeSoul);

  const isPlopping = useAtomValue(atoms.PloppingIsActive);
  const canMove = isPicked || !isPlopping;
  // Don't render non-element layers
  if (!isAnElement) return <></>;

  const name = (
    <div style={TitleBar} onClick={setSelected} onMouseOver={setHovered}>
      <div style={Label}>
        {title} {isPicked && ' Moving...'} {soul.toString()}
      </div>
      <div>
        <button onClick={moveNode} disabled={!canMove}>
          {isPicked ? 'Cancel move' : 'Move'}
        </button>
        <button onClick={duplicate} disabled={isPlopping}>
          Dupe
        </button>
        <button onClick={removeNode} disabled={isPlopping}>
          Delete
        </button>
      </div>
    </div>
  );
  // const hasChildren = children?.length > 0;

  const hasSlots = slots?.length > 0;
  const style = {
    ...Layer,
    ...(isSelected ? SelectedLayer : {}),
    ...(isHovered ? { outline: '1px dashed green' } : {}),
  };

  return (
    <div data-element style={style}>
      {!hasSlots && name}
      {hasSlots && (
        <div>
          {name}
          {hasSlots && (
            <div>
              <SlotChildrenController Component={SlotWidget} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SlotWidget() {
  const atoms = useMolecule(SlotMolecule);
  const childNodes = useAtomValue(atoms.childrenInSlot);

  const slotDetails = useAtomValue(atoms.slotDetails);
  const slotWidget = slotDetails.editor;
  const hasEditor = slotWidget === 'inline';
  const isEmpty = (childNodes?.length ?? 0) <= 0;

  return (
    <>
      <div style={SlotContainer}>
        <div style={SlotName}>
          {slotDetails.title ?? slotDetails.name} ({childNodes.length})
        </div>
        {hasEditor && (
          // Rich Text Editor<>
          <NodeRichTextController />
        )}
        {!hasEditor && (
          // Block Editor
          <>
            {isEmpty && (
              <AddNew idx={childNodes?.length ?? 0} slot={slotDetails.name} />
            )}
            {!isEmpty && (
              <div style={SlotChildren}>
                <PlopTarget idx={0} slot={slotDetails.name} />
                {childNodes.length} children in this slot ({slotDetails.name})
                <ChildrenEditorForAtoms
                  childAtoms={childNodes}
                  Component={({ idx }) => <SlotChild idx={idx} atoms={atoms} />}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const SlotChild: React.FC<{ idx?: number; atoms: any }> = ({ idx, atoms }) => {
  return (
    <>
      <ElementLayer />
      <PlopTarget idx={idx ?? 0} slot={atoms.slotName} />
    </>
  );
};

function PlopTarget(props: { idx: number; slot: string }) {
  const { idx, slot } = props;
  const { canPlopHereAtom, plopNodeHere } = useMolecule(NodeMolecule);
  const canPlop = useAtomValue(canPlopHereAtom);
  const plopNode = useSetAtom(plopNodeHere);
  const plop = useCallback(() => plopNode({ idx, slot }), [idx, slot]);

  const isPloppablable = canPlop({ slot, idx });
  if (!isPloppablable) {
    return <></>;
  }
  return (
    <div style={{ border: '1px dashed red' }}>
      Position {idx} in {slot || 'content'}
      <button onClick={plop}>Plop</button>
    </div>
  );
}
