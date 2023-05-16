export const MintComponents = [
  // {
  //   package: '@saasquatch/mint-components',
  //   filePath: '/dist/mint-components/mint-components.css',
  //   version: '1.6.1-2',
  // },
  {
    package: '@saasquatch/bedrock-components',
    version: '1.3.2-7',
  },
  {
    package: '@saasquatch/mint-components',
    version: '1.6.1-40',
  },
  // {
  //   package: '@local',
  //   version: 'next',
  // },
];

export const NextComponents = [
  {
    package: '@saasquatch/bedrock-components',
    version: 'next',
  },
  {
    package: '@saasquatch/mint-components',
    version: 'next',
  },
];

export const LocalBedrockComponents = [
  // {
  //   package: '@saasquatch/mint-components',
  //   filePath: '/dist/mint-components/mint-components.css',
  //   version: '1.6.1-2',
  // },

  {
    package: '@saasquatch/mint-components',
    version: '1.6.8-22',
  },
  {
    package: '@local',
    version: 'next',
  },
];

export const mintBigStat = `<sqm-big-stat flex-reverse="true" alignment="left" stat-type="/referralsCount">`;

export const mintHeroImage = `<sqm-hero-image
image-url="https://res.cloudinary.com/saasquatch/image/upload/v1644000275/squatch-assets/yr6ER3R.png"
header="Klip Rewards"
description="Refer friends and complete tasks while using Klip to earn rewards"
layout="columns"
image-pos="right"
background-color="#F9F9F9"
>
</sqm-hero-image>`;

export const mintTaskCard = `<sqm-task-card
reward-amount="50"
card-title="Follow Us on Twitter"
description="Earn 50 points when you follow us on Twitter!"
button-text="Follow"
button-link="https://twitter.com/"
goal="1"
stat-type="/programGoals/count/Follow-on-Social-Media"
open-new-tab="true"
event-key="socialFollow"
program-id="klip-loyalty"
>
</sqm-task-card>`;

export const mintReferralTable = `
<sqm-referral-table per-page="4" hidden-columns="2">
<sqm-referral-table-user-column column-title="User">
</sqm-referral-table-user-column>
<sqm-referral-table-status-column column-title="Referral status">
</sqm-referral-table-status-column>
<sqm-referral-table-rewards-column>
</sqm-referral-table-rewards-column>
<sqm-referral-table-date-column
  column-title="Date referred"
  date-shown="dateReferralStarted"
>
</sqm-referral-table-date-column>
<sqm-empty
  empty-state-image="https://res.cloudinary.com/saasquatch/image/upload/v1644000223/squatch-assets/empty_referral2.png"
  empty-state-header="View your referral details"
  empty-state-text="Refer a friend to view the status of your referrals and rewards earned"
></sqm-empty>
</sqm-referral-table>
`;

export const mintTimelineTrimmed = `
<sqm-timeline icon="circle"><sqm-timeline-entry reward="$50" unit="visa giftcard" desc="Your friend purchases a Business plan" icon="circle"></sqm-timeline-entry><sqm-timeline-entry reward="$200" unit="visa giftcard" desc="Our sales team qualifies your friend as a good fit for our Enterprise plan" icon="circle"></sqm-timeline-entry><sqm-timeline-entry reward="$1000" unit="visa giftcard" desc="Your friend purchases an Enterprise plan" icon="circle"></sqm-timeline-entry></sqm-timeline>`;

export const mintTimelineNewlines = `
<sqm-timeline icon="circle">
<sqm-timeline-entry reward="$50" unit="visa giftcard" desc="Your friend purchases a Business plan" icon="circle">
</sqm-timeline-entry>
<sqm-timeline-entry reward="$200" unit="visa giftcard" desc="Our sales team qualifies your friend as a good fit for our Enterprise plan" icon="circle">
</sqm-timeline-entry>
<sqm-timeline-entry reward="$1000" unit="visa giftcard" desc="Your friend purchases an Enterprise plan" icon="circle">
</sqm-timeline-entry>
</sqm-timeline>
`;

export const mintTitledSection = `
<div>
<h1>Heading</h1>
</div>
<sqm-titled-section text-align="center" label-margin="xxx-small">
  <h3 slot="label">Share $50 with friends</h3>
  <p slot="content">
    They'll get a $50 credit towards a new account and you'll get up
    to $1200
  </p>
</sqm-titled-section>
`;

