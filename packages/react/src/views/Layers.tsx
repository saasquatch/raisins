import { htmlUtil, RaisinDocumentNode, RaisinElementNode } from '@raisins/core';
import { atom, useAtom, useSetAtom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import { useAtomValue } from 'jotai/utils';
import React, { CSSProperties, FC, useCallback, useState } from 'react';
import { ComponentModelMolecule } from '../component-metamodel/ComponentModel';
import { CoreMolecule } from '../core/CoreAtoms';
import { EditMolecule } from '../core/editting/EditAtoms';
import { PickedNodeMolecule } from '../core/selection/PickedNode';
import {
  ChildrenEditor,
  ChildrenEditorForAtoms,
} from '../node/children/ChildrenEditor';
import { NodeMolecule } from '../node/NodeMolecule';
import { NodeAtomProvider, useNodeAtom } from '../node/NodeScope';
import { SlotMolecule, SlotScopeProvider } from '../node/slots/SlotScope';
import { RichTextEditorForAtom } from '../rich-text/RichTextEditor';
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

export const LayersController: FC<{}> = () => {
  const atoms = useMolecule(LayersMolecule);
  const hasChildren = useAtomValue(atoms.RootHasChildren);

  return (
    <div data-layers>
      {' '}
      Don't re-render unless number of children changes!
      <div data-layers-root>
        <NodeAtomProvider nodeAtom={atoms.RootNodeAtom}>
          {hasChildren && (
            <SlotScopeProvider slot="">
              <ChildrenEditor Component={ElementLayer} />
            </SlotScopeProvider>
          )}
          {!hasChildren && <AddNew idx={0} />}
        </NodeAtomProvider>
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
    ...getMol(PickedNodeMolecule),
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
    childSlotsAtom,
    togglePickNode,
  } = useMolecule(NodeMolecule);

  const slotMol = useMolecule(SlotMolecule);
  const atoms = useMolecule(LayersMolecule);
  const setSelected = useSetAtom(setSelectedForNode);
  const isAnElement = useAtomValue(isNodeAnElement);
  const isSelected = useAtomValue(isSelectedForNode);
  const isPicked = useAtomValue(isNodePicked);
  const [isHovered, setHovered] = useAtom(nodeHovered);
  const slots = useAtomValue(childSlotsAtom);

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
              {/* {slots.map((s) => (
                <SlotScopeProvider slot={s} key={s}>
                  <SlotWidget />
                </SlotScopeProvider>
              ))} */}
            </div>
          )}{' '}
        </div>
      )}
    </div>
  );
}

// function SlotWidget() {
//   const atoms = useMolecule(SlotMolecule);
//   const childNodes = useAtomValue(atoms.childrenInSlot);

//   const slotDetails = useAtomValue(atoms.slotDetails);
//   const slotWidget = slotDetails.editor;
//   const hasEditor = slotWidget === 'inline';
//   const isEmpty = (childNodes?.length ?? 0) <= 0;

//   return (
//     <>
//       <div style={SlotContainer}>
//         <div style={SlotName}>
//           {slotDetails.title ?? slotDetails.name} ({childNodes.length})
//         </div>
//         {hasEditor && (
//           // Rich Text Editor<>
//           <RichTextEditorForAtom />
//         )}
//         {!hasEditor && (
//           // Block Editor
//           <>
//             {isEmpty && (
//               <AddNew idx={childNodes?.length ?? 0} slot={slotDetails.name} />
//             )}
//             {!isEmpty && (
//               <div style={SlotChildren}>
//                 <PlopTarget idx={0} slot={slotDetails.name} />
//                 <ChildrenEditorForAtoms
//                   childAtoms={childNodes}
//                   Component={SlotChild}
//                 />
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </>
//   );
// }

// const SlotChild: React.FC<{ idx: number }> = ({ idx }: { idx: number }) => {
//   const atoms = useMolecule(SlotMolecule);
//   return (
//     <>
//       <ElementLayer />
//       <PlopTarget idx={idx} slot={atoms.slotName} />
//     </>
//   );
// };

function PlopTarget({ idx, slot }: { idx: number; slot: string }) {
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
