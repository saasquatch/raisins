export const VanillaComponents = [
  {
    package: '@saasquatch/vanilla-components',
    name: '@saasquatch/vanilla-components',
    filePath: '/dist/widget-components/entrypoint.js',
    version: '1.2.4-8',
  },
];

export const referralList = `
<sqh-referral-list
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
pendingvalue="Referral pending"
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
></sqh-referral-list>
`;

export const referrerWidget = `
<sqh-global-container class="squatch-container" background="#ffffff">
  <sqh-text-component
    sqhbanner="true"
    ishidden="true"
    ismarkdown="false"
    background="https://res.cloudinary.com/saasquatch/image/upload/v1535746336/prod_default_assets/default_banner.jpg"
    height="auto"
    paddingtop="150"
    paddingbottom="150"
    text=""
    color="#000000"
  ></sqh-text-component>

  <sqh-text-component
    sqhheader="true"
    ishidden="false"
    ismarkdown="false"
    text="Give $10 and Get $10!"
    color="#4486E1"
    fontsize="30"
    textalign="center"
    paddingtop="30"
    paddingbottom="10"
  ></sqh-text-component>

  <sqh-text-component
    sqhbody="true"
    ishidden="false"
    ismarkdown="true"
    text="Give a friend a $10 and receive $10 for yourself when they purchase.<br/><br/>Share the link below or use the code **<sqh-referral-code />**"
    color="#000000"
    fontsize="13"
    textalign="center"
    paddingtop="5"
    paddingbottom="20"
  ></sqh-text-component>

  <sqh-copy-link-button
    ishidden="false"
    copysuccess="copied!"
    copyfailure="Press Ctrl+C to copy"
    text="Copy"
    buttoncolor="#5C6164"
    textcolor="#FFFFFF"
  ></sqh-copy-link-button>

  <sqh-share-button-container
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
  ></sqh-share-button-container>

  <sqh-text-component
    sqhreferralsheader="true"
    ismarkdown="true"
    ishidden="false"
    text="**Rewards Dashboard**"
    color="#000000"
    fontsize="13"
    textalign="center"
    paddingtop="20"
    paddingbottom="10"
  ></sqh-text-component>

  <sqh-stats-container ishidden="false" paddingtop="0" paddingbottom="0">
    <sqh-stat-component
      ishidden="false"
      statcolor="#4caf50"
      stattype="/referralsCount"
      statdescription="Friends Referred"
      paddingtop="10"
      paddingbottom="10"
    ></sqh-stat-component>

    <sqh-stat-component
      ishidden="false"
      stattype="/rewardsCount"
      statdescription="Total Rewards"
      paddingtop="10"
      paddingbottom="10"
      statcolor="#000000"
    ></sqh-stat-component>

    <sqh-stat-component
      ishidden="false"
      stattype="/rewardBalance/CREDIT/CENTS/prettyAssignedCredit"
      statdescription="Credit earned"
      paddingtop="10"
      paddingbottom="10"
      statcolor="#000000"
    ></sqh-stat-component>
  </sqh-stats-container>

  <sqh-referral-list
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
    pendingvalue="Referral pending"
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
  ></sqh-referral-list>

  <sqh-text-component
    sqhfooter="true"
    ishidden="false"
    ismarkdown="false"
    text="Terms and Conditions"
    color="lightgray"
    fontsize="13"
    textalign="center"
    paddingtop="10"
    paddingbottom="10"
  ></sqh-text-component>
</sqh-global-container>
`;
