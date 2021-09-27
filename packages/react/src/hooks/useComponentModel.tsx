import {
  htmlParser as parse,
  htmlUtil,
  RaisinElementNode,
  RaisinTextNode
} from '@raisins/core';
import { ElementType } from 'domelementtype';
import { useState } from 'react';
import { NewState } from '../../../core/dist/util/NewState';
import { CustomElement, Slot } from '../component-metamodel/Component';
import * as HTMLComponents from '../component-metamodel/HTMLComponents';
import { NodeWithSlots } from '../model/EditorModel';
import { getSlots } from '../model/getSlots';
import { PackageJson, unpkgNpmRegistry } from '../util/NPMRegistry';


const { visit } = htmlUtil;

const DefaultSlot: Slot = {
  name: '',
  summary: 'Default slot',
};
const SquatchComponents: CustomElement[] = [
  {
    tagName: 'sqh-global-container',
    title: 'Container',
    slots: [{ ...DefaultSlot, validChildren: ['*'] }],
  },
  { tagName: 'sqh-text-component', title: 'Text' },
  { tagName: 'sqh-copy-link-button', title: 'Sharelink' },
  { tagName: 'sqh-share-button-container', title: 'Share Buttons' },
  {
    tagName: 'sqh-stats-container',
    title: 'Stats',
    slots: [{ ...DefaultSlot, validChildren: ['sqh-stat-component'] }],
  },
  {
    tagName: 'sqh-stat-component',
    title: 'Stat',
    validParents: ['sqh-stats-container'],
  },
  { tagName: 'sqh-referral-list', title: 'Referrals' },
  // TODO: Need a `getParentSlot` method to make `orientation` useful in UI
  {
    tagName: 'sqh-grid',
    title: '3 Col Grid',
    slots: [
      { ...DefaultSlot, orientation: 'left-right', validChildren: ['sqh-column'] },
    ],
  },
  {
    tagName: 'sqh-column',
    title: 'Column',
    validParents: ['sqh-grid'],
    slots: [{ ...DefaultSlot, validChildren: ['*'] }],
  },
];

const ShoelaceComponents: CustomElement[] = [
  { tagName: 'sl-tab-group', title: 'Tab Group' },
  { tagName: 'sl-tab', title: 'Tab' },
  { tagName: 'sl-tab-panel', title: 'Tab Panel' },
  { tagName: 'sl-details', title: 'Hide/Show' },
  { tagName: 'sl-card', title: 'Card' },
];