export const mintMono = `<sqm-brand brand-color="#4225c4" brand-font="Nunito Sans">
<sqm-portal-container direction="column" padding="small" gap="xxx-large">
  <sqm-portal-container direction="column" padding="none" gap="xxx-large">
    <sqm-hero-image
      image-url="https://res.cloudinary.com/saasquatch/image/upload/v1644000275/squatch-assets/yr6ER3R.png"
      header="Klip Rewards"
      description="Refer friends and complete tasks while using Klip to earn rewards"
      layout="columns"
      image-pos="right"
      background-color="#F9F9F9"
    >
    </sqm-hero-image>
  </sqm-portal-container>
  <sqm-portal-container
    direction="column"
    padding="none"
    gap="xxx-large"
    max-width="770px"
    center
  >
    <sqm-portal-container
      direction="row"
      center
      display="flex"
      justify-content="space-between"
    >
      <sqm-stat-container space="xxx-large" display="flex">
        <sqm-big-stat
          flex-reverse="true"
          alignment="left"
          stat-type="/referralsCount"
        >
          <sqm-text>
            <p>Referrals</p>
          </sqm-text>
        </sqm-big-stat>
        <sqm-big-stat
          flex-reverse="true"
          alignment="left"
          stat-type="/integrationRewardsCountFiltered/AVAILABLE/global"
        >
          <sqm-text>
            <p>Giftcards Earned</p>
          </sqm-text>
        </sqm-big-stat>
        <sqm-big-stat
          flex-reverse="true"
          alignment="left"
          stat-type="/rewardBalance/CREDIT/POINT/value/global"
        >
          <sqm-text>
            <p>Points Balance</p>
          </sqm-text>
        </sqm-big-stat>
      </sqm-stat-container>
      <sqm-scroll
        scroll-id="tab-3"
        outline
        button-type="primary"
        button-text="Redeem your rewards"
        outline
        mobile
      ></sqm-scroll>
    </sqm-portal-container>

    <sqm-portal-container gap="xx-large">
      <sqm-titled-section text-align="center" label-margin="xxx-small">
        <sqm-text slot="label">
          <h3>Share $50 with friends</h3>
        </sqm-text>
        <sqm-text slot="content">
          <p>
            They'll get a $50 credit towards a new account and you'll get up
            to $1200
          </p>
        </sqm-text>
      </sqm-titled-section>
      <sqm-referral-card>
        <sqm-portal-container gap="large" slot="left">
          <sqm-text>Get rewarded when your friend uses Klip </sqm-text>
          <sqm-timeline icon="circle">
            <sqm-timeline-entry
              reward="75"
              unit="points"
              desc="Your friends signs up for a free trial"
            >
            </sqm-timeline-entry>
            <sqm-timeline-entry
              reward="$50"
              unit="visa giftcard"
              desc="Your friends signs up for Klip Business"
            >
            </sqm-timeline-entry>
            <sqm-timeline-entry
              reward="$200"
              unit="visa giftcard"
              desc="Your friend qualifies as a good fit for Klip Enterprise"
            >
            </sqm-timeline-entry>
            <sqm-timeline-entry
              reward="$1000"
              unit="visa giftcard"
              desc="Your friend purchases Klip Enterprise"
            >
            </sqm-timeline-entry>
          </sqm-timeline>
        </sqm-portal-container>
        <sqm-portal-container gap="large" slot="right">
          <sqm-text>Choose how you want to share: </sqm-text>
          <sqm-text>
            <sub>Your unique referral link:</sub>
            <sqm-share-link> </sqm-share-link>
          </sqm-text>
          <sqm-portal-container gap="x-small">
            <sqm-share-button medium="email">
              Share via email
            </sqm-share-button>
            <sqm-share-button medium="linkedin">
              Share on LinkedIn
            </sqm-share-button>
            <sqm-share-button medium="twitter">
              Tweet about us
            </sqm-share-button>
          </sqm-portal-container>
        </sqm-portal-container>
      </sqm-referral-card>
    </sqm-portal-container>

    <sqm-portal-container gap="xx-large">
      <sqm-titled-section text-align="center" label-margin="xxx-small">
        <sqm-text slot="label">
          <h3>Earn more rewards</h3>
        </sqm-text>
        <sqm-text slot="content">
          <p>
            Get points while using Klip. Use those points to redeem rewards
            like one free month of Klip Enterprise or two plane tickets to
            anywhere in North America
          </p>
        </sqm-text>
      </sqm-titled-section>
      <sqm-card-feed>
        <sqm-task-card
          reward-amount="50"
          card-title="Follow Us on Twitter"
          description="Earn 50 points when you follow us on Twitter!"
          button-text="Follow"
          button-link="https://twitter.com/"
          goal="1"
          stat-type="/programGoals/count/Follow-on-Social-Media"
          open-new-tab="true"
          event-key="socialFollow"
          program-id="klip-loyalty"
        >
        </sqm-task-card>
        <sqm-task-card
          reward-amount="250"
          goal="500"
          show-progress-bar="true"
          card-title="Spend $500 on Klip Products"
          description="Earn 250 points when you spend $500 or more on Klip products."
          button-text="See plans"
          button-link="https://klip-staging.vercel.app/app/plans"
          stat-type="/customFields/purchaseTotal"
          open-new-tab="false"
        >
        </sqm-task-card>
        <sqm-task-card
          reward-amount="25"
          goal="1"
          card-title="Upload Your First Video"
          description="Earn 25 points for exploring the Klip platform when you upload your first video."
          button-text="Upload"
          button-link="https://klip-staging.vercel.app/app"
          stat-type="/programGoals/count/Record-First-Video"
          open-new-tab="false"
          program-id="klip-loyalty"
        >
        </sqm-task-card>
        <sqm-task-card
          reward-amount="100"
          goal="5"
          repeatable="true"
          show-progress-bar="true"
          steps="true"
          card-title="Share 5 Videos"
          description="Earn 100 points for collaborating each time you share 5 videos."
          button-text="Share"
          button-link="https://klip-staging.vercel.app/app"
          stat-type="/customFields/videosShared"
          open-new-tab="false"
        >
        </sqm-task-card>
      </sqm-card-feed>
    </sqm-portal-container>
    <sqm-tabs>
      <sqm-tab header="Leaderboard">
        <sqm-portal-container gap="large">
          <sqm-hero-image
            image-url="https://res.cloudinary.com/saasquatch/image/upload/v1644000248/squatch-assets/MVgOJn7.png"
            description="Be one of the top 3 referrers at the end of the year and receive Klip free for 1 year!"
            layout="columns"
            image-percentage="33%"
            padding-image="large"
            padding-text="large"
            background-color="#EFF8FE"
          >
          </sqm-hero-image>
          <sqm-leaderboard
            usersheading="Referrer"
            statsheading="Referrals"
            rankheading="Rank"
            rank-type="rowNumber"
            leaderboard-type="topStartedReferrers"
            show-rank="true"
          >
            <sqm-empty
              empty-state-image="https://res.cloudinary.com/saasquatch/image/upload/v1644000223/squatch-assets/empty_leaderboard2.png"
              empty-state-header="View your rank in the leaderboard"
              empty-state-text="Be the first to refer a friend and reach the top of the leaderboard"
            ></sqm-empty>
          </sqm-leaderboard>
        </sqm-portal-container>
      </sqm-tab>
      <sqm-tab header="Referral history">
        <sqm-referral-table per-page="4" hidden-columns="2">
          <sqm-referral-table-user-column column-title="User">
          </sqm-referral-table-user-column>
          <sqm-referral-table-status-column column-title="Referral status">
          </sqm-referral-table-status-column>
          <sqm-referral-table-rewards-column>
          </sqm-referral-table-rewards-column>
          <sqm-referral-table-date-column
            column-title="Date referred"
            date-shown="dateReferralStarted"
          >
          </sqm-referral-table-date-column>
          <sqm-empty
            empty-state-image="https://res.cloudinary.com/saasquatch/image/upload/v1644000223/squatch-assets/empty_referral2.png"
            empty-state-header="View your referral details"
            empty-state-text="Refer a friend to view the status of your referrals and rewards earned"
          ></sqm-empty>
        </sqm-referral-table>
      </sqm-tab>
      <sqm-tab header="Reward history">
        <sqm-rewards-table per-page="4" program-id="">
          <sqm-rewards-table-reward-column></sqm-rewards-table-reward-column>
          <sqm-rewards-table-source-column></sqm-rewards-table-source-column>
          <sqm-rewards-table-status-column></sqm-rewards-table-status-column>
          <sqm-rewards-table-date-column></sqm-rewards-table-date-column>
          <sqm-empty
            empty-state-image="https://res.cloudinary.com/saasquatch/image/upload/v1644360953/squatch-assets/empty_reward2.png"
            empty-state-header="View your rewards"
            empty-state-text="Refer friends and complete tasks to view the details of your rewards"
          ></sqm-empty>
        </sqm-rewards-table>
      </sqm-tab>
      <sqm-tab header="Redeem">
        <sqm-reward-exchange-list>
          <sqm-empty
            empty-state-image="https://res.cloudinary.com/saasquatch/image/upload/v1644360953/squatch-assets/empty_exchange2.png"
            empty-state-header="Redeem rewards"
            empty-state-text="Use your points to redeem rewards once they become available"
          ></sqm-empty>
        </sqm-reward-exchange-list>
      </sqm-tab>
    </sqm-tabs>
  </sqm-portal-container>
</sqm-portal-container>
</sqm-brand>
`;

