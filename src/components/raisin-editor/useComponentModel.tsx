import { ComponentType } from '../../model/Component';

import * as HTMLComponents from '../../model/HTMLComponents';
import { RaisinElementNode, RaisinTextNode } from '../../model/RaisinNode';
import { ElementType } from 'domelementtype';
import { parse } from '../../model/parser';

const SquatchComponents: ComponentType[] = [
  { tagName: 'sqh-global-container', title: 'Container' },
  { tagName: 'sqh-text-component', title: 'Text' },
  { tagName: 'sqh-copy-link-button', title: 'Sharelink' },
  { tagName: 'sqh-share-button-container', title: 'Share Buttons' },
  { tagName: 'sqh-stats-container', title: 'Stats' },
  { tagName: 'sqh-stat-component', title: 'Stat' },
  { tagName: 'sqh-referral-list', title: 'Referrals' },
  { tagName: 'sqh-grid', title: '3 Col Grid' },
  { tagName: 'sqh-column', title: 'Column' },
];

const ShoelaceComponents: ComponentType[] = [
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
    children: [{ type: ElementType.Text, data: 'I am a div' } as RaisinTextNode],
  },
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
].filter(x => typeof x !== 'undefined') as RaisinElementNode[];

const components: ComponentType[] = [...Object.values(HTMLComponents), ...SquatchComponents, ...ShoelaceComponents];
/**
 * For managing the types of components that are edited and their properties
 */
export function useComponentModel() {
  function getComponentMeta(node: RaisinElementNode): ComponentType {
    const found = components.find(c => c.tagName === node.tagName);
    if (found) return found;

    return {
      tagName: node.tagName,
      title: node.tagName,
      slots: [{ key: '', title: 'Default slot' }],
    };
  }

  return {
    getComponentMeta,
    blocks,
  };
}

function blockFromHtml(html: string): RaisinElementNode {
  try {
    return parse(html).children[0] as RaisinElementNode;
  } catch (e) {
    return undefined;
  }
}