const blocks: RaisinElementNode[] = [
  {
    type: ElementType.Tag,
    tagName: 'div',
    nodeType: 1,
    attribs: {},
    children: [
      { type: ElementType.Text, data: 'I am a div' } as RaisinTextNode,
    ],
  },
  blockFromHtml(`<sqh-stat-component></sqh-stat-component>`),
  blockFromHtml(`<sqh-copy-link-button 
  ishidden="false"
  copysuccess="copied!"
  copyfailure="Press Ctrl+C to copy"
  text="Copy"
  buttoncolor="#5C6164"
  textcolor="#FFFFFF">
  </sqh-copy-link-button>`),
  blockFromHtml(`<sqh-referral-list
  ishidden="false"
  showreferrer="true"
  usefirstreward="false"
  referralnamecolor="darkslategray"
  referraltextcolor="lightgray"
  rewardcolor="#4BB543"
  pendingcolor="lightgray"
  pendingvalue="Reward Pending"
  referrervalue="Referred"
  referrercontent="Referred you {date}"
  convertedcontent="Signed up, referred {date}"
  pendingcontent="Trial user, referred {date}"
  valuecontent="and {extrarewards} more {extrarewards, plural, one {reward} other {rewards}}"
  expiredcolor="lightgray"
  expiredvalue="Expired Reward"
  expiredcontent="Signed up, referred {date}"
  cancelledcolor="#C81D05"
  cancelledvalue="Cancelled Reward"
  cancelledcontent="Signed up, referred {date}"
  paginatemore="View More"
  paginateless="Previous"
  noreferralsyet="No Referrals Yet..."
  unknownuser="Your Friend"
  redeemedvalue="Redeemed"
>
</sqh-referral-list>
`),
  blockFromHtml(`<sqh-stats-container ishidden="false" paddingtop="0" paddingbottom="0">
  <sqh-stat-component ishidden="false" statcolor="#4caf50" stattype="/referralsCount" statdescription="Friends Referred" paddingtop="10" paddingbottom="10">
  </sqh-stat-component>
  <sqh-stat-component ishidden="false" stattype="/rewardsCount" statdescription="Total Rewards" paddingtop="10" paddingbottom="10" statcolor="#000000">
  </sqh-stat-component>
  <sqh-stat-component
    ishidden="false"
    stattype="/rewardBalance/CREDIT/CENTS/prettyAssignedCredit"
    statdescription="Credit earned"
    paddingtop="10"
    paddingbottom="10"
    statcolor="#000000"
  >
  </sqh-stat-component>
</sqh-stats-container>`),
  blockFromHtml(`<sqh-share-button-container
  ishidden="false"
  emaildisplayrule="mobile-and-desktop"
  emailtext="Email"
  emailtextcolor="#ffffff"
  emailbackgroundcolor="#4b4d50"
  facebookdisplayrule="mobile-and-desktop"
  facebooktext="Facebook"
  facebooktextcolor="#ffffff"
  facebookbackgroundcolor="#234079"
  twitterdisplayrule="mobile-and-desktop"
  twittertext="Twitter"
  twittertextcolor="#ffffff"
  twitterbackgroundcolor="#4797d2"
  smsdisplayrule="mobile-only"
  smstext="SMS"
  smstextcolor="#ffffff"
  smsbackgroundcolor="#7bbf38"
  whatsappdisplayrule="mobile-only"
  whatsapptext="Whatspp"
  whatsapptextcolor="#ffffff"
  whatsappbackgroundcolor="#25D366"
  linkedindisplayrule="hidden"
  linkedintext="LinkedIn"
  linkedintextcolor="#ffffff"
  linkedinbackgroundcolor="#0084b9"
  pinterestdisplayrule="hidden"
  pinteresttext="Pinterest"
  pinteresttextcolor="#ffffff"
  pinterestbackgroundcolor="#cb2027"
  messengerdisplayrule="hidden"
  messengertext="Messenger"
  messengertextcolor="#ffffff"
  messengerbackgroundcolor="#0084ff"
  linedisplayrule="mobile-only"
  linetext="Line Messenger"
  linetextcolor="#ffffff"
  linebackgroundcolor="#00c300"
>
</sqh-share-button-container>`),
  blockFromHtml(`<sl-tab-group>
<sl-tab slot="nav" panel="tab1">Tab 1</sl-tab>
<sl-tab slot="nav" panel="tab2">Tab 2</sl-tab>

<sl-tab-panel name="tab1"><span>This is the tab 1 panel.</span></sl-tab-panel>
<sl-tab-panel name="tab2"><span>This is the tab 2 panel.</span></sl-tab-panel>
</sl-tab-group>`),
  blockFromHtml(`<sl-details summary="Toggle Me">
<div>I am content inside of a thing</div></sl-details>`),
  blockFromHtml(`<sl-card class="card-overview">
<img 
  slot="image" 
  src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80" 
  alt="A kitten sits patiently between a terracotta pot and decorative grasses."
>

<strong>Mittens</strong><br>
This kitten is as cute as he is playful. Bring him home today!<br>
<small>6 weeks old</small>

<div slot="footer">
  <sl-button type="primary" pill>More Info</sl-button>
  <sl-rating></sl-rating>
</div>
</sl-card>`),
  blockFromHtml(`<sqh-grid class="flex-grid-thirds">
<sqh-column><span>This little piggy went to market.</span></sqh-column>
<sqh-column><span>This little piggy went to market.</span></sqh-column>
<sqh-column><span>This little piggy went to market.</span></sqh-column>
</sqh-grid>`),
  blockFromHtml(`<sl-form class="form-overview">
<sl-input name="name" type="text" label="Name"></sl-input>
<br>
<sl-select name="favorite" label="Select your favorite">
  <sl-menu-item value="birds">Birds</sl-menu-item>
  <sl-menu-item value="cats">Cats</sl-menu-item>
  <sl-menu-item value="dogs">Dogs</sl-menu-item>
</sl-select>
<br>
<sl-checkbox name="agree" value="yes">
  I totally agree
</sl-checkbox>
<br><br>
<sl-button submit>Submit</sl-button>
</sl-form>
`),
].filter((x) => typeof x !== 'undefined') as RaisinElementNode[];

const components: CustomElement[] = [
  ...Object.values(HTMLComponents),
  ...SquatchComponents,
  ...ShoelaceComponents,
];

type InternalState = {
  modules: Module[];
  loading: boolean;
  moduleDetails: ModuleDetails[];
};

/**
 * For managing the types of components that are edited and their properties
 */