export const big = `
<div style="--sl-color-primary-600: pink;">
<my-component></my-component>
<my-split>
  <div slot="left">Left column</div>
  <div slot="right">Right column</div>
  <div slot="left">Left column 2</div>
  <div slot="right">Right column 2</div>
</my-split>
<sl-card class="card-overview"  style="--sl-color-primary-600: orange;">

<strong>Mittens</strong>
This kitten is as cute as he is playful. Bring him home today!
<small>6 weeks old</small>

<div slot="footer" style="background:var(--favorite-color)">
  <sl-button type="primary" pill>More Info</sl-button>
  <sl-rating></sl-rating>
</div>
</sl-card>
<sl-card class="card-overview">


<strong>Mittens</strong>
This kitten is as cute as he is playful. Bring him home today!
<small>6 weeks old</small>

<div slot="footer">
<sl-button type="primary" pill>More Info</sl-button>
<sl-rating></sl-rating>
</div>
</sl-card>
<sl-details summary="Toggle Me">
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</sl-details>
<template>
I am a template
</template>
</div>

<style>
.card-overview {
  max-width: 300px;
}

.card-overview small {
  color: var(--sl-color-gray-500);
}

.card-overview [slot="footer"] {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
}
</style>
`;

export const mintTemplates = `
<sqb-auth-template-switch>
<template slot="logged-in">
<sqm-brand>
  <sqm-portal-container direction="column" padding="none" gap="xx-large" max-width="770px" center display="grid">
    <sqm-referral-card vertical-alignment="start">
      <sqm-portal-container gap="xxxx-large" direction="column" display="flex" justify-content="center" max-width="100%" padding="xxxx-large" slot="header">
        <sqm-titled-section text-align="center" label-margin="none" padding="none">
          <h3 slot="label">You got &#x24;50 off thanks to a friend!</h3>

          <p slot="content">
            Description about sharing the products wiht friends will make your
            life 100 times better!
          </p>
        </sqm-titled-section>

        <sqm-portal-container>
          <p>
            The coupon code has some conditions that are described concisely in
            this paragraph so that you don&#x2019;t get upset if the code doesn&#x2019;t work
          </p></sqm-portal-container>

        <sqm-coupon-code></sqm-coupon-code>
      </sqm-portal-container>

      <sqm-portal-footer slot="footer" padding-top="none" padding-bottom="none" padding-left="none" padding-right="none"></sqm-portal-footer>
    </sqm-referral-card>
  </sqm-portal-container>
</sqm-brand>

</template>
<template slot="logged-out">
<sqm-brand>
  <sqm-referred-registration register-label="Get $50 off">
    <sqm-titled-section text-align="center" label-margin="xxx-small" padding="none" slot="top-slot">
      <h3 slot="label">You got &#x24;50 off thanks to a friend!</h3>
      <p slot="content">
        Description about sharing the products with friends will make your life
        100 times better!
      </p>
    </sqm-titled-section>

    <div slot="bottom-slot">
      <p style="text-align:center;margin-top:0;margin-bottom:1.5rem">
        *Valid on purchases of &#x24;75 or more
      </p>
      <sqm-portal-footer hide-support-text="true" terms-link="https://example.com" terms-text="Terms And Conditions" faq-text="FAQ" show-powered-by="true" padding-bottom="none" padding-left="none" padding-right="none" padding-top="none"></sqm-portal-footer>
    </div>
  </sqm-referred-registration>
</sqm-brand>

</template>
</sqb-auth-template-switch>
`;

