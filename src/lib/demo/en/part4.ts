// English version of the demo knowledge base (part 4).
import type { DemoDocument } from '../notes-data'

export const DEMO_DOCUMENTS_EN_4: DemoDocument[] = [
  // ── Living alone & household ────────────────────────────────────
  {
    id: 'h-apartment-lease-renewal',
    categoryId: 'cat-home',
    title: 'What to check before renewing a jeonse lease',
    docType: 'general',
    updatedAt: '2025-12-01T19:00:00Z',
    tags: ['jeonse', 'lease renewal', 'living alone'],
    summary: `## Background
My jeonse (lump-sum deposit) lease expires in 2 months. A checklist before deciding whether to renew or move.

## Checklist
1. Whether to renew the deposit return guarantee
2. Whether the current deposit is fair relative to nearby market prices
3. When to settle renewal intent with the landlord (finalize by 1 month before expiry)

## Decision
It isn't far off nearby market prices and the distance to work is satisfying, so I decided to renew.`,
    keyConclusion: 'Factoring in moving costs (agent fee, movers), renewing is the rational choice under current conditions.',
    learnings: `- I learned that deciding in a rush near expiry weakens negotiating power — decide at least 2 months ahead
- The renewal decision has to include moving costs in the calculation for an accurate comparison`,
    actionItems: ['Apply to renew the deposit return guarantee', 'Tell the landlord I intend to renew'],
    followUpQuestions: ['At the next renewal, under what conditions should I consider moving?'],
    rawConversation: [
      { role: 'user', content: "My jeonse lease expires in 2 months and I have to decide whether to renew or move. What should I check?" },
      { role: 'assistant', content: "First check whether to renew the deposit return guarantee and whether the current deposit is fair relative to nearby market prices. It's best to settle renewal intent with the landlord by 1 month before expiry. How is the market right now?" },
      { role: 'user', content: "I just checked, and it's not far off nearby market prices. The distance to work is satisfying too." },
      { role: 'assistant', content: "Then, factoring in moving costs (agent fee, movers), renewing seems more rational. Apply to renew the deposit return guarantee first, and let the landlord know you intend to renew." },
    ],
  },
  {
    id: 'h-robot-vacuum-review',
    categoryId: 'cat-home',
    title: 'Three months with a robot vacuum: a review',
    docType: 'general',
    updatedAt: '2026-03-15T20:00:00Z',
    tags: ['robot vacuum', 'living alone', 'home appliances'],
    summary: `## Background
With frequent late nights I had no time to clean, so I bought a robot vacuum. Here are my thoughts after 3 months.

## The good
- Floor dust is clearly reduced, especially hair
- Scheduling via the app means I don't have to think about it

## The not-so-good
- Areas with wires/cables still have to be cleared by a person beforehand
- The mapping sometimes gets tangled, causing the inefficiency of cleaning the same zone twice`,
    keyConclusion: 'It isn\'t fully automatic, but it definitely lightens the floor-cleaning burden — the effect is maximized when paired with the habit of tidying cables.',
    learnings: `- The realistic expectation is that a robot vacuum is a tool that "reduces repetitive labor," not one that "fully replaces a person"
- By using it I learned there's a minimum of prep, like tidying cables, that a person has to do in advance`,
    actionItems: ['Buy a cable organizer to minimize floor cables', 'Readjust the mapping-tangle issue in the app settings'],
    followUpQuestions: ['Is it worth upgrading to a higher-end model that also mops?'],
    rawConversation: [
      { role: 'user', content: "I have no time to clean because of frequent late nights, so I bought a robot vacuum, and I want to write up how it's been after 3 months. Floor dust is definitely reduced." },
      { role: 'assistant', content: "Were there any downsides?" },
      { role: 'user', content: "I still have to clear areas with wires beforehand, and the mapping sometimes gets tangled so it cleans the same zone twice." },
      { role: 'assistant', content: "It's realistic to see a robot vacuum as a tool that reduces repetitive labor rather than fully replacing a person. Getting a cable organizer to minimize floor cables should boost the effect, and you can try readjusting the mapping in the app settings to fix the tangling." },
    ],
  },
  {
    id: 'h-declutter-project',
    categoryId: 'cat-home',
    title: 'Minimalist decluttering project — setting criteria for unused things',
    docType: 'idea',
    updatedAt: '2026-06-20T18:00:00Z',
    tags: ['minimalism', 'tidying', 'living alone'],
    summary: `## What prompted this
I'm not even moving, yet the place keeps feeling cramped. I realized it's because things keep piling up and I never throw them out.

## Criteria
1. Anything unused for a year is automatically a candidate for disposal
2. "I might use it someday" counts as a reason to keep, not a reason not to dispose — banned as justification
3. Only things with sentimental value are exceptions, kept in a small storage box

## Execution
Start with the closet and go category by category. In the first week I only did the closet, and the felt space grew noticeably.`,
    keyConclusion: "Just one rule — not accepting 'I might use it someday' as a reason to keep — sped up the decluttering a lot.",
    learnings: `- I realized the reason I couldn't tidy wasn't that I had too much stuff but that I had no criteria for judging
- Going category by category lowered the burden of trying to do it all at once`,
    actionItems: ['Tidy the kitchenware category next weekend', 'List items to be disposed of on a secondhand marketplace app'],
    followUpQuestions: ["To keep the tidied state, should I also apply a 'one in, one out' rule?"],
    rawConversation: [
      { role: 'user', content: "I'm not even moving, but the place keeps feeling cramped. I think it's because stuff piles up and I never throw it away." },
      { role: 'assistant', content: "Do you have criteria for decluttering, or do you go by feel?" },
      { role: 'user', content: "No criteria. I keep just holding on \"in case I use it someday.\"" },
      { role: 'assistant', content: "Set a rule that that phrase counts as a reason to keep, not a reason not to dispose. Make anything unused for a year an automatic disposal candidate, and keep only things with sentimental value as a small exception. Doing everything at once is a burden, so I'd recommend going category by category, starting with the closet." },
    ],
  },

  // ── English study ───────────────────────────────────────────────
  {
    id: 'e-business-english-practice',
    categoryId: 'cat-language',
    title: 'Business English speaking practice routine',
    docType: 'general',
    updatedAt: '2025-11-25T20:30:00Z',
    tags: ['English study', 'business English', 'speaking'],
    summary: `## Background
With more video meetings with global clients, I feel my lack of spoken English. I especially stumble when giving opinions off the cuff.

## Practice routine
- Three times a week, a 30-minute video conversation lesson after work
- Write out expressions likely to come up in meetings as sentences and practice them repeatedly
- Re-listen to actual meeting recordings (with permission) and check where I stumbled`,
    keyConclusion: "Confirmed that the real weakness isn't grammar but 'the quickness to give opinions on the spot' — I adjusted practice toward real-world simulation over memorizing expressions.",
    learnings: `- I felt that exam English (grammar, reading) and real meeting English are completely different muscles
- Recording and listening to my own actual meetings was the most accurate self-diagnosis`,
    actionItems: ['Compile 20 expressions likely to come up in meetings and practice them repeatedly', 'From the next meeting, ask permission to record and review'],
    followUpQuestions: ['Besides conversation lessons, how else can I increase everyday English exposure?'],
    rawConversation: [
      { role: 'user', content: "With more video meetings with global clients I feel my lack of English. I stumble especially when giving opinions on the spot." },
      { role: 'assistant', content: "Are you fairly confident in grammar and reading?" },
      { role: 'user', content: "That was fine for exams, but real meetings feel completely different." },
      { role: 'assistant', content: "Exam English and real meeting English really are different muscles. Focusing on real-world simulation is more helpful than memorizing expressions. If you get permission and record an actual meeting to listen to again, you can diagnose most precisely where you stumble." },
    ],
  },
  {
    id: 'e-toeic-speaking-prep',
    categoryId: 'cat-language',
    title: 'What I sorted out while preparing for OPIc / TOEIC Speaking',
    docType: 'general',
    updatedAt: '2026-02-10T20:00:00Z',
    tags: ['OPIc', 'English exams', 'English study'],
    summary: `## Background
I need an official score, so I started preparing for OPIc. It's a somewhat different kind of test from real conversation, so it needed its own strategy.

## Summary
- For frequent topics like self-introduction, hobbies and daily routine, build template answers in advance and only vary them
- Search of test-taker reviews confirmed that keeping a consistent answer structure (experience → feeling → conclusion) helps with scoring`,
    keyConclusion: "I accepted that exam-style speaking needs a separate strategy of 'learning the answer structure,' independent of real conversation skill, and split my preparation accordingly.",
    learnings: `- I felt firsthand that real English ability and test scores aren't necessarily proportional
- Building templates may feel like "memorization," but in the special situation of an exam it's an efficient strategy`,
    actionItems: ['Write template answers for the 8 most frequent topics', 'Take 2 timed mock tests as in the real exam'],
    followUpQuestions: ['How should I split time between exam prep and real conversation practice?'],
    rawConversation: [
      { role: 'user', content: "I need an official score so I started preparing for OPIc. But it feels a bit different in kind from real conversation practice." },
      { role: 'assistant', content: "In what ways does it feel different?" },
      { role: 'user', content: "There are frequent topics like self-introduction and hobbies, and trying to answer those off the cuff every time actually makes it harder to organize." },
      { role: 'assistant', content: "For those topics it's more efficient to build template answers in advance and only vary them. And it's known to help scoring if you keep the answer structure consistent as experience → feeling → conclusion. Think of it as preparing exam strategy separately from real conversation." },
    ],
  },
  {
    id: 'e-english-meeting-phrases',
    categoryId: 'cat-language',
    title: 'Expressions I use often in English meetings',
    docType: 'general',
    updatedAt: '2026-05-12T14:00:00Z',
    tags: ['English study', 'business English', 'meeting phrases'],
    relatedDocumentIds: ['e-business-english-practice'],
    summary: `## Background
After several months of global meetings, some expressions I keep using have emerged, so I'm writing them down.

## Expressions I collected
- Offering an opinion: "From my perspective, ..." / "I'd like to build on that..."
- Polite disagreement: "I see your point, but have we considered..."
- Asking for clarification: "Just to make sure I understand correctly, ..."`,
    keyConclusion: 'Learning phrases for polite disagreement was the most practical — useful when blunt disagreement feels uncomfortable culturally.',
    learnings: `- Expressions learned in situations where I actually needed them stay in memory much longer than ones I memorized whole
- I realized polite disagreement is closer to a communication-style issue than an English-skill issue`,
    actionItems: ['Remind myself of the expression list once before each meeting', 'Add expressions right away when I use them in new situations'],
    followUpQuestions: ['Would it help to share this expression list with other colleagues on the team?'],
    rawConversation: [
      { role: 'user', content: "After a few months of global meetings I've accumulated English expressions I keep reusing. I want to write them down." },
      { role: 'assistant', content: "In which situations did you get stuck most often?" },
      { role: 'user', content: "Politely disagreeing was the hardest. Speaking bluntly feels uncomfortable." },
      { role: 'assistant', content: "An expression like \"I see your point, but have we considered...\" is exactly for that. It'd also be good to note down opinion-offering (\"From my perspective, ...\") and clarification requests (\"Just to make sure I understand correctly, ...\") together. Expressions learned in situations where you really needed them will stay with you longer than ones you memorize whole." },
    ],
  },
  {
    id: 'e-shadowing-routine',
    categoryId: 'cat-language',
    title: 'Improving English listening with shadowing',
    docType: 'general',
    updatedAt: '2026-08-15T20:00:00Z',
    tags: ['English study', 'shadowing', 'listening practice'],
    summary: `## Background
My speaking is improving little by little, but listening — especially fast conversation among native speakers — I still catch less than half.

## Routine
Shadowing on the commute: pause a podcast one sentence at a time and repeat it, 15 minutes a day. Start with slower content and gradually raise the speed.`,
    keyConclusion: 'I accept that listening won\'t improve unless I invest in it separately, and will secure 15 minutes every day as a fixed routine.',
    learnings: `- It took a few months to feel that speaking practice alone doesn't improve listening
- Shadowing is boring, but doing it for even a short 15 minutes every day feels more effective than cramming`,
    actionItems: ['Build podcast playlists by difficulty', 'After a month, check the change in how listening feels'],
    followUpQuestions: ['Is there a way to measure the effect of shadowing objectively (dictation tests, etc.)?'],
    rawConversation: [
      { role: 'user', content: "My speaking seems to be improving little by little, but listening — especially native speakers talking fast — I still catch less than half." },
      { role: 'assistant', content: "Have you mostly focused on speaking practice?" },
      { role: 'user', content: "Yeah, come to think of it, I never invested in listening separately." },
      { role: 'assistant', content: "Listening is something you have to invest in separately from speaking. I recommend shadowing — pausing a podcast one sentence at a time and repeating it, 15 minutes a day on your commute. Start with slower content and gradually raise the speed." },
    ],
  },

  // ── Burnout management & mental care ────────────────────────────
  {
    id: 'm-burnout-warning-signs',
    categoryId: 'cat-mental',
    title: 'Self-checking for early signs of burnout',
    docType: 'research',
    updatedAt: '2026-01-20T21:00:00Z',
    tags: ['burnout', 'mental care', 'self-management'],
    relatedDocumentIds: ['r-recovery-routine'],
    summary: `## What prompted this
For the past few weeks my interest in work has noticeably dropped and I can't focus even in meetings. I wanted to tell whether it's just fatigue or a burnout signal.

## The checklist I compiled
1. Emotional exhaustion — no energy left no matter what I do
2. Cynicism — growing doubt about the meaning of the work
3. Reduced efficacy — a fading sense that I'm doing well

I referenced the standard that if two or more of the three persist for 2+ weeks, it counts as a burnout signal.`,
    keyConclusion: 'I recognized that emotional exhaustion and reduced efficacy have persisted for the third week — I judged it a signal beyond simple fatigue that needs a response.',
    learnings: `- I learned for the first time that there are criteria distinguishing "tired" from "burnout" — you can judge with a checklist rather than a vague feeling
- I felt that recognizing the symptoms is itself the first step of responding`,
    actionItems: ['For now, turn off work notifications outside work hours', 'Look into counseling (therapy) if needed'],
    followUpQuestions: ['How candid should I be with my manager about my current state?'],
    rawConversation: [
      { role: 'user', content: "For the past few weeks my interest in work has noticeably dropped and I can't focus even in meetings. I want to tell whether it's just fatigue or burnout." },
      { role: 'assistant', content: "Burnout is usually assessed through three signals: emotional exhaustion, cynicism and reduced efficacy. How is each — do you have no energy left no matter what you do, has doubt about the meaning of work grown, has your sense of doing well faded?" },
      { role: 'user', content: "The no-energy part and reduced efficacy, those two definitely apply. I think it's been about 3 weeks." },
      { role: 'assistant', content: "There's a standard that two of the three persisting for 2+ weeks counts as a burnout signal, and your situation fits exactly. I'd treat it as more than simple fatigue and respond — turn off notifications outside work hours, and consider looking into counseling if needed." },
    ],
  },
  {
    id: 'm-digital-detox-weekend',
    categoryId: 'cat-mental',
    title: 'Trying a digital detox weekend',
    docType: 'general',
    updatedAt: '2026-04-28T21:00:00Z',
    tags: ['digital detox', 'burnout', 'rest'],
    summary: `## The attempt
From Saturday morning to Sunday evening I deleted the work Slack/email apps from my phone and didn't look at them at all.

## What I felt
The first few hours were anxious (a feeling I was missing something), but after half a day my thoughts actually felt more organized. When I got to work Monday, the backlog of notifications wasn't much either.`,
    keyConclusion: "Confirmed that the 'anxiety about missing something' was far more exaggerated than the real need. I'll try this routine about once a month.",
    learnings: `- I felt that the pressure of having to be always connected was itself a big part of the stress
- After actually deleting the apps, none of the "things I missed" were truly urgent`,
    actionItems: ['Fix a monthly digital-detox weekend on the calendar in advance', 'Tell the team in advance that urgent contact should come by phone only'],
    followUpQuestions: ['Could I apply a similar rule on weekday evenings, at least?'],
    rawConversation: [
      { role: 'user', content: "This weekend I deleted the work Slack and email apps from my phone and didn't look at them at all from Saturday morning to Sunday evening." },
      { role: 'assistant', content: "How was it?" },
      { role: 'user', content: "The first few hours I was anxious that I was missing something, but after half a day my thoughts actually felt more organized. The backlog on Monday wasn't much either." },
      { role: 'assistant', content: "So you confirmed that the anxiety about missing something was exaggerated relative to the real need. Since it was a good experience, I'd recommend fixing it on the calendar in advance about once a month. Telling the team beforehand that urgent contact should come by phone only will let you rest easy." },
    ],
  },
  {
    id: 'm-therapy-first-session',
    categoryId: 'cat-mental',
    title: 'Thoughts after my first counseling session',
    docType: 'general',
    updatedAt: '2026-07-10T20:00:00Z',
    tags: ['counseling', 'mental care', 'burnout'],
    relatedDocumentIds: ['m-burnout-warning-signs', 'l-delegating-tasks'],
    summary: `## Background
After recognizing the burnout signs I kept putting it off, but I finally went to my first counseling (therapy) session.

## Thoughts
It was less a place that "solves my problem" and more one that "asks questions so I sort things out myself." During the conversation I realized on my own that the stress of building trust after changing jobs and my perfectionism are connected to the roots of the burnout.`,
    keyConclusion: 'I learned it\'s not about going to get answers right away but a process of understanding myself. I decided to keep going consistently for several sessions.',
    learnings: `- The vague reluctance about counseling (the prejudice that it's only for serious cases) turned out to be groundless once I went
- Through the conversation I put into words for the first time that perfectionism, job-change stress and burnout are one connected pattern`,
    actionItems: ['Book counseling every other week', 'Keep recording insights from counseling in verilix to track patterns'],
    followUpQuestions: ['Do I need to tell my company about this, or can I manage it privately?'],
    rawConversation: [
      { role: 'user', content: "After recognizing the burnout signs I kept putting it off, but I finally went to my first counseling session." },
      { role: 'assistant', content: "How was it?" },
      { role: 'user', content: "It wasn't a place that solves the problem right away; it felt like it asked questions so I'd sort things out myself. In the conversation I realized on my own that the trust-building stress after changing jobs and my perfectionism are linked to the burnout." },
      { role: 'assistant', content: "That ties in with what you'd written about not being able to delegate because of perfectionism. If you think of it not as getting answers right away but as a process of understanding yourself, it seems good to keep going consistently for several sessions." },
    ],
  },

  // ── Product management (additional) ─────────────────────────────
  {
    id: 'p-user-interview-synthesis',
    categoryId: 'cat-product',
    title: 'Ran 5 user interviews and synthesized them myself for the first time',
    docType: 'research',
    updatedAt: '2025-11-15T16:00:00Z',
    tags: ['user interviews', 'qualitative research', 'PM'],
    relatedDocumentIds: ['c-skill-gap', 'p-onboarding-funnel'],
    summary: `## Background
As I'd resolved in the skill-gap doc, for the first time I ran 5 user interviews myself instead of delegating to the researcher.

## Findings
- Three of five said, each in different words, something to the effect that "the connection process is scary" — exactly matching the pattern I'd seen in session replays
- Hearing it directly revealed the 'why it's scary' (vague anxiety about data deletion/corruption) that session replays alone couldn't tell me`,
    keyConclusion: 'Doing qualitative research myself let me confirm the "reason" behind the pattern the quantitative data showed — from now on I\'ll directly interview at least 3 people before major decisions.',
    learnings: `- The gap in information between reading the researcher's summary and hearing it directly was bigger than I expected
- Concrete reasons like "why it's scary" often only come out when you ask a question and the conversation continues — quantitative data can never catch them`,
    actionItems: ['Propose adding safety-net copy about data deletion/corruption on the connection screen', 'From next quarter, make it a routine to directly interview at least 3 people per major feature'],
    followUpQuestions: ['How should I pick interviewees so the sample is representative and unbiased?'],
    rawConversation: [
      { role: 'user', content: "As I'd resolved while mapping my skill gaps, I ran 5 user interviews myself this time instead of handing them to the researcher." },
      { role: 'assistant', content: "How was it doing it yourself?" },
      { role: 'user', content: "Three of five said 'the connection process is scary' in different words. It matched the pattern I saw in session replays exactly. But I didn't know 'why it's scary' until I heard it directly — it was a vague anxiety about data deletion or corruption." },
      { role: 'assistant', content: "So you confirmed the \"reason\" behind the pattern the quantitative data showed. If the reason is anxiety about data safety, adding safety-net copy to the connection screen seems the right next action. It'd also be good to build a routine of directly interviewing at least 3 people before major decisions." },
    ],
  },
  {
    id: 'p-feature-flag-rollout',
    categoryId: 'cat-product',
    title: 'Staged rollout strategy for new features (Feature Flags)',
    docType: 'spec',
    updatedAt: '2026-01-22T15:00:00Z',
    tags: ['rollout strategy', 'feature flags', 'product'],
    summary: `## Background
After the experience of releasing a new dashboard feature to all users at once and rolling back because of an unexpected bug, I wrote up a staged rollout process.

## Stages
1. Internal team only (1 week)
2. 5% early-adopter group (1 week, monitor key metrics)
3. 25% → 50% → 100% (observe at least 3 days per stage)

I also agreed with engineering on a rule to automatically roll back to the previous stage if error rate/drop-off exceeds the threshold at any stage.`,
    keyConclusion: 'Standardized on a process with at least 4 gates before full rollout. It slows speed, but preventing major outages is the faster path in the long run.',
    learnings: `- I felt that "ship fast" and "ship safely" aren't always a trade-off — staged rollout reduces big rollback incidents, so on average it's actually faster
- If you don't set automatic rollback criteria as numbers up front, you end up deciding "roll back or not" emotionally when something blows up`,
    actionItems: ['Document the Feature Flag rollout process and share it with the whole team', 'Finalize the automatic rollback metrics with engineering'],
    followUpQuestions: ['For cases like urgent hotfixes where staged rollout doesn\'t fit, how should we set up an exception process?'],
    rawConversation: [
      { role: 'user', content: "Last time I shipped the new dashboard feature to all users at once and had to roll back because of an unexpected bug. Now I want to write up a staged rollout process." },
      { role: 'assistant', content: "It's common to set gates in the order internal team → early adopters → gradual expansion. Have you set the observation period and rollback criteria for each stage in advance?" },
      { role: 'user', content: "No, back then we only discussed whether to roll back with the team after the problem happened." },
      { role: 'assistant', content: "That's the riskiest point. If you set error-rate or drop-off thresholds as numbers in advance, you can roll back automatically instead of deciding emotionally when something blows up. I'd recommend documenting a 4-stage gate as the standard process — internal 1 week → 5% 1 week → 25%→50%→100% at 3 days each." },
    ],
  },
]
