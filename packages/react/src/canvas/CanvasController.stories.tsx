import { DefaultTextMarks } from '@raisins/core';
import { Meta } from '@storybook/react';
import { Atom, useAtomValue } from 'jotai';
import { useMolecule } from 'bunshi/react';
import React, { useState } from 'react';
import {
  big,
  MintComponents,
  mintMono,
  mintTimelineNewlines,
  mintTimelineTrimmed,
} from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
import { example } from '../node/children/LoadTest.example';
import { SelectedNodeRichTextEditor } from '../rich-text/SelectedNodeRichTextEditor';
import { CanvasProvider } from './CanvasScope';
import { BasicCanvasController, CanvasController } from './index';
import {
  CanvasHoveredMolecule,
  CanvasPickAndPlopMolecule,
  CanvasSelectionMolecule,
} from './plugins';
import { Rect } from './types';

export const LoadTest = () => {
  return (
    <BasicStory startingHtml={example}>
      <CanvasController />
    </BasicStory>
  );
};

export const LoadTestFull = () => {
  return (
    <BasicStory startingHtml={example}>
      <CanvasProvider>
        <CanvasFull />
      </CanvasProvider>
    </BasicStory>
  );
};

export const UninteractibleTextFull = () => {
  const inlineHtml = DefaultTextMarks.map(
    tagName => `<${tagName}>${tagName}</${tagName}>`
  ).join('&nbsp;');
  return (
    <BasicStory startingHtml={`<div>${inlineHtml}</div>`}>
      <CanvasProvider>
        <CanvasFull />
      </CanvasProvider>
    </BasicStory>
  );
};

const CanvasStory = ({ html }: { html: string }) => {
  const [canvasType, setCanvasType] = useState<keyof typeof CanvasTypes>(
    'BasicCanvas'
  );
  const CanvasComponent = CanvasTypes[canvasType];
  return (
    <BasicStory startingHtml={html}>
      <CanvasComponent />
    </BasicStory>
  );
};

const CanvasWithHover = () => {
  useMolecule(CanvasHoveredMolecule);
  return <BasicCanvasController />;
};
const CanvasWithSelection = () => {
  useMolecule(CanvasSelectionMolecule);
  return <BasicCanvasController />;
};

export const CanvasFull = () => {
  useMolecule(CanvasSelectionMolecule);
  useMolecule(CanvasHoveredMolecule);
  useMolecule(CanvasPickAndPlopMolecule);
  return (
    <div style={{ position: 'relative' }}>
      <Toolbars />
      <BasicCanvasController />
    </div>
  );
};

const CanvasTypes = {
  BasicCanvas: CanvasController,
  CanvasFull,
  CanvasWithHover,
  CanvasWithSelection,
};

export const BigCanvasFull = () => <BigCanvasOnly Component={CanvasFull} />;

const templateSwitcherExample = `
<template-switcher>
   <template slot="one"><div>I am template 1 for slot 1</div></template>
   <template slot="one"><div>I am template 2 for slot 1</div></template>
   <template slot="two"><div>I am template 3 for slot 2</div></template>
   <template slot="two"><div>I am template 4 for slot 2</div></template>
</template-switcher>


<script>
class TemplateSwitcher extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
    this._state = 1;

    const shadow = this.attachShadow({mode: 'open'});
    this.render();
    

   this.shadowRoot.innerHTML = \`<div style="padding: 20px; border: 1px dashed red;">Shadow root. <button>switch</button> <slot name="one">Default one</slot><slot name="two">default two</slot><slot name="shown">Shown slot</div></div>\`

   this.shadowRoot.querySelector("button").addEventListener("click",()=>{
    	this._state = this._state + 1;
      this.render();
    })
    
  }

	/**
  * Removes the previously slotted content
  */
	cleanup(){
    const previous = Array.from(this.querySelectorAll("*")).filter(e=>e.slot==="shown");
  	previous.forEach(p=> this.removeChild(p) )
  }
  render(){
  	const oneOrTwo = this._state % 2 === 0 ? "one" : "two";   
		const templates = Array.from(this.querySelectorAll("template")).filter(e=>e.slot===oneOrTwo);
  	this.cleanup();
    templates.map(t=>{
       const clone = t.content.cloneNode(true);
       const wrapper = document.createElement("div");
       wrapper.slot = "shown";
       wrapper.appendChild(clone);
	     this.appendChild(wrapper);
    })

  }

  connectedCallback() {
    console.log('Custom square element added to page.');
  }

  disconnectedCallback() {
    console.log('Custom square element removed from page.');
  }

  adoptedCallback() {
    console.log('Custom square element moved to new page.');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('Custom square element attributes changed.');
  }
}

customElements.define('template-switcher', TemplateSwitcher);
</script>
`
const basicTemplateHTML = `<style>template{border: 1px dashed red; padding: 20px; display:block;}</style><template>I am inside a template</template>`;
export const TemplateTags = () => <CanvasStory html={basicTemplateHTML} />;
export const TemplateSwitcher = () => <CanvasStory html={templateSwitcherExample} />;