export const templateExample = `
<template-switcher>
  <template slot="one">Template in slot 1</template>
  <template slot="two">
    <template-switcher>
      <template slot="one">
      <sqm-brand>
      <div>
      2nd order template in nested slot 1
      </div>
      </sqm-brand>
      </template>
      <template slot="two">2nd order template in nested slot 2</template>
    </template-switcher>
  </template>
</template-switcher>


<script>
  class TemplateSwitcher extends HTMLElement {
    constructor() {
      // Always call super first in constructor
      super();
      this._state = 1;

      const shadow = this.attachShadow({
        mode: 'open'
      });
      this.render();


      this.shadowRoot.innerHTML = '<div style="padding: 20px;">Shadow root. <button>switch</button> <slot name="one">Default one</slot><slot name="two">default two</slot><slot name="shown">Shown slot</div></div>'

      this.shadowRoot.querySelector("button").addEventListener("click", () => {
        this._state = this._state + 1;
        this.render();
      })

    }

    /**
     * Removes the previously slotted content
     */
    cleanup() {
      const previous = Array.from(this.querySelectorAll("*")).filter(e => e.slot === "shown");
      previous.forEach(p => this.removeChild(p))
    }
    render() {
      const oneOrTwo = this._state % 2 === 0 ? "one" : "two";
      const templates = Array.from(this.querySelectorAll("template")).filter(e => e.slot === oneOrTwo);
      this.cleanup();
      templates.map(t => {
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

`;
