// English version of the demo knowledge base (part 3).
import type { DemoDocument } from '../notes-data'

export const DEMO_DOCUMENTS_EN_3: DemoDocument[] = [
  // ── Reading & self-improvement ──────────────────────────────────
  {
    id: 'b-atomic-habits-notes',
    categoryId: 'cat-reading',
    title: 'Notes on a habit-building book — systems beat goals',
    docType: 'general',
    updatedAt: '2025-11-05T20:00:00Z',
    tags: ['reading', 'habits', 'self-improvement'],
    relatedDocumentIds: ['s-architecture'],
    summary: `## Core idea
The book's central claim is that you should focus on systems (a daily running routine) rather than goals (e.g. finishing a marathon). Motivation disappears the moment you hit a goal, but a system keeps running.

## Three practical principles
1. **Make it Obvious**: decide specifically when and where ("put on running shoes at 7 a.m. after waking" instead of "exercise in the morning")
2. **Make it Attractive**: bundle it with something you want to do (habit stacking)
3. **Make it Easy**: the 2-minute rule — no matter how small, starting is what matters`,
    keyConclusion: 'This ties into why I\'m building the habit tracker app (RoutineMate) — it reaffirmed the direction of a tool that tracks systems, not goals.',
    learnings: `- The book laid out the limits of goal-centered thinking in theory, and it happened to match the philosophy of the app I'm building
- Small-start strategies like the "2-minute rule" look applicable to my actual running habit`,
    actionItems: ["Consider adding a 'habit stacking' suggestion feature to RoutineMate", 'Try the 2-minute rule on my running habit'],
    followUpQuestions: ['Can systems-centered thinking be applied to work (the product roadmap) too?'],
    rawConversation: [
      { role: 'user', content: "I read a book on habit formation, and the core message was to focus on systems over goals. A goal like finishing a marathon loses its motivation the moment you achieve it." },
      { role: 'assistant', content: "Was there a practical principle from the book that stood out to you?" },
      { role: 'user', content: "The 2-minute rule was interesting. The idea that starting is what matters, however small the action." },
      { role: 'assistant', content: "That lines up with the philosophy of the habit tracker you're building — a tool that tracks systems (routines) rather than goals, so you've reaffirmed that direction. Applying the 2-minute rule to your running habit could make a fun experiment." },
    ],
  },
  {
    id: 'b-thinking-fast-slow-notes',
    categoryId: 'cat-reading',
    title: 'Notes on a book about judgment and decisions — System 1 / System 2',
    docType: 'general',
    updatedAt: '2025-12-15T20:00:00Z',
    tags: ['reading', 'decision making', 'psychology'],
    summary: `## Core concepts
- System 1: fast, intuitive, automatic (emotion, first impressions)
- System 2: slow, logical, requires conscious effort (calculation, careful judgment)

What struck me is that System 1 makes most judgments, and System 2 often justifies them rather than reviewing them.

## Applying it at work
When doing competitor analysis or setting roadmap priorities, I'll consciously build the habit of re-examining conclusions that "feel intuitively right" with System 2.`,
    keyConclusion: 'I won\'t ignore intuition (System 1), but for more important decisions I\'ll consciously add a System 2 review step.',
    learnings: `- Understanding that confirmation bias is a natural product of System 1 makes me view my own judgments more humbly
- The big takeaway was learning, in theory, that the very feeling of "I'm sure" can be wrong`,
    actionItems: ["Consciously add a 'look for counter-evidence' step before important decisions"],
    followUpQuestions: ['Is there a way to prevent collective System 1 judgment (getting swept up in the mood) in team meetings?'],
    rawConversation: [
      { role: 'user', content: "I'm reading a book on judgment and decision-making, and the System 1 (intuition) vs System 2 (logical thinking) idea is interesting. It stung a bit that System 1 makes most judgments and System 2 only justifies them." },
      { role: 'assistant', content: "Have you felt that pattern at work?" },
      { role: 'user', content: "When I do competitor analysis, the intuition that 'this seems right' comes first and then I go find evidence to attach to it." },
      { role: 'assistant', content: "That's exactly the pattern the book describes. You don't need to discard intuition, but for more important decisions, adding a System 2 review step where you consciously look for counter-evidence can reduce confirmation bias." },
    ],
  },
  {
    id: 'b-nonviolent-communication',
    categoryId: 'cat-reading',
    title: 'Notes on Nonviolent Communication — separating observation from evaluation',
    docType: 'general',
    updatedAt: '2026-01-28T20:00:00Z',
    tags: ['reading', 'communication', 'nonviolent communication'],
    relatedDocumentIds: ['l-giving-feedback', 'l-cross-team-conflict'],
    summary: `## Core framework
1. Observation (facts only, no evaluation): "This doc has no conclusion" (yes) vs "This doc is sloppy" (no, that's an evaluation)
2. Feeling: my emotion resulting from that observation
3. Need: the need of mine behind that feeling
4. Request: a concrete, actionable ask

## Applying it
I found I'd been using this framework unconsciously in my recent teammate-feedback doc too — it's practically the same as the "talk about behavior" principle.`,
    keyConclusion: 'It feels like the feedback principle I was already practicing now has a theoretical skeleton. I\'ll consciously use the four steps — observation, feeling, need, request — more precisely.',
    learnings: `- Attaching theoretical language to something I did by instinct at work makes it feel like a repeatable skill
- Practicing the distinction between "evaluation" and "observation" is harder than expected — my everyday speech had far more evaluation mixed in`,
    actionItems: ["For a week, check myself every time I use an 'evaluation' word in conversation"],
    followUpQuestions: ['What if I apply this framework directly to a conflict situation (like the priority negotiation with the design team)?'],
    rawConversation: [
      { role: 'user', content: "I'm reading Nonviolent Communication and the core is separating observation from evaluation. 'This doc is sloppy' is an evaluation, while 'I couldn't find where the conclusion is' is an observation." },
      { role: 'assistant', content: "That sounds like a principle similar to what you wrote up about teammate feedback recently, doesn't it?" },
      { role: 'user', content: "Oh, right! I'd noted then to talk about behavior, and this is the same thing." },
      { role: 'assistant', content: "So what you did by instinct at work now has a theoretical skeleton. Practicing the distinction between observation and evaluation is quite hard, though — everyday speech has more evaluation mixed in than you'd think. This week, checking yourself each time you use an evaluative word in conversation would make good practice." },
    ],
  },
  {
    id: 'b-deep-work-notes',
    categoryId: 'cat-reading',
    title: 'Notes on Deep Work — treating focus as a resource',
    docType: 'general',
    updatedAt: '2026-03-22T20:00:00Z',
    tags: ['reading', 'focus', 'productivity'],
    summary: `## Core claim
Shallow work (email, Slack replies) never produces valuable output no matter how much you do. You have to deliberately secure time for "deep work" — immersed focus without interruption.

## What I'm trying
Fix 9–11 a.m. every day on the calendar as a "deep work block" and turn off Slack notifications during that time.`,
    keyConclusion: 'I\'ll flip the order so deep work time is "secured first" rather than "done if there\'s time left."',
    learnings: `- Looking back over my days, I realized I spend all my time on shallow work and cram the actually important document writing into late nights
- I felt that even getting into a flow state needs warm-up time — if interrupted midway, you start over`,
    actionItems: ['Fix a 9–11 a.m. deep work block on the calendar every day', 'Turn off Slack/email notifications during that time'],
    followUpQuestions: ['If the whole team shared this time slot, could we make it a meeting-free window?'],
    rawConversation: [
      { role: 'user', content: "I read a book on deep work, and it stung that shallow work (email, Slack replies) never produces valuable output no matter how much you do." },
      { role: 'assistant', content: "Looking back over your day, how much deep work time would you say you have?" },
      { role: 'user', content: "Almost none, I think. I always cram important document writing into late nights." },
      { role: 'assistant', content: "Then try flipping the order so deep work time is \"secured first\" rather than \"done if there's time left.\" Fix a block like 9–11 a.m. every day on the calendar and turn off Slack notifications during it." },
    ],
  },
  {
    id: 'b-reading-habit-system',
    categoryId: 'cat-reading',
    title: 'My own system for sustaining a reading habit',
    docType: 'general',
    updatedAt: '2026-05-19T19:00:00Z',
    tags: ['reading habit', 'routine', 'self-improvement'],
    summary: `## The problem
I buy lots of books but rarely finish them. All that builds up is the burden of "I should be reading."

## The system
1. Read only on the subway commute (no need to carve out separate time)
2. Drop the pressure to finish every book — it's fine to put one down midway if it doesn't fit
3. Leave every book I read as a document, even just a one-line summary (this very habit of organizing in verilix)`,
    keyConclusion: "Dropping the compulsion to finish and switching to 'slotting into an existing routine (the commute)' actually increased how much I read.",
    learnings: `- Trying to create new time tends to fail; attaching to an existing routine is far more sustainable
- Once I dropped the burden of finishing, I ended up trying more books`,
    actionItems: ['Line up the next 3 books in a queue', 'Keep up the one-line-summary documenting habit'],
    followUpQuestions: ['For subway reading, which is better — e-books or paper books?'],
    rawConversation: [
      { role: 'user', content: "I buy lots of books but my completion rate is so low. All that keeps building is the burden of 'I should be reading.'" },
      { role: 'assistant', content: "When do you usually try to read?" },
      { role: 'user', content: "I try to set aside separate time but I can't keep it up." },
      { role: 'assistant', content: "Trying to create new time tends to fail. Attaching to an existing routine like your subway commute is far more sustainable. And drop the pressure to finish — it's fine to put a book down midway if it doesn't suit you. If you leave even a one-line summary of what you read, it's easier to find again later." },
    ],
  },
  {
    id: 'b-inspired-pm-book-notes',
    categoryId: 'cat-reading',
    title: 'Notes on a must-read PM book — problem definition is 80%',
    docType: 'idea',
    updatedAt: '2026-07-25T20:00:00Z',
    tags: ['reading', 'PM', 'problem definition'],
    relatedDocumentIds: ['p-roadmap-rice', 'c-skill-gap'],
    summary: `## Core claim
The book's central point is that good products are decided by "problem definition," not by "solutions." The remark that teams are skilled at building features but it's often unclear what problem those features actually solve really stung.

## Applying it at work
Looking again at the Q3 roadmap, for several of the 11 candidates I couldn't clearly answer "what problem does this feature solve?"`,
    keyConclusion: "I'll add a filter: any roadmap item whose problem I can't state in one sentence gets dropped from the candidates.",
    learnings: `- However precisely I calculate roadmap priorities (RICE), a weak problem definition won't score well in the first place
- Discussion gets clearer when the team's language is "problems," not "features"`,
    actionItems: ["Add a required 'problem we're solving' field to the roadmap template", 'Re-review at the next roadmap review using this criterion'],
    followUpQuestions: ['Should projects already in progress be re-reviewed by this criterion too, or apply it from the next round?'],
    rawConversation: [
      { role: 'user', content: "I read a must-read PM book, and the core message was that good products are decided by problem definition, not solutions. It stung that teams are good at building features but it's often unclear what problem they solve." },
      { role: 'assistant', content: "What if you re-look at the 11 Q3 roadmap candidates by that standard?" },
      { role: 'user', content: "I just skimmed them, and for a few I couldn't clearly answer 'what problem does this feature solve?'" },
      { role: 'assistant', content: "Then I'd recommend adding \"problem we're solving\" as a required field on the roadmap template. Using it as a filter that drops any item you can't state in one sentence lets you weed out weak candidates before you even compute RICE scores." },
    ],
  },

  // ── AI & tech trends ────────────────────────────────────────────
  {
    id: 'ai-llm-agent-trends',
    categoryId: 'cat-techtrends',
    title: "What today's buzzword 'AI agents' can actually do",
    docType: 'research',
    updatedAt: '2025-11-12T14:00:00Z',
    tags: ['AI', 'agents', 'tech trends'],
    summary: `## Background
Everyone in the industry is talking about "agents" and I was confused about what exactly differs, so I sorted it out myself.

## Summary
- Traditional chatbot: one answer per question
- Agent: given a goal, it plans multiple steps on its own and works iteratively using tools (search, code execution, etc.)

## Relevance to our product
There seems to be room to automate repetitive setup work in customer onboarding (integrations, initial data cleanup) with agent-style features — but I judged it an early-stage technology whose reliability still needs validating.`,
    keyConclusion: "The key differentiator of agents is that they 'automatically carry out multiple steps on their own.' It's too early for our product, but onboarding automation is worth watching.",
    learnings: `- Rather than using a buzzword as-is, the habit of pinning down exactly what's different makes team discussion far clearer
- New tech is attractive, but "do we need it in our product now" is a separate question`,
    actionItems: ['Register onboarding automation as an idea for the next roadmap brainstorm', 'Re-check related technology progress every quarter'],
    followUpQuestions: ['How should we validate the reliability of agent features (the risk of wrong automation)?'],
    rawConversation: [
      { role: 'user', content: "Everyone in the industry is talking about 'AI agents' these days and I'm confused about what exactly differs from an ordinary chatbot." },
      { role: 'assistant', content: "A traditional chatbot gives one answer per question, whereas an agent, given a goal, plans multiple steps on its own and works iteratively with tools (search, code execution, etc.). Are you thinking about whether there's a place to apply it in our product?" },
      { role: 'user', content: "Yeah, I wondered whether we could automate the repetitive integration setup work in onboarding." },
      { role: 'assistant', content: "There's potential. But this technology isn't yet fully proven for reliability, so rather than adopting it right now, it's safer to register it as a roadmap candidate and re-check the technology's progress every quarter." },
    ],
  },
  {
    id: 'ai-coding-copilot-eval',
    categoryId: 'cat-techtrends',
    title: 'Comparing two kinds of AI coding assistants',
    docType: 'research',
    updatedAt: '2026-01-05T21:00:00Z',
    tags: ['AI', 'dev tools', 'productivity'],
    relatedDocumentIds: ['s-notification-bug'],
    summary: `## Background
I've been using AI coding assistants while building RoutineMate, and I alternated between two of them to sort out the differences.

## Comparison
- A: autocomplete-focused, strong at short suggestions, fast response
- B: understands whole-file/multi-file context and is strong at large-scale refactoring suggestions, but slower

## Conclusion
A for quick typing assistance, B for structural refactoring or designing new features — I'll split usage by purpose.`,
    keyConclusion: 'Rather than picking one, splitting tools by unit of work (short autocomplete vs. large structural changes) is more efficient.',
    learnings: `- With AI tools too, a situational judgment of "this one's better for this task" beats "this is the best one"
- Switching between tools made each one's strengths clear`,
    actionItems: ['Write down the workflow: A for short tasks, B for refactoring'],
    followUpQuestions: ['Could I split AI tools by similar criteria for team work too (drafting documents, etc.)?'],
    rawConversation: [
      { role: 'user', content: "I've been alternating between two AI coding assistants while building RoutineMate — is it better to standardize on one, or keep splitting use?" },
      { role: 'assistant', content: "How do the two tools' strengths differ, in your view?" },
      { role: 'user', content: "One has fast autocomplete and is strong at short suggestions, while the other understands whole-file context and does great large refactoring suggestions. It's slower, though." },
      { role: 'assistant', content: "Then splitting by unit of work seems more efficient than standardizing on one. The first for quick typing help, the second for structural refactoring or designing new features. If you write it down as a workflow, you won't have to agonize each time." },
    ],
  },
  {
    id: 'ai-prompt-engineering-notes',
    categoryId: 'cat-techtrends',
    title: 'The habit of keeping my work prompts organized',
    docType: 'general',
    updatedAt: '2026-02-28T13:00:00Z',
    tags: ['AI', 'prompts', 'productivity'],
    summary: `## The problem
Every time I make similar requests to AI (competitor analysis summaries, meeting notes), I spend time writing the prompt from scratch.

## The system
Organize frequently used prompts by type and reuse them with small tweaks each time. I confirmed that "specifying the output format clearly" matters most for result quality.`,
    keyConclusion: "Through repeated use I felt that good results come from 'clear format specification' more than 'clever questions.' Templatize frequently used prompts.",
    learnings: `- Even asking the same thing, the more concretely I specify the output format (table, bullets, length limit), the more usable the result
- A shift in thinking: prompts can be managed as "reusable assets," like code`,
    actionItems: ['Organize 5 frequently used prompts into a template doc', 'Share with the team and suggest each person build a prompt library'],
    followUpQuestions: ['If we build a prompt library shared by the whole team, who should manage it?'],
    rawConversation: [
      { role: 'user', content: "I make similar requests to AI every time, like competitor analysis summaries and meeting notes, and writing the prompt from scratch each time takes a while." },
      { role: 'assistant', content: "Organizing your frequent request types into templates will speed things up a lot. When results aren't great, what's usually lacking?" },
      { role: 'user', content: "The format comes out different every time, so sometimes cleaning it up takes even more time." },
      { role: 'assistant', content: "Specifying the output format (table, bullets, length limit, etc.) concretely makes a clear difference in quality. Organize about 5 frequently used prompts into templates and reuse them, changing only the content each time, and you'll save a lot of time." },
    ],
  },
  {
    id: 'ai-rag-vs-finetuning',
    categoryId: 'cat-techtrends',
    title: 'RAG vs fine-tuning, just as much as a PM needs to know',
    docType: 'research',
    updatedAt: '2026-04-22T15:00:00Z',
    tags: ['AI', 'RAG', 'fine-tuning'],
    summary: `## Background
The engineering team was debating "RAG or fine-tuning for this," and I couldn't follow because I didn't know exactly what the difference was. A PM doesn't need implementation details but has to understand the trade-offs to join the discussion.

## Summary
- **RAG**: leave the model as is, and at answer time retrieve relevant documents and attach them as reference material — easy to reflect fresh information, lower cost
- **Fine-tuning**: retrain the model itself on our data — can be tuned deeply to a particular style/domain, but costly and hard to keep up to date`,
    keyConclusion: 'I now understand enough to join the discussion: for a service like ours where user data keeps changing, RAG is structurally a better fit.',
    learnings: `- Even without knowing implementation details, understanding the structure of the trade-off lets me contribute meaningfully to engineering discussions
- "I don't get it so I'll just hand it off" versus "I understand the core trade-offs and take part in the judgment" is a big difference in the PM role`,
    actionItems: ['Ask a few questions based on this concept at the engineering team weekly'],
    followUpQuestions: ['If we applied RAG to our product, what data should be the search target?'],
    rawConversation: [
      { role: 'user', content: "In the engineering meeting they debated 'RAG or fine-tuning for this,' and I couldn't follow because I don't know exactly what the difference is." },
      { role: 'assistant', content: "RAG leaves the model as is and, at answer time, retrieves relevant documents and attaches them as reference material. It makes it easy to reflect fresh information and is cheap. Fine-tuning retrains the model itself on your data, so it can be tuned deeply to a style but is costly and hard to keep current." },
      { role: 'user', content: "Which fits a service like ours, where user data keeps changing?" },
      { role: 'assistant', content: "When data keeps changing, RAG is structurally a better fit. Fine-tuning needs retraining before new data is reflected, but with RAG you only need to keep the searchable documents current. The implementation details are the engineering team's job, but understanding just this much of the trade-off is enough to take part in the discussion." },
    ],
  },
  {
    id: 'ai-product-ai-features-benchmark',
    categoryId: 'cat-techtrends',
    title: 'Benchmarking competing products\' AI features',
    docType: 'research',
    updatedAt: '2026-06-30T16:00:00Z',
    tags: ['AI', 'competitor analysis', 'benchmarking'],
    relatedDocumentIds: ['p-competitor-pricing'],
    summary: `## Purpose
Competitors have been rushing to add AI features lately, so I tried them out to judge what's genuinely useful and what's marketing.

## Findings
- Many added "AI summaries," but in practice they just summarize the existing report — I'd guess usage is low
- One stood out for an "AI alert" feature that flags anomalies in advance — it felt like real value because the user doesn't have to go looking

## Takeaway
The measure of real value isn't the fact that "AI was added" but whether it reduces users' existing behavior (having to come in and check every time).`,
    keyConclusion: 'The conclusion: the key criterion is not whether to adopt AI features, but how much they reduce what users repeatedly had to do.',
    learnings: `- This benchmarking sharpened my eye for telling trend-following features from ones that deliver real value
- Trying things myself, rather than judging from marketing copy alone, definitely gives different insights`,
    actionItems: ["Propose 'AI alert'-type features as next quarter's roadmap candidates", 'Set up a quarterly routine to re-check competitors\' AI features'],
    followUpQuestions: ['If we add AI features too, which repetitive behaviors could they reduce?'],
    rawConversation: [
      { role: 'user', content: "Competitors are all adding AI features these days, so I tried them out to benchmark what's genuinely useful and what's marketing." },
      { role: 'assistant', content: "What did you find?" },
      { role: 'user', content: "Many added 'AI summaries' but really it just summarizes the existing report. But one had an 'AI alert' feature that warns you about anomalies in advance, and that looked genuinely useful." },
      { role: 'assistant', content: "That difference is the key. With AI summaries the user still has to go in and check, but AI alerts spare the user from looking things up. It seems the measure of real value isn't that AI was added but how much it reduces users' repetitive behavior. It'd be good to propose \"AI alert\"-type ideas as next quarter's roadmap candidates." },
    ],
  },
  {
    id: 'ai-newsletter-curation-system',
    categoryId: 'cat-techtrends',
    title: 'Building a tech newsletter curation system',
    docType: 'idea',
    updatedAt: '2026-09-08T20:00:00Z',
    tags: ['newsletters', 'information management', 'productivity'],
    summary: `## The problem
I'm subscribed to 12 newsletters and can't read them all, so they just pile up. I feel like I miss the important stuff.

## The new system
1. Split newsletters into two groups: "daily skim (titles only)" and "weekend deep read (full text)"
2. Anything that looks important while skimming gets saved immediately to verilix with a link + one-line note — cutting the time spent later on "where did I see that again"`,
    keyConclusion: 'Dropping the attempt to read everything and switching to a three-stage scan–save–deep-read structure feels much less burdensome.',
    learnings: `- The compulsion to "read everything" was actually what made me read nothing
- Having a habit of jotting notes immediately sharply reduces the cost of finding things again later`,
    actionItems: ['Re-sort the 12 newsletters into daily / weekend groups', 'Build the habit of saving important content to verilix right away'],
    followUpQuestions: ['Would it be good to share the curated content with the team regularly too?'],
    rawConversation: [
      { role: 'user', content: "I'm subscribed to 12 newsletters and can't read them all; they just keep piling up. I feel like I'm missing the important ones." },
      { role: 'assistant', content: "How do you try to read them right now?" },
      { role: 'user', content: "I try to read everything whenever I get a moment, but I can't keep it up." },
      { role: 'assistant', content: "The compulsion to \"read everything\" may be what makes you read nothing. Split them into two groups: skim titles only every day, and deep-read full text only on weekends. Save anything that looks important while skimming right away with a link and a one-line note, and the cost of finding it again later goes down too." },
    ],
  },
]