export const BigCanvasWithHover = () => (
  <BigCanvasOnly Component={CanvasWithHover} />
);
export const BigCanvasWithSelection = () => (
  <BigCanvasOnly Component={CanvasWithSelection} />
);
export const BigCanvasOnly = ({ Component = BasicCanvasController }) => (
  <BasicStory startingHtml={big}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
    </div>
  </BasicStory>
);

export const Toolbars = () => {
  const { PickedRectAtom } = useMolecule(CanvasPickAndPlopMolecule);
  const { SelectedRectAtom } = useMolecule(CanvasSelectionMolecule);
  const { HoveredRectAtom } = useMolecule(CanvasHoveredMolecule);

  return (
    <>
      <PositionedToolbar rectAtom={HoveredRectAtom}>Hovered</PositionedToolbar>
      <PositionedToolbar rectAtom={SelectedRectAtom}>
        Selected
        <SelectedNodeRichTextEditor />
      </PositionedToolbar>
      <PositionedToolbar rectAtom={PickedRectAtom}>Picked</PositionedToolbar>
    </>
  );
};
const PositionedToolbar = ({
  rectAtom,
  children,
}: {
  rectAtom: Atom<Rect | undefined>;
  children: React.ReactNode;
}) => {
  const rect = useAtomValue(rectAtom);
  if (!rect)
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, display: 'none' }} />
    );

  const { x, y, width, height } = rect;

  return (
    <div
      style={{
        background: 'green',
        color: 'white',
        position: 'absolute',
        top: y + height,
        left: x - 2,
        width: width + 'px',
        minWidth: '200px',
      }}
    >
      {children}
    </div>
  );
};

export const MintCanvasOnly = ({ Component = BasicCanvasController }) => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
    </div>
  </BasicStory>
);

export const MintCanvasFull = () => <MintCanvasOnly Component={CanvasFull} />;

export const TimelineCanvasFull = () => (
  <BasicStory
    startingHtml={mintTimelineNewlines}
    startingPackages={MintComponents}
  >
    <CanvasProvider>
      <CanvasFull />
    </CanvasProvider>
  </BasicStory>
);

export const TimelineTrimmedCanvasFull = () => (
  <BasicStory
    startingHtml={mintTimelineTrimmed}
    startingPackages={MintComponents}
  >
    <CanvasProvider>
      <CanvasFull />
    </CanvasProvider>
  </BasicStory>
);

export const MintCanvasWithHover = () => (
  <MintCanvasOnly Component={CanvasWithHover} />
);

export const SQMText = ({ Component = BasicCanvasController }) => (
  <BasicStory
    startingHtml={`<div>First</div><div>Before</div><sqm-text>in sqm-text</sqm-text><div>After</div>`}
    startingPackages={MintComponents}
  >
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
      <div style={{ width: '50%' }}>
        <CanvasProvider>
          <Component />
        </CanvasProvider>
      </div>
    </div>
  </BasicStory>
);

export const SQMTextFull = () => <SQMText Component={CanvasFull} />;

export const SVGWithoutNamespace = () => (
  <SVGExample
    html={`<svg>
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`}
  />
);

export const SVGWithNamespace = () => (
  <SVGExample
    html={`<svg xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`}
  />
);

export const SVGWithXLinkButNoElements = () => (
  <SVGExample
    html={`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`}
  />
);

export const SVGWithXlinkNamespace = () => (
  <SVGExample
    html={`<svg xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink">
<script xlink:href="cool-script.js" type="text/ecmascript"/>
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`}
  />
);

export const SVGWithXlinkButNoNamespace = () => (
  <SVGExample
    html={`<svg xmlns="http://www.w3.org/2000/svg">
<script xlink:href="cool-script.js" type="text/ecmascript"/>
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`}
  />
);
const SVGExample = ({ html = '' }) => (
  <BasicStory startingHtml={html} startingPackages={[]}>
    <CanvasProvider>
      <BasicCanvasController />
    </CanvasProvider>
  </BasicStory>
);

const meta: Meta = {
  title: 'Canvas Controller',
  excludeStories: ['CanvasFull'],
  argTypes: {
    CanvasType: {
      options: Object.keys(CanvasTypes),
      control: { type: 'select' },
    },
  },
};
export default meta;
