// English version of the demo knowledge base (part 2).
import type { DemoDocument } from '../notes-data'

export const DEMO_DOCUMENTS_EN_2: DemoDocument[] = [
  {
    id: 'k-cast-iron-seasoning',
    categoryId: 'cat-cooking',
    title: 'How to season and care for a cast-iron pan',
    docType: 'general',
    updatedAt: '2026-09-05T20:15:00Z',
    tags: ['cast iron', 'seasoning', 'cooking', 'kitchenware'],
    summary: `## Why
I wanted better-tasting steaks, so I bought a cast-iron (carbon steel) pan. It was my first time seasoning, so here's the process.

## Seasoning steps
1. Remove the factory rust-proofing oil — washing once with hot water + soap is fine (no soap afterward)
2. Dry completely over low heat
3. Rub on a very thin layer of cooking oil (high smoke point, e.g. grapeseed), heat on high until it smokes → let it cool. **Repeat 3–4 times**
4. After use, wash with water only, dry immediately, and store with a thin coat of oil

## Trial and error
On my first seasoning I applied the oil too thick and ended up with a sticky film — I only later learned that thin layers, repeated, is the key.`,
    keyConclusion: 'The key is to apply oil as thinly as possible and repeat several times. One thick coat leaves only stickiness and doesn\'t form a proper coating.',
    learnings: `- I came to understand that seasoning isn't finished in one go; the coating keeps building up as you use the pan
- I learned that soap is fine before seasoning but off-limits after (only the first wash is the exception)`,
    actionItems: ['Grill a steak this weekend and check the seasoning', 'Build the habit of oiling after every use'],
    followUpQuestions: ['If the seasoning wears off in spots, can I redo just those spots, or do I have to redo the whole pan?'],
    rawConversation: [
      { role: 'user', content: "I bought a cast-iron pan to grill better steaks, but I have no idea how seasoning works." },
      { role: 'assistant', content: "A new pan has factory rust-proofing oil on it, so wash that off once with hot water and soap. After that, never use soap. Then dry it completely, rub on a very thin layer of high-smoke-point oil, heat on high until it smokes and let it cool — repeat that 3–4 times." },
      { role: 'user', content: "How much oil should I use? I put it on kind of thick at first and it got sticky." },
      { role: 'assistant', content: "That's exactly the common mistake. Apply the oil as thin as you can, almost like you didn't put any on. One thick coat won't form a proper coating and just leaves a sticky film. Thin layers, repeated, is the key." },
    ],
  },

  // ── Team management & collaboration ─────────────────────────────
  {
    id: 'l-1on1-structure',
    categoryId: 'cat-leadership',
    title: 'Structuring 1:1 meetings with my team',
    docType: 'general',
    updatedAt: '2025-12-08T18:00:00Z',
    tags: ['1on1', 'team management', 'leadership'],
    summary: `## The problem
I hold 1:1s every week, but they always start with "how have you been?" and end as small talk. Nothing sticks.

## The structure I settled on
1. Check last week's action items (5 min)
2. A topic the teammate brings (10 min, always let them raise it first)
3. Feedback/observations I've prepared (10 min)
4. A short career/growth conversation (5 min, not necessarily every week)

The key is keeping the "teammate speaks first" order — when the manager raises the agenda first, the teammate ends up just answering passively.`,
    keyConclusion: 'Handing the lead of the 1:1 to the teammate (their topic → my feedback) clearly changed the density of the conversation.',
    learnings: `- It was surprising that changing just the order changed the quality of the conversation
- "How have you been?" looks like an open question, but it was actually the hardest question to start a conversation with`,
    actionItems: ['Make a 1:1 template doc and share it with the whole team', 'Ask teammates to write their agenda in advance'],
    followUpQuestions: ['What if a teammate says they have nothing to talk about every time — how do I draw them out?', 'Should I schedule a separate quarterly career conversation apart from 1:1s?'],
    rawConversation: [
      { role: 'user', content: 'I do weekly 1:1s with my team but they always start with "how have you been" and end up as small talk. It feels like nothing sticks.' },
      { role: 'assistant', content: 'Who raises the agenda first in your 1:1s? Do you, as the manager, usually ask the first question?' },
      { role: 'user', content: 'Yeah, right. I start by asking "how have you been."' },
      { role: 'assistant', content: 'That order alone can make the teammate passive. Try letting them raise the topic they brought first, then giving the manager feedback after. Start with a check of last week\'s action items, then their topic → my feedback → a short career chat, and having that 4-step structure ready will also cut down on agonizing over the agenda each time.' },
    ],
  },
  {
    id: 'l-delegating-tasks',
    categoryId: 'cat-leadership',
    title: 'Why delegation isn\'t working, and what I\'ll try',
    docType: 'idea',
    updatedAt: '2026-02-16T21:30:00Z',
    tags: ['delegation', 'perfectionism', 'leadership'],
    relatedDocumentIds: ['m-therapy-first-session'],
    summary: `## Realization
Looking back at why I've been working late so often, I've been holding on to work I could delegate with the thought "it's faster if I do it myself."

## The real reasons
- Perfectionism: if it doesn't meet my standard I'd have to redo it, so I figured it's better to do it myself from the start
- Cost of explaining: handing something off takes time to explain the background, and I grudge that time so I just do it

## What to try
I actually compared "time to explain the handoff vs. time to do it myself," and for recurring work, accepting the up-front explanation cost turns out to pay off far more in the long run.`,
    keyConclusion: 'I admit the real reason I don\'t delegate is perfectionism. I\'ll start consciously handing off recurring tasks first.',
    learnings: `- Doing the math showed me that "it's faster if I do it" is itself a short-term view
- Perfectionism is a trap that's easy to dress up as "responsibility"`,
    actionItems: ['Delegate the recurring weekly report to the junior PM', 'When delegating, communicate the quality criteria for the result clearly in a doc up front'],
    followUpQuestions: ['When delegated work doesn\'t meet the standard, how do I coach instead of taking it back?'],
    rawConversation: [
      { role: 'user', content: "I thought about why I've been working late so much lately, and I think I keep holding on to work I could delegate." },
      { role: 'assistant', content: 'Why do you think you\'ve been doing it yourself?' },
      { role: 'user', content: "If it doesn't meet my standard I'd have to redo it anyway, so I figured I'd do it from the start. Is that perfectionism, maybe?" },
      { role: 'assistant', content: 'For recurring work, even if explaining the first handoff costs a bit, it pays off far more in the long run. "It\'s faster if I do it" is a short-term calculation for just this one time. Admitting perfectionism may be the first step — try consciously handing off recurring tasks one at a time.' },
    ],
  },
  {
    id: 'l-giving-feedback',
    categoryId: 'cat-leadership',
    title: 'How to deliver hard feedback well',
    docType: 'general',
    updatedAt: '2026-05-04T19:00:00Z',
    tags: ['feedback', 'communication', 'leadership'],
    relatedDocumentIds: ['l-1on1-structure'],
    summary: `## Situation
One teammate's document-writing habits keep creating communication costs with other teams. I need to give feedback but kept putting it off.

## Principles I settled on
1. **Talk about behavior, not the person** (not "your docs are messy" but "I had to search three times to find the conclusion in this doc")
2. Give feedback as soon as possible, close to the event
3. Offer a direction for improvement as well (don't just point things out)`,
    keyConclusion: 'Switching to concrete examples and behavior-focused language made it land much less defensively. I also felt that putting it off only makes it harder.',
    learnings: `- The longer I delay feedback, the bigger and more burdensome it gets in my head
- Just pointing at "behavior" instead of "the person" sharply reduces the other person's defensive reaction`,
    actionItems: ['Jot down 2–3 concrete examples before the feedback conversation', 'Schedule a follow-up 1:1 after the feedback'],
    followUpQuestions: ['What\'s a good ratio of positive feedback to improvement feedback?'],
    rawConversation: [
      { role: 'user', content: "One teammate's document-writing habit keeps creating communication costs with other teams. I need to give feedback but I've kept putting it off." },
      { role: 'assistant', content: 'How are you planning to phrase the feedback?' },
      { role: 'user', content: 'Hmm... I was going to say something like "your documents feel a bit scattered."' },
      { role: 'assistant', content: 'That can sound like a judgment about the person or their style. Saying it with a concrete behavior and example, like "I had to look three times to find the conclusion in this doc," lands much less defensively. And don\'t just point it out — suggest a direction for improvement, and the conversation will go more constructively.' },
    ],
  },
  {
    id: 'l-cross-team-conflict',
    categoryId: 'cat-leadership',
    title: 'Mediating a priority conflict with the design team',
    docType: 'meeting',
    updatedAt: '2026-08-28T15:30:00Z',
    tags: ['prioritization', 'collaboration', 'conflict resolution'],
    summary: `## The conflict
The design team wants to make design-system cleanup the top priority this quarter, while our team urgently needs the onboarding improvements. Resources overlap.

## What came out of the meeting
- Each side had explained "why it's urgent," but this was the first time we actually heard the other team's reasons
- Postponing the design system means design cost accumulates on every feature in the long run; postponing onboarding means an immediate conversion loss — both have grounds

## The compromise
We agreed to narrow the design-system work to "only the components needed for the onboarding screens first," so the two efforts can run in parallel.`,
    keyConclusion: 'Rather than deciding a strict order, narrowing the scope to find where both can proceed was the better solution.',
    learnings: `- Conflicts usually look like a question of "who goes first," but narrowing scope often lets both happen
- I realized I had never really listened to the other team\'s reasons`,
    actionItems: ['Confirm the narrowed design-system scope and have both team leads sign off', 'Reserve time for the full design-system cleanup next quarter'],
    followUpQuestions: ['Should we mediate like this in a meeting each time, or set resource-allocation principles at the start of each quarter?'],
    rawConversation: [
      { role: 'user', content: "My priorities clashed with the design team this quarter. They say design-system cleanup is urgent, and we need onboarding improvements urgently, but resources overlap." },
      { role: 'assistant', content: "Have you heard the specific reasons why the design team says the design-system cleanup is urgent right now?" },
      { role: 'user', content: "Um, not in detail. I only knew the schedules overlap." },
      { role: 'assistant', content: "Then I'd start by hearing those reasons. These conflicts usually turn into fights over 'who goes first,' but often there's a point where you can narrow the scope and do both — for example, doing the design-system work only for the components the onboarding screens need first." },
    ],
  },

  // ── Data analysis & experiments ─────────────────────────────────
  {
    id: 'a-sql-window-functions',
    categoryId: 'cat-analytics',
    title: 'Analyzing retention with SQL window functions',
    docType: 'research',
    updatedAt: '2025-11-20T20:00:00Z',
    tags: ['SQL', 'data analysis', 'retention'],
    summary: `## Background
Instead of asking the data team for every retention analysis, I figured writing queries myself would be much faster, so I started studying window functions.

## Core concepts
- \`LAG\`/\`LEAD\`: compare the previous/next row's value (e.g. active last month vs. this month)
- \`PARTITION BY\`: group by user and compute rank/running totals within each group
- Cohort retention is ultimately the problem of computing, per user, "were they still active N months after their sign-up month," using PARTITION BY user

## Practice
I actually pulled the 4-week retention of last month's new-user cohort with my own query — and confirmed it matched the dashboard numbers.`,
    keyConclusion: 'Once you get the window-function concepts, most retention-style analyses can be done self-serve. Less need to wait in the data team\'s request queue.',
    learnings: `- There was quite a gap between understanding a concept as text and verifying it with a real query
- As the range of analyses I can do myself grew, hypothesis-testing speed itself picked up`,
    actionItems: ['Templatize frequently used retention/funnel queries', 'Ask the data team for one query review to confirm best practices'],
    followUpQuestions: ['How should I manage window-function performance issues on large tables?'],
    rawConversation: [
      { role: 'user', content: "I always ask the data team for retention analyses, and it'd be much faster if I could write the queries myself, so I want to study SQL window functions." },
      { role: 'assistant', content: "The most-used ones for retention analysis are LAG/LEAD and PARTITION BY. You group by user with PARTITION BY and compute whether they were active N months after their sign-up month. What form does the retention metric you're looking at take?" },
      { role: 'user', content: "It's 4-week retention by new sign-up cohort." },
      { role: 'assistant', content: "Then partition by user ID relative to sign-up date and check whether there's an activity log 4 weeks later using LEAD or a subquery. Write it yourself and reconcile it with the dashboard numbers and the concept will really stick." },
    ],
  },
  {
    id: 'a-ab-test-pitfalls',
    categoryId: 'cat-analytics',
    title: 'Common mistakes in A/B testing',
    docType: 'research',
    updatedAt: '2026-01-15T14:30:00Z',
    tags: ['A/B testing', 'experiment design', 'statistics'],
    relatedDocumentIds: ['p-onboarding-funnel'],
    summary: `## What prompted this
I reported the last A/B test result as just "B is 3% higher" with no confidence interval, and the data team told me it wasn't statistically significant.

## Common mistakes I sorted out
1. **Not calculating sample size up front** — there's a minimum sample needed to detect a meaningful difference, but people often just start with "let's run it for two weeks"
2. **p-hacking**: checking results every day and stopping the moment it looks significant
3. **Looking at many metrics at once and reporting the one that "happens to be significant"**`,
    keyConclusion: 'Build the habit of fixing the sample size, stopping condition, and one primary metric before starting a test.',
    learnings: `- You can "run" an experiment without knowing statistical significance, but it makes wrong conclusions easy
- I felt firsthand the principle that experiment design must be finished before you see results`,
    actionItems: ['Make an experiment design checklist (sample size / stopping condition / primary metric stated up front)', 'Set up an experiment design review process with the data team'],
    followUpQuestions: ['Should we standardize a sample-size calculator for the whole team?'],
    rawConversation: [
      { role: 'user', content: "I reported the last A/B test as 'B is 3% higher' and the data team said it's not statistically significant. What did I miss?" },
      { role: 'assistant', content: "Did you calculate the required sample size before starting? I'm also curious whether you set a stopping condition for how long to run the test." },
      { role: 'user', content: "No, I just started with 'let's run it for about two weeks.' And I was curious about the results, so I checked every day." },
      { role: 'assistant', content: "Those two are common mistakes. If you don't set the sample size in advance you can't tell whether enough data has accumulated, and checking daily and stopping when it looks significant is called p-hacking, which easily leads to wrong conclusions. From now on, set the sample size, stopping condition, and one primary metric before you start." },
    ],
  },
  {
    id: 'a-north-star-metric',
    categoryId: 'cat-analytics',
    title: 'Redefining our team\'s north star metric',
    docType: 'idea',
    updatedAt: '2026-04-10T11:00:00Z',
    tags: ['north star metric', 'metric design', 'product'],
    summary: `## Problem
Our current north star is "weekly active workspaces," but a recent analysis showed that even when it grows, its correlation with actual revenue/retention is weak.

## Alternative candidates
1. Number of data sources connected per workspace — we confirmed a correlation: more connections, lower churn
2. Number of reports actively generated per week

## Decision
Adopt "number of connected data sources" as the new north star — it's closer to actual value realization (they've connected something and are looking at it).`,
    keyConclusion: 'Active workspaces was a surface metric; connected-source count is closer to actual value realization and a better leading indicator, so we\'ll swap the north star.',
    learnings: `- If a metric grows without translating into business results, you\'re watching the wrong metric
- A north star isn't set once and left alone; its correlations need to be re-verified periodically`,
    actionItems: ['Build a dashboard for the new north star metric', 'Share the background for the metric change with the whole team'],
    followUpQuestions: ['Changing the metric breaks comparison with past data — how should we manage the transition period?'],
    rawConversation: [
      { role: 'user', content: "Our team's north star metric is weekly active workspaces, but a recent analysis shows that even when it goes up, its correlation with revenue and retention is weak." },
      { role: 'assistant', content: "Is there another metric with a stronger correlation to revenue/retention?" },
      { role: 'user', content: "The number of connected data sources showed quite a correlation. Workspaces with more connections have lower churn." },
      { role: 'assistant', content: "Then that's a much better north star candidate. Active workspaces is a surface metric, while connected-source count shows more directly that users are realizing value in the product. I'd swap it and share the reason for the change with the whole team." },
    ],
  },
  {
    id: 'a-dashboard-redesign',
    categoryId: 'cat-analytics',
    title: 'Dashboard redesign — what should it show?',
    docType: 'spec',
    updatedAt: '2026-07-02T10:20:00Z',
    tags: ['dashboard', 'metric design', 'UX'],
    summary: `## Problem
The current dashboard lists 22 metrics, but usage logs show that teammates only actually look at 3–4 of them every week.

## Design principles
1. Limit the first screen to no more than 5 items "to look at this week"
2. Split the rest into tabs, entered only when needed
3. Attach a one-line "why this matters" explanation to every metric (so new teammates can read it without context)`,
    keyConclusion: 'The conclusion is that the heart of the redesign is removing metrics, not adding them. Narrow the first screen to 5 or fewer.',
    learnings: `- I was reminded that a dashboard's purpose is not "showing everything possible" but "making people look at what they should"
- Until I saw actual usage logs, I couldn't tell by gut which metrics went unused`,
    actionItems: ['Move the 17 unused metrics into tabs', 'Add explanatory copy to the 5 core metrics'],
    followUpQuestions: ['Teams may want to see different metrics — is personalization needed, or is a unified default enough?'],
    rawConversation: [
      { role: 'user', content: "Our dashboard has 22 metrics, but usage logs show only 3–4 are actually viewed every week. I want to redesign it — how should I approach this?" },
      { role: 'assistant', content: "Then the key isn't adding metrics but removing them. How about keeping only the 5 or fewer that are actually viewed weekly on the first screen and moving the rest to tabs?" },
      { role: 'user', content: "Good, but a new teammate seeing it for the first time might not know why a metric matters." },
      { role: 'assistant', content: "Right, so I'd attach a one-line \"why it matters\" to each metric — then it makes sense even without context. Design with those two principles: 5 or fewer on the first screen, plus a one-line explanation." },
    ],
  },

  // ── Travel ──────────────────────────────────────────────────────
  {
    id: 't-japan-solo-trip-planning',
    categoryId: 'cat-travel',
    title: 'Planning a 4-night, 5-day solo trip to Japan',
    docType: 'spec',
    updatedAt: '2025-12-24T20:00:00Z',
    tags: ['Japan trip', 'solo travel', 'trip planning'],
    summary: `## Goal
A 4-night, 5-day solo trip to Osaka and Kyoto using year-end leave. Planning it should be low-stress too — minimal.

## Itinerary
- Day 1: Arrive in Osaka, stay near Dotonbori, keep dinner light
- Days 2–3: Two day trips to Kyoto (Kiyomizu-dera, Arashiyama)
- Day 4: Osaka city (Osaka Castle, Umeda)
- Day 5: Head to the airport

## Principle
Don't cram the schedule every day; always leave free time in the late afternoon — reflecting the experience of burning out on a packed itinerary on a past trip.`,
    keyConclusion: "Rather than filling in every landmark, the principle is 1–2 spots a day plus free time. This time the goal is 'recharging,' not 'completing.'",
    learnings: `- I used to fill trip plans with a count of tourist spots, and looking back that left me exhausted after trips
- The biggest advantage of a solo trip is freedom to change plans, so there's no need to plan too tightly`,
    actionItems: ['Confirm the accommodation booking', 'Check whether to buy the Kansai Thru Pass for the Kyoto day trips'],
    followUpQuestions: ['Should I prepare one indoor alternative course for rainy days?'],
    rawConversation: [
      { role: 'user', content: "I'm taking year-end leave for a 4-night, 5-day solo trip to Osaka and Kyoto. Can you help me plan the route?" },
      { role: 'assistant', content: "Great! It'd help to decide first whether to focus on Osaka or also do Kyoto as day trips. How many places a day would you like to see?" },
      { role: 'user', content: "I burned out on a past trip by packing the schedule too tight, so this time I want it relaxed." },
      { role: 'assistant', content: "Then I'll limit it to 1–2 spots a day and always leave the afternoon free. Arrive in Osaka on a light day, do two Kyoto day trips (Kiyomizu-dera, Arashiyama), and spend the last day around Osaka city before heading to the airport — that should be comfortable." },
    ],
  },
  {
    id: 't-carry-on-packing',
    categoryId: 'cat-travel',
    title: 'How to pack everything into one carry-on',
    docType: 'general',
    updatedAt: '2026-03-08T09:30:00Z',
    tags: ['packing', 'minimalist travel', 'luggage'],
    summary: `## Background
My luggage grows every trip until I end up checking a bag, and I hate that, so this time I'm going to make do with a single carry-on for 4 nights and 5 days.

## Principles I settled on
1. Minimize clothes with "layering" combos — 3 tops and 2 bottoms can cover 5 days through combinations
2. Decant toiletries into travel-size containers
3. In principle, don't pack "just in case" items (most of the time you don't actually use them)`,
    keyConclusion: "Reducing luggage means thinking not 'what should I bring' but 'what can I leave out.'",
    learnings: `- Looking back at past trips, I barely used any of the "just in case" items
- Making an outfit-combination chart in advance sharply cut the time it takes to pack`,
    actionItems: ['Keep a decanted travel toiletries set ready at all times', 'Save the layering combo chart and reuse it next trip'],
    followUpQuestions: ['Does this principle hold for cases like winter trips that need bulky clothes?'],
    rawConversation: [
      { role: 'user', content: "My travel luggage keeps growing until I have to check a bag. This time I want to get through 4 nights and 5 days with just a carry-on — how should I pack?" },
      { role: 'assistant', content: "If you plan clothes as \"layering\" combos you can cut the number of pieces a lot. Even just 3 tops and 2 bottoms will give you 5 days of outfits in combination. And decant toiletries into small containers." },
      { role: 'user', content: "I always bring \"just in case\" stuff, and I think that's the main culprit for the extra luggage." },
      { role: 'assistant', content: "Right, looking back at past trips you probably didn't actually use most of those. This time, decide that as a rule you don't pack \"just in case\" — if you truly need something you can buy it there." },
    ],
  },
  {
    id: 't-jeju-weekend',
    categoryId: 'cat-travel',
    title: 'Looking back on a weekend in Jeju',
    docType: 'general',
    updatedAt: '2026-06-14T21:00:00Z',
    tags: ['Jeju trip', 'weekend trip', 'retrospective'],
    summary: `## Trip notes
Left after work on Friday and got home Sunday night — a 1-night-plus trip. Because it was short, I hardly planned anything and went with the flow.

## What was good
Spending half a day at a café near the hotel with no plans was the best part of this trip — reconfirmed that empty space is more memorable than a planned itinerary.

## What I'd change
I was rushed on the last morning because of the rental car return time. Next time, leave more slack for the return.`,
    keyConclusion: 'Reconfirmed that on shorter trips, leaving white space actually raises satisfaction. I\'ll keep planning minimal for the next weekend trip too.',
    learnings: `- The paradoxical experience that short trips were more satisfying when I didn't plan
- "Deadline" items like the rental car return time should always get generous slack`,
    actionItems: ['Next Jeju trip, move the rental car return up to the evening before'],
    followUpQuestions: ['Should I set criteria for when spontaneous vs. planned trips work better depending on the destination?'],
    rawConversation: [
      { role: 'user', content: "I got back from a one-night trip to Jeju this weekend. I hardly planned anything and went with the flow, and that ended up being the best part." },
      { role: 'assistant', content: "Which moment was the best?" },
      { role: 'user', content: "Just spending half a day at a café near the hotel with no plans. But the last morning was rushed because of the rental car return time." },
      { role: 'assistant', content: "So you confirmed that on shorter trips, leaving white space raises satisfaction. Next time, move the rental car return up to the evening before to give yourself more slack, and you can stay relaxed right to the end." },
    ],
  },
  {
    id: 't-travel-budget',
    categoryId: 'cat-travel',
    title: 'My own rules for setting a travel budget',
    docType: 'idea',
    updatedAt: '2026-08-02T17:00:00Z',
    tags: ['travel budget', 'spending management', 'personal finance'],
    relatedDocumentIds: ['f-dca-vs-lump'],
    summary: `## The issue
Every time I get back from a trip I'm shocked by the card bill. Even when I set a budget in advance, I didn't stick to it.

## New rules
- Manage flights/lodging separately as fixed pre-trip spending
- For local spending (food/shopping/activities), set a "daily limit" and settle up every evening
- Withdraw a separate shopping budget in cash before the trip and only spend within that limit`,
    keyConclusion: "Rather than lumping everything into one 'total budget,' splitting by category and settling daily is more likely to actually hold.",
    learnings: `- When the budget is one big lump, small daily overages don't register and I end up over
- Physically separating the shopping budget in cash is likely psychologically effective too`,
    actionItems: ['From the next trip, set a daily spending limit and settle every evening', 'Withdraw shopping cash separately'],
    followUpQuestions: ['When using a card abroad, what\'s a convenient way to settle in real time including exchange rates and fees?'],
    rawConversation: [
      { role: 'user', content: "Every time I get back from a trip I'm shocked by the card bill. Even if I set a budget in advance I always go over." },
      { role: 'assistant', content: "How do you set the budget? As one total amount?" },
      { role: 'user', content: "Yeah, I just say something like \"this trip is within 1 million won.\"" },
      { role: 'assistant', content: "If you keep one big lump budget, going over a little each day doesn't register and you end up over. Set flights/lodging aside as fixed pre-trip spending, and set a daily limit for local spending (food/shopping/activities) and settle every evening — that's much more likely to hold. Withdrawing the shopping budget in cash ahead of time to physically separate it will help too." },
    ],
  },
]
