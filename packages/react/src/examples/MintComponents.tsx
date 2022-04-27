export const MintComponents = [
  {
    name: '@saasquatch/mint-components',
    filePath: '/dist/mint-components/mint-components.css',
    version: '1.5.6-3',
  },
  {
    name: '@saasquatch/bedrock-components',
    filePath: '/dist/bedrock-components/bedrock-components.js',
    version: '1.3.x',
  },

  {
    name: '@saasquatch/mint-components',
    filePath: '/dist/mint-components/mint-components.js',
    version: '1.5.6-3',
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

export const mintMono = `
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

<div slot="footer">
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