export function useComponentModel() {
  const [_internalState, _setInternal] = useState<InternalState>({
    loading: false,
    modules: [],
    moduleDetails: [],
  });
  const setModules = (m: NewState<Module[]>) => {
    _setInternal((i) => {
      const next = typeof m === 'function' ? m(i.modules) : m;

      (async () => {
        const details: ModuleDetails[] = [];
        for (const module of next) {
          const detail = await unpkgNpmRegistry.getPackageJson(module);
          details.push({
            ...module,
            'package.json': detail,
          });
        }
        _setInternal({
          loading: false,
          modules: next,
          moduleDetails: details,
        });
      })();
      return {
        modules: next,
        loading: true,
        moduleDetails: i.moduleDetails,
      };
    });
  };
  const addModule: (module: Module) => void = (module) =>
    setModules((modules) => [...modules, module]);
  const removeModule: (module: Module) => void = (module) =>
    setModules((modules) => modules.filter((e) => e !== module));
  const removeModuleByName: (name: string) => void = (name) =>
    setModules((modules) => modules.filter((e) => e.name !== name));

  function getComponentMeta(node: RaisinElementNode): CustomElement {
    const found = components.find((c) => c.tagName === node.tagName);
    if (found) return found;

    return {
      tagName: node.tagName,
      title: node.tagName,
      slots: [{ name: '', summary: 'Default slot' }],
    };
  }

  function isValidChild(
    from: RaisinElementNode,
    to: RaisinElementNode,
    slot: string
  ) {
    if (from === to) {
      // Can't drop into yourself
      return false;
    }
    const slots = getComponentMeta(to)?.slots;
    const slotMeta = slots?.find((s) => s.name === slot);
    if (!slotMeta) return false;

    const element = visit(from, {
      onElement: (n) => n,
    });
    const parentAllowsChild =
      slotMeta.validChildren?.includes('*') ||
      (element?.tagName && slotMeta.validChildren?.includes(element?.tagName)) ||
      false;

    const childMeta = getComponentMeta(from);
    const childAllowsParents = doesChildAllowParent(childMeta, to);

    return parentAllowsChild && childAllowsParents;
  }

  function getValidChildren(
    node: RaisinElementNode,
    slot: string
  ): RaisinElementNode[] {
    const slots = getComponentMeta(node)?.slots;
    if (!slots) {
      // No documented slots
      return [];
    }
    const slotMeta = slots.find((s) => s.name === slot);
    if (!slotMeta) {
      // No slot meta for slot
      return [];
    }
    const { validChildren: childTags } = slotMeta;
    if (!Array.isArray(childTags) || childTags.length < 1) {
      // No valid children
      return [];
    }
    const filter = (block: RaisinElementNode) => {
      const parentAllowsChild =
        childTags?.includes('*') || childTags?.includes(block.tagName);
      const childMeta = getComponentMeta(block);
      const childAllowsParents = doesChildAllowParent(childMeta, node);
      return parentAllowsChild && childAllowsParents;
    };
    const validChildren = blocks.filter(filter);
    if (!validChildren.length) {
      return [];
    }
    return validChildren;
  }

  function canHaveChildren(node: RaisinElementNode, slot: string): boolean {
    return getValidChildren(node, slot).length > 0;
  }

  function getSlotsInternal(node: RaisinElementNode): NodeWithSlots {
    return getSlots(node, getComponentMeta)!;
  }

  return {
    loadingModules: _internalState.loading,
    modules: _internalState.moduleDetails,
    moduleDetails: _internalState.moduleDetails,
    addModule,
    removeModule,
    removeModuleByName,
    setModules,
    getComponentMeta,
    getSlots: getSlotsInternal,
    blocks,
    getValidChildren,
    canHaveChildren,
    isValidChild,
  };
}

export type Module = {
  name: string;
  version?: string;
  filePath?: string;
};

export type ModuleDetails = {
  'package.json': PackageJson;
} & Module;

export type ComponentModel = {
  loadingModules: boolean;
  modules: Module[];
  moduleDetails: ModuleDetails[];
  addModule(module: Module): void;
  removeModule(module: Module): void;
  removeModuleByName(name: string): void;
  setModules(moduleS: Module[]): void;
  getComponentMeta: (node: RaisinElementNode) => CustomElement;
  getSlots: (node: RaisinElementNode) => NodeWithSlots;
  blocks: RaisinElementNode[];
  getValidChildren: (
    node: RaisinElementNode,
    slot: string
  ) => RaisinElementNode[];
  canHaveChildren: (node: RaisinElementNode, slot: string) => boolean;
  isValidChild: (
    from: RaisinElementNode,
    to: RaisinElementNode,
    slot: string
  ) => boolean;
};

function doesChildAllowParent(childMeta: CustomElement, to: RaisinElementNode) {
  const childHasRestrictions =
    Array.isArray(childMeta?.validParents) && childMeta.validParents.length > 0;

  const childAllowsParents =
    !childHasRestrictions || childMeta.validParents!.includes(to.tagName);
  return childAllowsParents;
}

function blockFromHtml(html: string): RaisinElementNode | undefined {
  try {
    return parse(html).children[0] as RaisinElementNode;
  } catch (e) {
    return undefined;
  }
}
