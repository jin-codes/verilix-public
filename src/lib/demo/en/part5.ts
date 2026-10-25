// English version of the demo knowledge base (part 5).
import type { DemoDocument } from '../notes-data'

export const DEMO_DOCUMENTS_EN_5: DemoDocument[] = [
  {
    id: 'p-metric-definition',
    categoryId: 'cat-product',
    title: "Teams were using different definitions of 'active user'",
    docType: 'idea',
    updatedAt: '2026-04-05T13:00:00Z',
    tags: ['metric definitions', 'data governance', 'collaboration'],
    relatedDocumentIds: ['a-north-star-metric'],
    summary: `## Discovery
While preparing the quarterly review, I found that the marketing team and my team were using the same term "monthly active users" with different criteria (one login vs. actually using a core feature).

## Summary
We'll build a "Metrics Dictionary" that documents the definition for every metric name and share it company-wide.`,
    keyConclusion: 'Realizing that defining the same term differently risks reaching different conclusions every time we discuss numbers, I raised the metrics dictionary work in priority.',
    learnings: `- This made clear that agreement on what a number counts comes before the number itself
- Same-term-different-definition problems across departments are more common than you'd think, and often linger because nobody checks first`,
    actionItems: ['Document the definitions of 10 core metrics as a draft metrics dictionary', 'Schedule a definition-alignment meeting with marketing'],
    followUpQuestions: ['After building the dictionary, how should we govern it whenever new metrics appear?'],
    rawConversation: [
      { role: 'user', content: "While preparing the quarterly review I found that marketing and my team use the same 'monthly active users' with different criteria. One is a single login, the other is core-feature usage." },
      { role: 'assistant', content: "Then you may have been discussing different numbers under the same metric name all along. Do you think there are more such term mismatches in other metrics?" },
      { role: 'user', content: "Probably. Nobody ever checked first." },
      { role: 'assistant', content: "I'd recommend building a \"metrics dictionary\" that documents the definitions of your core metrics and sharing it company-wide. Set up a definition-alignment meeting with marketing too, so that from now on the same term means the same number when you discuss it." },
    ],
  },
  {
    id: 'p-cross-functional-alignment',
    categoryId: 'cat-product',
    title: 'Quarterly kickoff — alignment meeting with Sales/CS',
    docType: 'meeting',
    updatedAt: '2026-06-18T10:00:00Z',
    tags: ['cross-functional', 'roadmap', 'alignment meeting'],
    relatedDocumentIds: ['p-roadmap-rice'],
    summary: `## Purpose
Share this quarter's roadmap with Sales/CS and check that the requests they get in the field match our priorities.

## Discovery
The request sales hears most often (bulk data export) wasn't on our roadmap at all — demand that internal usage data alone couldn't reveal.

## Adjustment
Urgently added as a candidate for next quarter's roadmap; RICE will be re-scored.`,
    keyConclusion: 'Confirmed that there is demand invisible in the product\'s own data, and that regular alignment meetings with the teams hearing it on the sales/CS front line can fill that gap.',
    learnings: `- I felt the limit that if you build the roadmap from only our team's data, you only solve the "visible problems"
- Without a regular cross-functional alignment forum like the quarterly kickoff, I would have kept missing this gap`,
    actionItems: ['Add bulk export to the roadmap and re-score RICE', 'Propose making the quarterly Sales/CS alignment meeting a regular event'],
    followUpQuestions: ['Would it be better to create a channel (e.g. a Slack channel) to collect field requests continuously?'],
    rawConversation: [
      { role: 'user', content: "We held a kickoff meeting sharing this quarter's roadmap with Sales/CS, and the request sales hears most often (bulk data export) wasn't on our roadmap at all." },
      { role: 'assistant', content: "That must be demand internal usage data alone couldn't show. How often do they say it comes up?" },
      { role: 'user', content: "Sales says they hear it from customers almost every week." },
      { role: 'assistant', content: "At that frequency, add it urgently as a candidate for next quarter's roadmap and re-score RICE. And since this confirmed how important it is to regularly align with the teams who hear demand in the field that product data can't show, propose making the quarterly kickoff a regular event too." },
    ],
  },

  // ── Career growth (additional) ──────────────────────────────────
  {
    id: 'c-mentor-finding',
    categoryId: 'cat-career',
    title: 'Figuring out how to find an internal mentor',
    docType: 'general',
    updatedAt: '2025-11-08T19:00:00Z',
    tags: ['mentoring', 'networking', 'career'],
    relatedDocumentIds: ['c-first-90-days'],
    summary: `## Situation
I just changed jobs, so there's no one in the organization I can comfortably ask. There's an internal mentoring program, but matching is random so I'm hesitant.

## Summary
Rather than looking for "one perfect person," I'll approach it as a "mentor network," learning from different people by area. For example, A for data, B for persuading stakeholders.`,
    keyConclusion: 'Drop the burden of finding one perfect mentor and instead learn a little from several people by area.',
    learnings: `- Limiting "mentor" to one person makes the bar too high and I end up finding no one
- I realized simply asking small questions of colleagues who are already doing well gives plenty to learn`,
    actionItems: ['Request a coffee chat with a colleague who\'s good at data analysis', 'Also apply to the internal mentoring program in parallel'],
    followUpQuestions: ['If I mentor juniors someday, what can I take from this experience?'],
    rawConversation: [
      { role: 'user', content: "I just changed jobs so there's no one in the organization I can comfortably ask. There's an internal mentoring program but matching is random, so I'm hesitant." },
      { role: 'assistant', content: "Are you trying to settle on exactly one mentor?" },
      { role: 'user', content: "I think I was thinking that way. But then the bar gets too high and nobody seems to fit." },
      { role: 'assistant', content: "Rather than looking for one perfect mentor, approach it as a \"mentor network\" where you learn from different people by area — A for data, B for persuading stakeholders, and so on. Starting by asking a colleague who's already doing well one small question at a time will lighten the burden a lot." },
    ],
  },
  {
    id: 'c-performance-review-prep',
    categoryId: 'cat-career',
    title: 'What I sorted out preparing for my first-quarter performance review',
    docType: 'general',
    updatedAt: '2026-03-25T18:00:00Z',
    tags: ['performance review', 'career', 'self-assessment'],
    relatedDocumentIds: ['c-skill-gap', 'p-onboarding-funnel'],
    summary: `## Background
My first formal performance review since changing jobs. I have no idea what to highlight or how.

## How I'm organizing it
- Frame around "what changed" (results), not "what I did"
- Pick just 3 projects with clear impact, like the onboarding funnel analysis, without overdoing the list
- Honestly include the points where I felt I fell short (the skill-gap doc) and present a growth direction alongside`,
    keyConclusion: 'Structuring around 3 results-focused stories plus growth points I\'ve recognized myself is far more persuasive than listing accomplishments.',
    learnings: `- Dropping the urge to show a lot and narrowing to 3 actually made each one's impact sharper
- Admitting shortcomings first, on my own, helps avoid looking defensive`,
    actionItems: ['Compile impact numbers for the 3 projects', 'Align on review direction in advance in a pre-review 1:1 with my manager'],
    followUpQuestions: ['From next quarter, should I keep monthly records instead of cramming during review season?'],
    rawConversation: [
      { role: 'user', content: "I have to prepare my first formal performance review since changing jobs and I have no idea what to highlight or how." },
      { role: 'assistant', content: "Of what you did this quarter, how many projects have clear results you can show with numbers?" },
      { role: 'user', content: "The onboarding funnel analysis seems the clearest, and there are a few others, but I worry it gets too long if I list them all." },
      { role: 'assistant', content: "Rather than listing many, narrowing to about 3 with clear impact is far more persuasive. Frame it around \"what changed,\" not \"what I did.\" And if you honestly include the points you felt fell short and present a growth direction too, it won't look defensive." },
    ],
  },

  // ── Side project (additional) ───────────────────────────────────
  {
    id: 's-offline-sync-design',
    categoryId: 'cat-sideproject',
    title: 'v2 cloud sync design — an offline-first principle',
    docType: 'spec',
    updatedAt: '2025-12-10T21:00:00Z',
    tags: ['sync', 'React Native', 'architecture'],
    relatedDocumentIds: ['s-architecture'],
    summary: `## Background
I decided to add the cloud sync deferred in v1 to v2. Since the structure started local-first, a poorly designed sync risks frequent data conflicts.

## Design direction
1. Even offline, local SQLite is always the source of truth
2. On returning online, merge by last-modified time (last-write-wins)
3. For simple data like habit check-ins, conflicts almost never arise in the first place, so I judged complex CRDTs unnecessary`,
    keyConclusion: 'At the data complexity of a habit tracker, last-write-wins is enough — I decided not to over-engineer.',
    learnings: `- Sync can get endlessly complex if you dig in theoretically; what matters is finding the level that fits the real data's nature (simple check-in records)
- Having settled on local-first in the architecture doc made this design much easier`,
    actionItems: ['Prototype the last-write-wins merge logic', 'Write test cases for conflict scenarios'],
    followUpQuestions: ['If social features (sharing with friends) come later, will I have to redesign the sync strategy from scratch?'],
    rawConversation: [
      { role: 'user', content: "I want to add the cloud sync I deferred in v1 to v2. But since I started local-first, I'm worried a badly designed sync will cause data conflicts." },
      { role: 'assistant', content: "Is the habit data actually complex enough to conflict across multiple devices at once?" },
      { role: 'user', content: "No, it's just simple check-in records, so not that complex." },
      { role: 'assistant', content: "Then something as complex as a CRDT doesn't look necessary. Keeping local SQLite as the source of truth even offline and merging by last-modified time on return online — last-write-wins — should be enough. Settling on local-first early in the architecture is making this design much easier now." },
    ],
  },
  {
    id: 's-app-store-review-rejection',
    categoryId: 'cat-sideproject',
    title: 'What I learned from an App Store review rejection',
    docType: 'general',
    updatedAt: '2026-02-05T22:00:00Z',
    tags: ['App Store review', 'iOS', 'side project'],
    summary: `## Situation
My first review submission was rejected under "Guideline 4.2 — Minimum Functionality." It was an unexpected reason, so I was thrown.

## Working out the cause
Because I scoped the MVP too narrowly, a reviewer may have seen it as little more than a "wrapped web view" app. I needed to highlight native-feeling features (widgets, notifications, etc.) more.`,
    keyConclusion: "I realized there's tension between the MVP philosophy (reduce scope) and App Store review criteria (show native value) — I'll resubmit with the notifications feature more prominent.",
    learnings: `- I learned that "cutting features" and "meeting review criteria" aren't always in the same direction
- Rather than taking the rejection reason at face value, it helped to infer how the app looked from the reviewer's point of view`,
    actionItems: ['Explicitly include notification/widget feature screenshots in the review notes', 'Search communities for similar rejection cases before resubmitting'],
    followUpQuestions: ['If it gets rejected again, should I go through the process of appealing directly to Apple?'],
    rawConversation: [
      { role: 'user', content: "I submitted RoutineMate for its first review and it was rejected for 'Guideline 4.2 — Minimum Functionality.' It's an unexpected reason and I'm a bit thrown." },
      { role: 'assistant', content: "You deliberately scoped the MVP narrowly. From a reviewer's point of view, that may have looked like little more than a \"wrapped web view\" app. Were the native-feeling features clearly shown in the review notes?" },
      { role: 'user', content: "Hmm, I don't think I emphasized them. There is a notifications feature, though." },
      { role: 'assistant', content: "Then try resubmitting with native features like notifications and widgets explicitly highlighted in the review notes and screenshots. So you've learned there's some tension between the MVP philosophy (reduce scope) and the review criteria (show native value)." },
    ],
  },
  {
    id: 's-analytics-integration',
    categoryId: 'cat-sideproject',
    title: 'Adding minimal usage analytics to RoutineMate',
    docType: 'spec',
    updatedAt: '2026-04-18T20:00:00Z',
    tags: ['usage analytics', 'privacy', 'side project'],
    relatedDocumentIds: ['a-sql-window-functions', 's-architecture'],
    summary: `## Background
I'm running the app with no idea how many users are keeping habits going for how many days. I need at least minimal metrics to set direction.

## Principle
Collect only anonymous aggregate metrics with no privacy burden (never the specific habit content) — just things like app-open frequency and average streak length.`,
    keyConclusion: 'I treat habit content itself as sensitive personal data and clearly exclude it from collection, adding only minimal usage-pattern aggregates.',
    learnings: `- Even in a side project, the moment you handle user data you have to set your own criteria for "what am I allowed to collect"
- The metric-design sense from my day job (product management) applied just as usefully to the side project`,
    actionItems: ['Integrate the analytics SDK and confirm the habit-content field is excluded from collection', 'State the collected items in the privacy policy'],
    followUpQuestions: ['If the user count grows, will I need more sophisticated metrics (retention cohorts, etc.) later?'],
    rawConversation: [
      { role: 'user', content: "I run RoutineMate but have no idea how many users keep habits going for how many days. I think I need to add at least minimal analytics." },
      { role: 'assistant', content: "How much data are you planning to collect?" },
      { role: 'user', content: "Well, seeing the habit content itself would make setting direction easier, but..." },
      { role: 'assistant', content: "Habit content is fairly sensitive personal data, so it's best to clearly exclude it from collection. Anonymous aggregate metrics like app-open frequency or average streak length should be enough to set direction. And state the collected items in the privacy policy too." },
    ],
  },
  {
    id: 's-beta-tester-feedback',
    categoryId: 'cat-sideproject',
    title: 'Synthesizing feedback from 15 beta testers',
    docType: 'report',
    updatedAt: '2026-07-08T21:00:00Z',
    tags: ['beta testing', 'user feedback', 'side project'],
    relatedDocumentIds: ['p-onboarding-funnel', 's-architecture'],
    summary: `## Background
I gathered 15 beta testers, mostly acquaintances, had them use it for 2 weeks, and collected feedback.

## Synthesis
- Most common request: "I want to see habits grouped by time of day" (separating morning/evening routines)
- Biggest drop-off point: on the permission request screen when first setting a reminder notification, 3 people deleted the app

## Response priority
The notification-permission drop-off is a carbon copy of the day job's onboarding funnel issue — I'll change the order to show "why it's needed" first, then request the permission.`,
    keyConclusion: 'Time-of-day grouping goes into the next update; for the notification-permission drop-off, apply the pattern learned at work as is (explain first, ask permission after).',
    learnings: `- I was surprised to see the exact same pattern as the onboarding drop-off at work reproduce in my own side project
- Even with acquaintances as beta testers, an anonymous survey format seems better for getting honest feedback (they seemed reluctant to say it directly)`,
    actionItems: ['Start designing the time-of-day grouping feature', 'Add an explanation screen before the notification permission request'],
    followUpQuestions: ['To scale up the beta test, where should I recruit testers?'],
    rawConversation: [
      { role: 'user', content: "I gathered 15 beta testers, mostly acquaintances, for 2 weeks, and synthesizing the feedback, 3 people deleted the app on the notification permission request screen." },
      { role: 'assistant', content: "That's the same pattern as the onboarding funnel issue at work — users get anxious and leave when asked for a permission without an explanation of why." },
      { role: 'user', content: "Oh, it really is. So exactly the same pattern showed up in my side project." },
      { role: 'assistant', content: "Just apply the fix you learned at work — change the order to show an explanation screen of \"why it's needed\" before requesting the permission. Time-of-day grouping was also a frequent request, so it'd be good to put that into the next update's design." },
    ],
  },

  // ── Finance (additional) ────────────────────────────────────────
  {
    id: 'f-emergency-fund',
    categoryId: 'cat-finance',
    title: 'How large should an emergency fund be?',
    docType: 'idea',
    updatedAt: '2025-11-30T19:00:00Z',
    tags: ['emergency fund', 'personal finance', 'risk management'],
    summary: `## The dilemma
I want to invest more, but I had no criteria for how much to keep as an emergency fund to invest with peace of mind.

## Summary
I confirmed that 3–6 months of living expenses is generally recommended as an emergency fund. Since I'm early in a new job and income stability isn't fully proven, I'll be more conservative at 6 months.`,
    keyConclusion: 'Set aside 6 months of living expenses separately in a highly liquid account like a CMA, and invest only spare money beyond that.',
    learnings: `- I realized the size of an emergency fund should be adjusted to my own income stability, not just the general rule (3–6 months)
- With a clear emergency-fund criterion, my anxiety when making investment decisions clearly decreased`,
    actionItems: ['Transfer 6 months of living expenses to a CMA account', 'Add a monthly routine to check the emergency fund account balance'],
    followUpQuestions: ['When the company starts to feel stable, can I reduce the fund to 3 months?'],
    rawConversation: [
      { role: 'user', content: "I want to invest a bit more, but I have no criteria for how much to keep as an emergency fund to invest with peace of mind." },
      { role: 'assistant', content: "Generally 3–6 months of living expenses is recommended as an emergency fund. How stable do you feel your income is right now?" },
      { role: 'user', content: "I changed jobs not long ago, so it doesn't feel fully proven." },
      { role: 'assistant', content: "Then it'd be better to be more conservative and go with 6 months rather than 3. Set it aside separately in a highly liquid account like a CMA, and invest only spare money beyond that — your anxiety should clearly decrease." },
    ],
  },
  {
    id: 'f-health-insurance-review',
    categoryId: 'cat-finance',
    title: 'Reviewing my health insurance — is what I have the right product?',
    docType: 'research',
    updatedAt: '2026-05-08T20:00:00Z',
    tags: ['insurance', 'personal finance', 'risk management'],
    summary: `## What prompted this
I realized I'd never looked again at the health (medical expense) insurance I signed up for 5 years ago, so I reviewed it.

## Findings
- The terms of this kind of insurance have been revised several times since I signed up, and I confirmed that the out-of-pocket rate on newer products has changed
- My current product isn't particularly disadvantageous, but I found a duplicate rider (an item already covered by my company's group insurance)`,
    keyConclusion: 'I canceled one duplicate rider and cut a small but unnecessary monthly expense. I felt that insurance isn\'t a sign-up-and-forget thing; it needs periodic review.',
    learnings: `- Insurance is a classic item you stop thinking about after signing up, and I didn't know duplicates can arise when company benefits (group insurance) change
- It's not a lot of money, but the habit of checking for "money leaking unnoticed" is itself a basic of personal finance`,
    actionItems: ['Apply to cancel the duplicate rider', 'Register an annual insurance review at the start of each year on the calendar'],
    followUpQuestions: ['Whenever group insurance coverage changes, should I re-check my personal policy as well?'],
    rawConversation: [
      { role: 'user', content: "I realized I've never looked again at the health insurance I signed up for 5 years ago, so I reviewed it." },
      { role: 'assistant', content: "Did you find anything when you reviewed it?" },
      { role: 'user', content: "Yeah, a rider that's also in my company's group insurance was duplicated in my personal policy." },
      { role: 'assistant', content: "Then canceling that duplicate rider will cut an unnecessary expense, small though it is each month. You only avoid this kind of duplication by re-checking your personal insurance whenever company benefits change, so I'd also recommend registering an annual insurance review at the start of every year on your calendar." },
    ],
  },

  // ── Running & health (additional) ───────────────────────────────
  {
    id: 'r-race-day-nutrition',
    categoryId: 'cat-running',
    title: 'Final pacing & nutrition strategy for race day',
    docType: 'spec',
    updatedAt: '2026-09-21T20:00:00Z',
    tags: ['half marathon', 'pacing', 'nutrition strategy'],
    relatedDocumentIds: ['r-half-marathon-plan'],
    summary: `## Background
The race is right around the corner. It's time to firm up the "race-day pacing strategy" I deferred in the training plan doc.

## Pacing
The goal is to finish — start the first 5 km slightly slower than usual training pace (to avoid going out too fast), then hold pace from the middle.

## Nutrition
- Carb-focused meal 2 hours before the race
- Start taking energy gels from the 15 km mark (already tested with the same product in training)
- Drink small amounts at each aid station, not a lot at once`,
    keyConclusion: 'The key is to avoid going out too fast and to execute the gel timing exactly as verified in training — no trying anything new on race day.',
    learnings: `- I understand why the running community keeps repeating "never try anything new on race day" — unfamiliar variables must not multiply
- Carrying the plan I made 12 weeks ago right up to just before the race, getting more specific as I go, feels quite systematic`,
    actionItems: ['Pack energy gels and set them up on the running belt in advance', 'Prepare a carb-focused dinner for the night before the race'],
    followUpQuestions: ['If race-day weather is hotter than expected, how should I adjust the pacing strategy?'],
    rawConversation: [
      { role: 'user', content: "The race is right around the corner. I want to firm up the race-day pacing and nutrition strategy I deferred when I made the 12-week plan." },
      { role: 'assistant', content: "Since your goal is to finish, it's best to start the first 5 km slightly slower than your usual training pace. Going out too fast is the biggest risk to finishing. Have you tested energy gels in training?" },
      { role: 'user', content: "Yeah, I tried the same product a few times in training. Taking it around the 15 km mark worked well." },
      { role: 'assistant', content: "Good job, just execute that exactly on race day. Never try anything new for the first time on race day — unfamiliar variables multiply. Drink small amounts at the aid stations instead of a lot at once, and eat a carb-focused meal 2 hours before the race and you're set." },
    ],
  },
  {
    id: 'r-taper-week-anxiety',
    categoryId: 'cat-running',
    title: 'Taper week: managing the anxiety that actually grows',
    docType: 'general',
    updatedAt: '2026-09-14T20:00:00Z',
    tags: ['tapering', 'running', 'mental management'],
    relatedDocumentIds: ['r-half-marathon-plan', 'm-burnout-warning-signs'],
    summary: `## Symptom
Now that I've entered the taper week with reduced training volume, my anxiety of "is it okay not to run this much?" has actually grown.

## Verification
Looking through running communities and related material, I confirmed that anxiety during the taper is very common, and that forcing extra training during this period actually backfires on race-day condition.`,
    keyConclusion: "Confirmed that taper anxiety is 'a problem of the mind, not the body,' and I'll keep to reducing volume as planned.",
    learnings: `- I felt that my body's readiness and the anxiety my mind feels don't always match
- I came to think that trusting that the me who made the plan (12 weeks ago) was more rational than the anxious me now, and following it, is part of training`,
    actionItems: ['Keep the taper week plan as is; resist the temptation for extra training', 'Focus on managing condition with light stretching and sleep'],
    followUpQuestions: ['Will this anxiety come just the same when I prepare for the next race, or will it fade with experience?'],
    rawConversation: [
      { role: 'user', content: "I've entered the taper week and my anxiety of 'is it okay not to run this much?' has actually grown." },
      { role: 'assistant', content: "That's a really common psychological phenomenon during the taper. Have you felt the temptation to do extra training?" },
      { role: 'user', content: "Yeah, honestly I wondered if I should run a bit more." },
      { role: 'assistant', content: "Forcing extra training at that point actually backfires on race-day condition. Trust that the you who made the plan 12 weeks ago made a more rational call than the anxious you now, and stick to reducing volume as planned. Instead, focus on light stretching and sleep." },
    ],
  },

  // ── Cooking & lifestyle (additional) ────────────────────────────
  {
    id: 'k-knife-sharpening',
    categoryId: 'cat-cooking',
    title: 'Why cooking got easier after I learned to sharpen knives',
    docType: 'general',
    updatedAt: '2026-01-10T20:00:00Z',
    tags: ['knife care', 'cooking', 'kitchenware'],
    relatedDocumentIds: ['k-cast-iron-seasoning'],
    summary: `## What prompted this
My knife wasn't cutting, so I kept pressing down hard and almost hurt my hand. I decided to sharpen it myself on a whetstone.

## What I learned
- Holding the angle steady at 15–20 degrees is key — at first I had no feel for it, so I even stuck an angle-guide sticker on and practiced with a YouTube video
- Use whetstones in order: coarse (grinding) → fine (finishing)`,
    keyConclusion: "I felt the paradox that when a knife is sharp, food cuts without force, so the risk of hurting my hand actually goes down — I'll make regular knife care a habit.",
    learnings: `- I'd only heard that "a dull knife is more dangerous," and only felt it after experiencing it myself (you press harder, so the risk of slipping goes up)
- Investing time in tool care ends up improving both cooking time and safety every time`,
    actionItems: ['Register monthly knife sharpening as a routine on the calendar', 'Learn how to store the whetstone (dry completely after use)'],
    followUpQuestions: ['In the long run, which is easier to maintain — an electric sharpener or a whetstone?'],
    rawConversation: [
      { role: 'user', content: "My knife wasn't cutting so I kept pressing down hard and almost hurt my hand. I want to sharpen it myself on a whetstone — how do I do it?" },
      { role: 'assistant', content: "The key is to hold the angle steady at 15–20 degrees. You won't have a feel for it at first, so an angle guide tool or sticker helps. Use the whetstones in order from coarse to fine." },
      { role: 'user', content: "I tried it and the knife definitely cuts well, so I don't need to use force. It feels safer, if anything." },
      { role: 'assistant', content: "Right, that's exactly why a dull knife is more dangerous — you have to press harder, so the risk of slipping goes up. If you register a monthly knife sharpening on your calendar as a routine, you'll be able to keep cooking safely and comfortably." },
    ],
  },
]
