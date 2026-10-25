// English version of the demo knowledge base (part 1). Mirrors ../notes-data.ts (Korean) 1:1 —
// same ids, categories, dates and relations; only the text is translated.
import type { DemoDocument } from '../notes-data'

export const DEMO_DOCUMENTS_EN_1: DemoDocument[] = [
  {
    id: 'p-onboarding-funnel',
    categoryId: 'cat-product',
    title: 'Why users drop off at step 3 of the onboarding funnel',
    docType: 'research',
    updatedAt: '2026-08-11T09:20:00Z',
    tags: ['onboarding', 'funnel analysis', 'session replay', 'B2B SaaS'],
    relatedDocumentIds: ['p-roadmap-rice', 'c-skill-gap'],
    summary: `## Problem
Cohort data from the last 4 weeks shows the onboarding funnel (sign-up → create workspace → first data connection) loses **61% of users at step 3 (first data connection)**. Steps 1 and 2 are in line with industry averages.

## Hypotheses
- Users may be leaving on the source-system picker (Salesforce, HubSpot, etc.) because the permission scope isn't clear at a glance
- During the free trial they can explore with sample data without connecting anything, but that option may be hard to notice, so many users bail with "I'll do it later"

## Session replay check
Of 12 session replays reviewed, more than half show the user hitting back on the connection screen and switching tabs — it looks like they leave while reading the permission copy.`,
    keyConclusion:
      'The step-3 drop-off is probably less about how hard connecting is and more about anxiety over "why are you asking for this permission." We decided to A/B test a more prominent sample-data option next sprint.',
    learnings: `- I assumed the drop-off was about feature difficulty, but session replays suggest it may be a trust/anxiety problem
- Quantitative data (funnel conversion) alone can't tell you "why" — it has to be read together with qualitative data (session replays)
- The sample-data option already existed but had low discoverability, so it wasn't helping — building a feature and making it discoverable are separate problems`,
    actionItems: [
      'Add a tooltip on the connection screen explaining "why this permission is needed" (ask design)',
      'Design an A/B test that promotes "Explore with sample data" to the primary CTA',
      'Watch 20 more session replays and re-check the pattern',
    ],
    followUpQuestions: [
      'At current traffic, how many weeks will the A/B test need to reach a meaningful sample size?',
      'If fixing the permission copy doesn\'t reduce drop-off, what should the next hypothesis be?',
    ],
    rawConversation: [
      { role: 'user', content: 'I was looking at the onboarding funnel data and step 3 is bleeding users. 61% drop off. Why would that be?' },
      { role: 'assistant', content: 'What are the drop-off rates at steps 1 and 2? First I\'d want to know whether step 3 is uniquely high or everything is high.' },
      { role: 'user', content: 'Step 1 is 12%, step 2 is about 18%, so only step 3 spikes. Step 3 is where they connect an external system.' },
      { role: 'assistant', content: "A connection step usually has a permission request screen, and it's common for users to leave because they don't understand the scope and feel uneasy. If you have a session replay tool, I'd watch a few directly — numbers alone won't tell you 'why'." },
      { role: 'user', content: 'I just went through about 12, and more than half read the permission copy, hit back, and go to another tab.' },
      { role: 'assistant', content: "Then it's likely a trust problem rather than a difficulty problem. Also, is there an option to explore with sample data without connecting anything? If there is and nobody sees it, it may be a discoverability problem more than a feature problem." },
    ],
  },
  {
    id: 'p-competitor-pricing',
    categoryId: 'cat-product',
    title: 'Breaking down competitor B\'s new pricing structure',
    docType: 'research',
    updatedAt: '2026-08-25T14:05:00Z',
    tags: ['competitor analysis', 'pricing', 'pricing strategy'],
    summary: `## Background
A competitor (call them B) revamped pricing this week. They moved from three tiers (Starter/Pro/Enterprise) to four, adding **usage-based add-ons**.

## Key changes
1. The base Pro price actually dropped **15%**
2. API calls and seats were pulled out of the base fee and split into metered add-ons
3. SSO, previously Enterprise-only, moved down to Pro

## Compared with our product
- We're still on flat per-seat pricing — going usage-based like B would lower the entry barrier but make revenue harder to forecast
- Moving SSO down to Pro matches the direction we were already discussing internally`,
    keyConclusion:
      "B's 'lower base price + metered add-ons' looks aimed at lowering the entry hurdle while creating more upsell points. Moving SSO down to Pro is worth considering next quarter. Going metered, however, is too risky given our current revenue structure, so we're holding off.",
    learnings: `- With pricing changes it's easy to think only about raising prices, but lowering the base and adding add-ons is also a valid way to grow total revenue
- When watching a competitor, estimating "why they did it" is more useful than deciding "whether to copy it"`,
    actionItems: ['Register "SSO down to Pro" as a candidate for next quarter\'s roadmap', 'Share B\'s changes with sales and collect customer reactions that come up in deals'],
    followUpQuestions: ['How many months of usage data would we need before moving to metered pricing?', 'Would moving SSO down to Pro hurt Enterprise conversion?'],
    rawConversation: [
      { role: 'user', content: 'B announced a pricing overhaul today. Pro is 15% cheaper, but API calls and seats moved to metered add-ons. How should I read this?' },
      { role: 'assistant', content: "They lower the base price to remove the entry barrier and then recover revenue from heavy users through add-ons. It looks like they want more new customers while protecting revenue from high-usage accounts. Did SSO change tiers too?" },
      { role: 'user', content: 'Yes, SSO used to be Enterprise-only and now it\'s in Pro.' },
      { role: 'assistant', content: "That overlaps with the discussion we had internally. SSO is a security requirement that often blocks adoption outright, so moving it to Pro could help convert mid-size customers. Metered pricing means rebuilding the revenue forecast model, though, so it's safer to only look at the SSO change this time." },
    ],
  },
  {
    id: 'p-roadmap-rice',
    categoryId: 'cat-product',
    title: 'Q3 roadmap prioritization — RICE vs ICE',
    docType: 'idea',
    updatedAt: '2026-09-15T11:40:00Z',
    tags: ['roadmap', 'prioritization', 'RICE', 'frameworks'],
    relatedDocumentIds: ['p-onboarding-funnel', 'c-skill-gap'],
    summary: `## The dilemma
There are 11 candidates for the Q3 roadmap but only 6 sprints across 3 teams. Should I prioritize with RICE or ICE?

## RICE vs ICE
- **RICE** (Reach·Impact·Confidence·Effort): Reach has to be estimated separately, so items with little data carry large error
- **ICE** (Impact·Confidence·Ease): Fast, but "how many users are affected" doesn't show up in the score, so high-impact features for a small audience risk being undervalued

## Decision
Many items this quarter already have data to estimate Reach (cohorts, usage logs), so we'll **go with RICE**, and list ICE scores alongside, for reference only, for the 3 new ideas where Reach is hard to estimate.`,
    keyConclusion: 'There is no perfect framework; pick based on data availability. This quarter: RICE as the default, with ICE as a supplementary metric for new ideas that lack data.',
    learnings: `- The first question should have been "can we fill this framework in reliably with our data," not which framework to choose
- Rather than forcing one framework on every item, mixing them by item type is a valid option`,
    actionItems: ['Fill in RICE scores for the 11 candidates (this week)', 'Score the 3 new ideas separately with ICE', 'Review the priority draft with the team at next week\'s sprint review'],
    followUpQuestions: ['When RICE scores come out close, what should break the tie for the final ranking?', 'Is it better for the team to use the same framework every quarter, or stay flexible like now?'],
    rawConversation: [
      { role: 'user', content: "I have 11 candidates for the Q3 roadmap and can't do them all. I'm torn between RICE and ICE for prioritization." },
      { role: 'assistant', content: "The biggest difference is whether you estimate Reach separately. Of the 11 candidates, how many can you estimate 'how many people it affects' for using cohort or usage data?" },
      { role: 'user', content: "Hmm, about 8 are improvements to existing features so there's data, and 3 are brand new ideas that are hard to estimate." },
      { role: 'assistant', content: "Then run the 8 through RICE, and rather than forcing a Reach estimate for the 3 with no data, score them separately with ICE and list them for reference. I wouldn't compare the two groups directly in the same table." },
    ],
  },
  {
    id: 'c-first-90-days',
    categoryId: 'cat-career',
    title: 'Building trust in the first 3 months after switching jobs',
    docType: 'general',
    updatedAt: '2026-07-14T20:10:00Z',
    tags: ['job change', 'building trust', 'onboarding', 'leadership'],
    summary: `## Situation
Week 6 at the new company. At my previous company I'd led the team for a long time and had a natural voice; here I feel like I keep getting asked "why do you think that?"

## Principles I settled on
1. In the first 90 days, ask **more questions than I give opinions** — pushing hard without knowing the implicit context tends to erode trust
2. Keep small promises reliably (share meeting notes within 24 hours, etc.) — big trust is built from accumulated small trust
3. Don't use the old company's way as the reference point ("At my old team we did it this way" is now a banned phrase)`,
    keyConclusion: "Rather than rushing to prove myself, I'll spend the 90 days understanding why this organization works the way it does. Impatience is the biggest enemy of building trust.",
    learnings: `- The first step is admitting that authority from my previous organization doesn't transfer to the new one
- My first discovery was noticing that I say "at my old team we did it this way" without realizing it
- Keeping small promises (meeting notes, reply speed) contributes to trust faster than big wins`,
    actionItems: ['Self-monitor comparison phrases like "at my old team we did it this way"', 'Have a coffee chat with one teammate per week in 1:1s to learn their background', 'Write a self-retrospective at day 90'],
    followUpQuestions: ['If I\'m still only asking questions after 90 days, is that a different problem?', 'Where is the line between understanding the org\'s context and simply conforming to the way things are done?'],
    rawConversation: [
      { role: 'user', content: "I've been at the new company for 6 weeks and keep getting asked 'why do you think that?' I didn't go through this much at my last company, so it's throwing me off." },
      { role: 'assistant', content: "At the old company you'd built trust over a long time, and that doesn't automatically transfer to a new organization. I'm curious how you phrase your opinions right now." },
      { role: 'user', content: "Hmm... come to think of it, I say 'at my old team we did it this way' quite a lot. I didn't realize until I just said it." },
      { role: 'assistant', content: "That phrase alone can sound like 'I don't know the context here yet, but the old way is right.' In the first 90 days, asking more questions than offering opinions, and spending the time understanding why things work the way they do, may be the faster route to trust." },
    ],
  },
  {
    id: 'c-skill-gap',
    categoryId: 'cat-career',
    title: 'Mapping my skill gaps for growing into a senior PM',
    docType: 'idea',
    updatedAt: '2026-09-01T13:00:00Z',
    tags: ['career growth', 'skill development', 'PM skills'],
    relatedDocumentIds: ['p-onboarding-funnel'],
    summary: `## What prompted this
While working through the recent onboarding funnel issue, I realized that although my data analysis is decent, I'm weak at the **habit of digging into qualitative data like session replays myself**.

## Skill gap map
- Quantitative analysis: strength. Comfortable reading funnel/cohort numbers
- Qualitative research: weakness. I've treated user interviews and session replays as "supporting material" only
- Stakeholder persuasion: medium. I persuade with data, but I'm clumsy with emotional opposition (fear of change, etc.)

## Next step
Make qualitative research the top growth goal this quarter. Turn watching 5 session replays a week into a routine.`,
    keyConclusion: "My ability to read numbers is already enough. The growth bottleneck now is that I don't have the habit of interpreting qualitative data myself — this quarter is about closing that gap.",
    learnings: `- Discovering a skill gap through a concrete work problem (the onboarding issue) is much clearer than abstractly wondering "what am I missing"
- Staying in my strength (quantitative analysis) is comfortable, but growth happens on the weak side`,
    actionItems: ['Build a routine of watching 5 session replays a week', 'Run one user interview myself (so far I only delegated to the researcher)', 'Re-evaluate my qualitative research skills at quarter end'],
    followUpQuestions: ['Spending more time on qualitative research takes time from other work — where can I find it?', 'How can I build the skill of responding to stakeholders\' emotional opposition?'],
    rawConversation: [
      { role: 'user', content: "While writing up the onboarding funnel issue I realized I'm good at interpreting numbers but almost never look at qualitative data like session replays. That was kind of a shock." },
      { role: 'assistant', content: "So you found the gap through a concrete piece of work. How have you handled qualitative data until now?" },
      { role: 'user', content: "Mostly I just read the researcher's summaries; I've hardly ever dug into replays myself." },
      { role: 'assistant', content: "Quantitative analysis is clearly a strength, but it may be that it's comfortable and you've stayed there. Setting a small routine as this quarter's growth goal, like 'watch 5 session replays a week myself', is a good way to create real change." },
    ],
  },
  {
    id: 's-architecture',
    categoryId: 'cat-sideproject',
    title: 'Designing the architecture for a habit tracker MVP with React Native + Expo',
    docType: 'spec',
    updatedAt: '2026-07-20T22:30:00Z',
    tags: ['React Native', 'Expo', 'side project', 'MVP design'],
    relatedDocumentIds: ['s-notification-bug', 's-revenuecat-checklist'],
    summary: `## Goal
Define the scope of the MVP for "RoutineMate," the habit tracker app I build in spare weekend time. The key is not to overreach.

## Tech stack decisions
- **Expo (React Native)**: no need to touch native modules, and EAS Build handles shipping in one go
- **Local-first**: no server; habit records live only on the device (SQLite via expo-sqlite). Accounts/sync deferred to v2
- **State management**: Zustand — Redux is overkill at this size

## MVP scope (must include)
1. Add/delete habits
2. Toggle today's check
3. Streak calculation
4. One daily reminder notification

## Deferred to v2
Cloud sync, social features (sharing habits with friends), stats dashboard — all later.`,
    keyConclusion: 'Start with a server-less, local-first structure, with "use it myself and see if it becomes a habit" as the top validation goal. Accounts/sync are deliberately deferred to v2.',
    learnings: `- The biggest risk in a side project is failing to cut scope — explicitly writing a "deferred to v2" list reduced the temptation
- Starting without a server cuts deployment/ops burden a lot, so progress is possible even in weekend time`,
    actionItems: ['Set up the Expo project and integrate expo-sqlite', 'Build the habit CRUD screens first', 'Extract streak calculation as a pure function and write unit tests'],
    followUpQuestions: ['If I start local-first and add cloud sync later, how painful will the migration be?', 'Should I ask for notification permission on first launch or wait until the first habit is added?'],
    rawConversation: [
      { role: 'user', content: "I want to build a habit tracker app as a weekend side project, and I'd like to sort out the stack and MVP scope first." },
      { role: 'assistant', content: "Sounds good. First, does the app really need a server, or could it store everything locally?" },
      { role: 'user', content: "My goal for now is to use it myself and check whether it becomes a habit, so I think I can do without a server." },
      { role: 'assistant', content: "Then a local-first setup with Expo + expo-sqlite is the lightest way to start. You'll be tempted to add cloud sync and social features from the start, but I'd firmly push those to v2. For the MVP, adding/deleting habits, checking today, streak calculation and a reminder notification should be enough." },
      { role: 'user', content: "What should I use for state management? Redux feels heavy." },
      { role: 'assistant', content: "At this size Zustand is much lighter. Less boilerplate, and it holds up fine as things grow." },
    ],
  },
  {
    id: 's-notification-bug',
    categoryId: 'cat-sideproject',
    title: 'The rabbit hole of implementing local notification scheduling',
    docType: 'general',
    updatedAt: '2026-08-14T21:15:00Z',
    tags: ['React Native', 'debugging', 'notifications', 'expo-notifications'],
    relatedDocumentIds: ['s-architecture'],
    summary: `## Problem
I set a daily reminder at the same time with expo-notifications, but **if I fully quit the app and reopen it, notifications get dropped**.

## Tracking down the cause
1. At first I suspected iOS notification permissions — permission was granted normally
2. The actual cause: calling \`scheduleNotificationAsync\` every time the app came to the foreground **registered duplicates on top of the existing schedule**, and some of them got dropped
3. The root cause was not having an "already scheduled today's notification" flag in AsyncStorage

## Fix
On app start, cancel every existing scheduled notification (\`cancelAllScheduledNotificationsAsync\`) and then schedule exactly one. Guaranteeing idempotency fixed it.`,
    keyConclusion: "Logic like notification scheduling that 'must give the same result when re-run' will inevitably get duplicate/missing bugs unless idempotency is explicitly guaranteed.",
    learnings: `- Even a bug that looks random (notifications sometimes dropped) has a deterministic cause once you narrow down the reproduction conditions
- Code that runs every time the app starts should always be suspected for idempotency`,
    actionItems: ['Add unit tests for notification logic (including the duplicate-scheduling case)', 'Re-check other useEffects from an idempotency point of view'],
    followUpQuestions: ['Is the same pattern safe on Android? (Haven\'t tested on a real Android device yet)'],
    rawConversation: [
      { role: 'user', content: "I built the habit reminder notification, but if I fully quit and reopen the app, sometimes the notification doesn't arrive. What's the problem?" },
      { role: 'assistant', content: "Let's first rule out permissions. Are notification permissions granted properly?" },
      { role: 'user', content: "I checked permissions and they're fine. But looking at the code, I'm calling scheduleNotificationAsync every time the app comes to the foreground." },
      { role: 'assistant', content: "That's almost certainly the cause. Each call schedules anew and creates duplicates with the existing schedule, and the OS filters out some of the duplicates, so notifications get dropped. The cleanest fix is to call cancelAllScheduledNotificationsAsync on app start to clear everything and schedule just one, so it's idempotent." },
      { role: 'user', content: "Oh, it's definitely stable after fixing it that way." },
    ],
  },
  {
    id: 's-revenuecat-checklist',
    categoryId: 'cat-sideproject',
    title: 'Checklist before adding subscription payments (RevenueCat)',
    docType: 'spec',
    updatedAt: '2026-09-10T19:45:00Z',
    tags: ['RevenueCat', 'subscriptions', 'side project', 'taxes'],
    relatedDocumentIds: ['s-architecture', 'f-year-end-tax'],
    summary: `## Background
I decided to add a paid subscription (stats dashboard, cloud sync) to RoutineMate v2. This is a checklist to run through before wiring up payments with RevenueCat.

## Checklist
1. **App Store / Play Store developer account** — first check whether I need a sole-proprietor registration
2. **Refund policy** — prepare in-app copy separate from Apple/Google policy
3. **Free trial length** — 7 vs 14 days; no drop-off data yet, so start at 7 and adjust
4. **RevenueCat sandbox testing** — always verify the full flow with a sandbox account before real payments

## Tax note
I learned for the first time that side-project income above a certain amount is subject to comprehensive income tax filing — I need to look into this more under finance/taxes.`,
    keyConclusion: 'Administrative prep like the developer account and tax filing has to come before the technical work of adding payments. I\'ll sort that out first before starting on the technical side.',
    learnings: `- The moment a side project earns revenue, "personal business" issues start mixing in with the "development" problem
- With a payments SaaS like RevenueCat, the technical integration is simpler than expected, but the administrative procedures before and after can take longer`,
    actionItems: ['Check the income threshold for filing side income taxes (note it in the finance doc)', 'Create a RevenueCat account and set up a sandbox test environment', 'Draft the refund policy copy'],
    followUpQuestions: ['Should I register as a sole proprietor now, or is it fine to wait until revenue actually comes in?', 'If 7 days turns out too short and I extend it later, how should it apply to existing subscribers?'],
    rawConversation: [
      { role: 'user', content: "I'm looking into RevenueCat to add a paid subscription to RoutineMate, and I want to sort out what to check before wiring up payments." },
      { role: 'assistant', content: "Technically RevenueCat itself isn't hard to integrate. What you should check first is whether your App Store/Play Store developer account is under your personal name or a business, and how many days the free trial should be." },
      { role: 'user', content: "It's under my personal name. But if I earn something, do I have to file taxes and so on?" },
      { role: 'assistant', content: "Yes, if side income goes above a certain amount you may have to file comprehensive income tax. The exact threshold is a tax-law matter you'll need to check separately, but sorting this out before wiring up payments will save you hassle later." },
      { role: 'user', content: "Okay, then I should look into that before starting the technical work." },
    ],
  },
  {
    id: 'f-isa-irp',
    categoryId: 'cat-finance',
    title: "What's the difference between an ISA and an IRP, and which suits me?",
    docType: 'research',
    updatedAt: '2026-07-28T18:00:00Z',
    tags: ['ISA', 'IRP', 'tax-efficient investing', 'personal finance'],
    summary: `## Basic comparison
- **ISA (Individual Savings Account)**: hold a variety of products (stocks, funds, deposits) in one account, with tax-free / separate-taxation benefits on withdrawal after a set period. Early withdrawal is relatively flexible
- **IRP (Individual Retirement Pension)**: the key benefit is the tax credit — deductible up to the annual contribution limit. In exchange, you have to take it as a pension after age 55 to avoid penalties (early withdrawal is penalized)

## The combination that fits me
I have spare cash but don't want to lock it up until 55 — so fill the IRP only up to the tax-credit limit and concentrate the rest in the ISA.`,
    keyConclusion: 'Put money in the IRP only up to the tax-credit limit (within what I don\'t need for liquidity soon), and the rest of the spare cash in the ISA. That\'s how I\'ll balance liquidity against tax benefits.',
    learnings: `- A big tax benefit isn't automatically good; it only becomes a usable strategy if it matches my liquidity needs
- The IRP\'s tax credit and the ISA\'s tax exemption are different kinds of benefit, so they aren't mutually exclusive and can be combined`,
    actionItems: ['Check the IRP annual contribution limit and set up auto-transfer', 'Open an ISA (decide after comparing brokerage fees)'],
    followUpQuestions: ['I hear rolling an ISA into a pension account at maturity gives extra tax benefits — look into it later', 'If I need a lump sum midway, is it right to draw down the ISA before the IRP?'],
    rawConversation: [
      { role: 'user', content: "I know both ISA and IRP have tax benefits, but I'm confused about exactly how they differ. Which suits me?" },
      { role: 'assistant', content: "The big difference is liquidity. An ISA allows relatively free early withdrawal and gives tax-free/separate-taxation benefits at maturity, while an IRP's core is the tax credit but you must take it as a pension after 55 to avoid penalties. How long can you lock up your spare cash?" },
      { role: 'user', content: "Locking it up until 55 feels like a burden. But I do want the tax credit." },
      { role: 'assistant', content: "Then filling the IRP only up to the tax-credit limit and concentrating the rest in the more liquid ISA seems to fit your preference. They aren't mutually exclusive benefits, so many people split it this way." },
    ],
  },
  {
    id: 'f-year-end-tax',
    categoryId: 'cat-finance',
    title: 'Year-end tax deductions to line up early (including side income)',
    docType: 'report',
    updatedAt: '2026-09-18T10:30:00Z',
    tags: ['year-end tax settlement', 'taxes', 'side income', 'deductions'],
    relatedDocumentIds: ['s-revenuecat-checklist'],
    contradiction:
      "In an earlier conversation you said 'RoutineMate revenue is still small so I don't need to worry,' but this time your assessment changed to 'revenue keeps growing so it could count as business income.' It seems best to base the tax advisor consultation on the latest judgment (possible business income).",
    summary: `## Background
Now that RoutineMate subscription revenue has actually started coming in, I need to work out in advance how to report side income at year-end tax settlement.

## Deductions to line up
1. IRP / pension savings tax credit (within the 9 million KRW annual limit)
2. Income deduction for credit/debit card spending
3. For side income, the key is **"other income" vs "business income"** — if one-off/irregular it's other income; if continuous and repeated, it's likely to be treated as business income

## Homework that remains
If RoutineMate subscription revenue keeps growing, it's likely to be classified as business income → I need to consult a tax professional about registering as a simplified business (can't conclude that within this document; expert confirmation needed).`,
    keyConclusion: 'The general deduction items are sorted, but classifying side income (other vs business income) is left as an area that needs a tax advisor rather than my own judgment.',
    learnings: `- If side-project revenue is on a growing trajectory, there comes a point where it's hard to treat as "one-off other income"
- I can gather general tax info myself, but classifying specific income needs a professional — it's important to keep that distinction clear`,
    actionItems: ['Book a tax advisor consultation (confirm classification of side income)', 'Check current progress of IRP contributions against the 9 million KRW limit', 'Check what share of credit card spending qualifies for income deduction'],
    followUpQuestions: ['If I register as a simplified business, can RoutineMate costs (server fees, App Store fees) be treated as necessary expenses?', 'When is the right time to see a tax advisor — after more revenue builds up, or now?'],
    rawConversation: [
      { role: 'user', content: "RoutineMate subscription revenue has started to trickle in, and I want to work out in advance how to report it at year-end tax settlement." },
      { role: 'assistant', content: "The key is whether this income is treated as other income or business income. One-off or irregular income is closer to other income, and income that recurs continuously is generally business income. What's the revenue trend right now?" },
      { role: 'user', content: "This month is higher than last month. And since it's a subscription, it'll keep coming in." },
      { role: 'assistant', content: "Then it looks likely to be classified as business income. I'd recommend confirming with a tax advisor. If you check on simplified business registration at the same time, you'll also learn whether things like server fees and App Store fees can be treated as necessary expenses." },
    ],
  },
  {
    id: 'f-dca-vs-lump',
    categoryId: 'cat-finance',
    title: 'Dollar-cost averaging vs lump sum: sorting out the market-timing dilemma',
    docType: 'idea',
    updatedAt: '2026-08-30T16:20:00Z',
    tags: ['investment strategy', 'dollar-cost averaging', 'lump sum', 'personal finance'],
    contradiction:
      "In an earlier conversation you concluded 'if a lump sum comes in, investing it all at once without agonizing is theoretically right,' but this time, citing market volatility, you decided to 'spread it over 3 months.'",
    summary: `## Background
I got 5 million KRW in spare cash from this month's bonus. Should I invest it all at once (lump sum) or in installments (dollar-cost averaging)?

## Summary
- **Lump sum**: assuming the market trends up over the long run, many studies show statistically higher expected returns
- **Dollar-cost averaging**: expected returns may be lower, but it reduces volatility and the psychological risk of "going all in at the wrong time"

## Final call
Market volatility has been high lately (economic news keeps being unsettling), so putting it all in at once feels psychologically hard — this time I decided to spread it over 3 months.`,
    keyConclusion: 'I know lump sum is theoretically better on expected return, but given current volatility and my own psychological comfort, I decided to buy in installments over 3 months.',
    learnings: `- In personal finance decisions, I accepted that the 'theoretically right answer' and the 'answer I can actually carry out' can differ
- Choosing a method I can stick with to the end may be a better long-term choice than trying to time the market`,
    actionItems: ['Split the 5 million KRW into thirds and set up monthly auto-transfers', 'During the installment period, execute mechanically regardless of market conditions (don\'t try to time it)'],
    followUpQuestions: ['Is 3 months the right split period, or would 6 months be better?', 'Next time a lump sum comes in, should I apply the same rule, or stay flexible depending on the situation?'],
    rawConversation: [
      { role: 'user', content: "I got 5 million KRW in spare cash from this month's bonus, and I can't decide whether to put it in all at once or split it up." },
      { role: 'assistant', content: "Theoretically, assuming long-term upward drift, many studies show lump sum has a higher expected return. But dollar-cost averaging reduces volatility and, above all, eases the psychological burden of 'going all in at the wrong time.' How do you see the market right now?" },
      { role: 'user', content: "Looking at the news lately, volatility is a bit high, so putting it all in at once feels psychologically heavy." },
      { role: 'assistant', content: 'Then splitting it into installments over about 3 months this time seems reasonable both psychologically and for risk management. Choosing "a method you can actually carry through" matters more in the long run than the theoretical expected return.' },
    ],
  },
  {
    id: 'r-half-marathon-plan',
    categoryId: 'cat-running',
    title: 'Building a 12-week half marathon training plan',
    docType: 'spec',
    updatedAt: '2026-07-06T08:00:00Z',
    tags: ['half marathon', 'training plan', 'running'],
    relatedDocumentIds: ['r-runners-knee', 'r-recovery-routine'],
    summary: `## Goal
Finish the half marathon (21.1 km) on September 28. Currently running about 15 km a week, with a 5 km time of 28 minutes.

## 12-week structure
- Weeks 1–4: build a base, gradually raising weekly distance from 15 km → 25 km
- Weeks 5–8: add tempo runs/intervals, longest run up to 14 km
- Weeks 9–10: longest run 18 km, peak intensity
- Weeks 11–12: taper (reduce volume) and manage condition

## Principle
Follow the **10% rule** (increase weekly distance by no more than 10% over the previous week) to minimize injury risk.`,
    keyConclusion: 'For 12 weeks, finishing comes first with no ambition for a time; the plan is set around raising distance gradually while keeping to the 10% rule.',
    learnings: `- I\'ve already experienced injury from adding distance too fast, so this time I set the 10% rule as an explicit constraint
- If you don't build the taper into the plan in advance, it's easy to overtrain right up to race day`,
    actionItems: ['Put the week 1 training schedule on the calendar', 'Check running shoe cushioning (consider replacing past 500 km cumulative)', 'Leave a mid-point check-in doc after week 4'],
    followUpQuestions: ['Can tempo runs and intervals go in the same week, or is it better to alternate them?', 'When should I work out the specific race-day pacing strategy?'],
    rawConversation: [
      { role: 'user', content: "I signed up for the half marathon on September 28. There are 12 weeks left, can you help me build a training plan? I run about 15 km a week and my 5 km is 28 minutes." },
      { role: 'assistant', content: "Sure. With 12 weeks it's typical to split into base building → intensity work → taper. Intensity differs a bit depending on whether your goal is just to finish or to hit a specific time — which is it?" },
      { role: 'user', content: "This time finishing is the top priority, no ambition for a time." },
      { role: 'assistant', content: "Then focus on finishing injury-free rather than pushing intensity. In weeks 1–4, raise weekly distance from 15 km to 25 km gradually, keeping each week's increase within 10% of the previous — the '10% rule.' Mix in tempo runs or intervals in weeks 5–8, hit a longest run of 18 km in weeks 9–10, then finish with a taper in weeks 11–12 where you cut volume." },
    ],
  },
  {
    id: 'r-runners-knee',
    categoryId: 'cat-running',
    title: 'Knee pain (runner\'s knee): causes and a recovery routine',
    docType: 'research',
    updatedAt: '2026-08-03T07:40:00Z',
    tags: ['runner\'s knee', 'injury management', 'running', 'recovery'],
    relatedDocumentIds: ['r-half-marathon-plan'],
    contradiction:
      "In an earlier conversation you said this season should be just about finishing with no ambition for a time, but this time you mentioned 'I still want to try for around 2:20.' If you've adjusted your goal, the training intensity should be re-tuned too.",
    summary: `## Symptoms
Week 6 of training: an aching pain on the outer side of my right knee when going down stairs. Fine while running, sore afterward.

## Suspected cause — IT band syndrome (runner's knee)
- I may have raised weekly distance too fast (skipped the 10% rule for one week)
- My shoes may have gone past 600 km cumulative, missing the replacement point
- Weak hip stabilizers (gluteus medius) are also a common cause

## Recovery plan
1. Stop running for 1 week, substitute cross-training (swimming/cycling)
2. Foam-roll the IT band, add gluteus medius strengthening (clamshells, side planks)
3. Replace the shoes immediately
4. See an orthopedist if the pain returns`,
    keyConclusion: 'A too-fast distance increase plus worn-out shoes is the suspected combined cause. Rest 1 week, then resume alongside hip strengthening, and go straight to a doctor if the pain returns.',
    learnings: `- Setting the '10% rule' doesn't mean it gets followed automatically — skip it for even one week and the body signals right away
- If you don't decide the shoe replacement point in advance by distance (500–800 km), it's easy to miss`,
    actionItems: ['Buy new running shoes', 'Add clamshells and side planks to the routine 3 times a week', 'After 1 week of rest, if pain-free, restart with light distance'],
    followUpQuestions: ['How long do I need to keep up hip strengthening before recurrence risk drops meaningfully?', 'For the 12-week plan, should I push everything back a week or compress it into the remaining time?'],
    rawConversation: [
      { role: 'user', content: "It's week 6 of training and the outside of my right knee aches when I go down stairs. It doesn't hurt while running, only afterward." },
      { role: 'assistant', content: "Given the location, IT band syndrome, or 'runner's knee,' is likely. Did you suddenly increase weekly distance recently? And how long have you been wearing your shoes?" },
      { role: 'user', content: "One week I didn't keep the 10% rule and raised it quite a bit. The shoes are pretty old too but I never measured the distance." },
      { role: 'assistant', content: "Those two things probably combined. Rest from running for a week and substitute swimming or cycling, and do foam rolling on the IT band plus gluteus medius strengthening (clamshells, side planks). If the shoes are past 500–600 km, replace them right away. If the pain remains after a week's rest, I'd recommend seeing a doctor." },
    ],
  },
  {
    id: 'r-recovery-routine',
    categoryId: 'cat-running',
    title: 'Nutrition and sleep habits for recovery after running',
    docType: 'general',
    updatedAt: '2026-08-20T21:00:00Z',
    tags: ['recovery', 'sleep', 'nutrition', 'running'],
    relatedDocumentIds: ['r-half-marathon-plan'],
    summary: `## The problem
Ever since I raised training intensity, my legs stay heavy the next day. I'm feeling how recovery matters as much as training.

## The routine I settled on
1. **20–30 g of protein within 30 minutes after a run** (about a 3:1 ratio with carbs) — the golden window for muscle recovery
2. **Get 7+ hours of sleep** — I realized my recent average was 5.5 hours; growth hormone release is concentrated during sleep, so it ties directly to recovery
3. **No caffeine after 2 p.m. on hard training days** — it affects sleep quality`,
    keyConclusion: 'Recovery isn\'t "time doing nothing"; it has to be treated as part of training. Lack of sleep in particular was the biggest bottleneck.',
    learnings: `- I planned training carefully but never planned recovery, and only realized that late
- I didn't think sleep deprivation would be behind the heavy legs, but looking back it was the biggest variable`,
    actionItems: ['Set a reminder for post-run protein timing', 'Start by moving bedtime 30 minutes earlier', 'Keep the caffeine cutoff on hard training days'],
    followUpQuestions: ['If I sleep more and still can\'t handle higher intensity, should I look for other causes?', 'Is there a way to track recovery objectively (metrics like heart rate variability)?'],
    rawConversation: [
      { role: 'user', content: "Since I raised my training intensity a bit, my legs keep feeling heavy the next day. I don't know how to recover." },
      { role: 'assistant', content: "How much are you sleeping these days? And what do you usually eat after running?" },
      { role: 'user', content: "Sleep... honestly I only get about 5 and a half hours on average lately. After running I don't really eat anything on purpose." },
      { role: 'assistant', content: "Both are big variables for recovery. Having 20–30 g of protein within 30 minutes after a run helps muscle recovery, and 7+ hours of sleep is ideal, since growth hormone release is concentrated during sleep and recovery depends heavily on it. At 5.5 hours, that's very likely the biggest cause of the heavy legs." },
    ],
  },
  {
    id: 'k-meal-prep',
    categoryId: 'cat-cooking',
    title: 'My weekly meal-prep routine for living alone',
    docType: 'general',
    updatedAt: '2026-08-05T19:30:00Z',
    tags: ['meal prep', 'cooking for one', 'routine'],
    summary: `## Background
With frequent late nights at work, agonizing over what to eat every weekday was stressful, so I started a routine of meal-prepping in one go on Sunday evenings.

## Routine structure
1. One carb base (cook brown rice in bulk, portion and freeze)
2. Two rotating proteins (chicken breast steak, soy-braised eggs)
3. 2–3 vegetable sides (mostly stir-fries/seasoned dishes; soups excluded since they don't suit meal prep)

## Trial and error
- At first I made soup and portioned it, but after freezing/thawing the vegetable texture was ruined — failed, so soups are out of meal prep
- For portion containers, silicone was easier for microwaving than glass`,
    keyConclusion: 'Confirmed that soups don\'t suit meal prep. Settled on 1 carb + 2 rotating proteins + stir-fried sides; two hours on Sunday evening makes a full week.',
    learnings: `- I only learned what doesn't work by experiencing the failure (soup) — even if something looks good in theory, you have to consider the texture after thawing
- Limiting sides to 2–3 instead of overreaching made it more sustainable`,
    actionItems: ['Next week, try diversifying the protein rotation with beef bulgogi instead of chicken breast', 'Buy a few more silicone containers'],
    followUpQuestions: ['Instead of soup, would something thicker like curry or stew hold up to freezing and thawing?'],
    rawConversation: [
      { role: 'user', content: "Frequent overtime makes agonizing over what to eat on weekdays really stressful. I want to try meal prepping in one go on Sundays — how should I set it up?" },
      { role: 'assistant', content: "A structure that's easy to manage is usually one carb base plus two proteins in rotation, and two or three vegetable sides, mostly stir-fried or seasoned. Soups tend not to suit meal prep because the texture suffers when frozen and thawed." },
      { role: 'user', content: "Ah, so soup is out. Actually at first I made doenjang soup and portioned it, and after thawing the tofu and vegetables were all mushy." },
      { role: 'assistant', content: "That's the classic failure case for soup meal prep. Instead, cook brown rice in bulk and freeze in portions, rotate two proteins like chicken breast and soy-braised eggs, and build around stir-fried sides — that should get you a week's worth done in about two hours on Sunday." },
    ],
  },
]
