export type Lang = 'ko' | 'en'

export interface GuidedAnswer {
  chips: string[]
  freeText: string
}

export type GuidedAnswers = Record<string, GuidedAnswer>

interface GuidedQuestion {
  id: string
  question: Record<Lang, string>
  chips: Record<Lang, string[]>
  freeTextPlaceholder: Record<Lang, string>
  template: Record<Lang, string>
}

export const GUIDED_QUESTIONS: GuidedQuestion[] = [
  {
    id: 'purpose',
    question: {
      ko: 'verilix로 주로 뭘 하고 싶으세요?',
      en: 'What do you mainly want to use verilix for?',
    },
    chips: {
      ko: ['업무 생산성', '공부·학습', '글쓰기·창작', '코딩·개발', '커리어·취업 준비', '일상 고민 상담', '그냥 궁금해서 써보고 싶어요'],
      en: ['Work productivity', 'Studying / learning', 'Writing & creativity', 'Coding & development', 'Career prep', 'Everyday advice', 'Just curious, exploring'],
    },
    freeTextPlaceholder: {
      ko: '더 구체적으로 있다면 적어주세요 (선택)',
      en: "Add more detail if you'd like (optional)",
    },
    template: {
      ko: '유저가 verilix를 통해 하고 싶은 것은 {answer}',
      en: 'What the user wants to do with verilix is {answer}',
    },
  },
  {
    id: 'role',
    question: {
      ko: '지금 어떤 일을 하고 계세요?',
      en: "What's your current role or occupation?",
    },
    chips: {
      ko: ['학생', '직장인', '프리랜서', '자영업·창업', '취업 준비생', '전업주부', '은퇴', '무직·쉬는 중'],
      en: ['Student', 'Employee', 'Freelancer', 'Business owner', 'Job seeker', 'Homemaker', 'Retired', 'Between things'],
    },
    freeTextPlaceholder: {
      ko: '직무나 분야를 더 적어주세요 (선택)',
      en: 'Add your specific field or title (optional)',
    },
    template: {
      ko: '유저의 직업/역할은 {answer}',
      en: "The user's role/occupation is {answer}",
    },
  },
  {
    id: 'interest',
    question: {
      ko: '평소 관심 있는 분야나 자주 생각하는 주제가 있나요?',
      en: "Any topics or fields you're especially interested in?",
    },
    chips: {
      ko: ['IT·기술', '경제·재테크', '건강·운동', '자기계발', '예술·문화', '여행', '육아·가족', '시사·사회'],
      en: ['Tech', 'Finance & money', 'Health & fitness', 'Self-improvement', 'Arts & culture', 'Travel', 'Parenting & family', 'Current events'],
    },
    freeTextPlaceholder: {
      ko: '다른 관심사가 있다면 적어주세요 (선택)',
      en: "Add anything else you're into (optional)",
    },
    template: {
      ko: '유저가 관심 있어 하는 분야는 {answer}',
      en: 'The topics the user is interested in are {answer}',
    },
  },
  {
    id: 'style',
    question: {
      ko: '답변은 어떤 스타일이 좋으세요?',
      en: 'What kind of response style do you prefer?',
    },
    chips: {
      ko: ['간결하고 핵심만', '자세하고 친절하게', '예시를 많이 들어서', '전문적이고 격식있게', '편하게 반말/캐주얼하게'],
      en: ['Short and to the point', 'Detailed and thorough', 'Lots of examples', 'Formal and professional', 'Casual and relaxed'],
    },
    freeTextPlaceholder: {
      ko: '다른 선호가 있다면 적어주세요 (선택)',
      en: 'Add any other preference (optional)',
    },
    template: {
      ko: '유저가 선호하는 답변 스타일은 {answer}',
      en: "The user's preferred response style is {answer}",
    },
  },
  {
    id: 'level',
    question: {
      ko: '설명은 어느 정도 수준으로 해드리면 좋을까요?',
      en: 'How much background knowledge should explanations assume?',
    },
    chips: {
      ko: ['완전 초보라 쉽게 설명해주세요', '기본은 알아서 적당히 설명해주세요', '이미 잘 알아서 핵심만 짚어주세요'],
      en: ["I'm a complete beginner, keep it simple", 'I know the basics, moderate detail is fine', "I'm already knowledgeable, just the key points"],
    },
    freeTextPlaceholder: {
      ko: '분야별로 다르다면 적어주세요 (선택)',
      en: 'Add detail if it varies by topic (optional)',
    },
    template: {
      ko: '유저가 원하는 설명 난이도는 {answer}',
      en: 'The level of explanation the user wants is {answer}',
    },
  },
  {
    id: 'avoid',
    question: {
      ko: 'AI를 쓸 때 이런 건 피했으면 좋겠다 싶은 게 있나요?',
      en: "Is there anything you'd like the AI to avoid?",
    },
    chips: {
      ko: ['근거 없이 무조건 동조하는 것', '너무 어려운 전문 용어', '너무 장황한 설명', '제 정보를 이상하게 활용하는 것', '딱히 없어요'],
      en: ['Agreeing with me without good reason', 'Too much jargon', 'Overly long explanations', 'Misusing my personal info', 'Nothing in particular'],
    },
    freeTextPlaceholder: {
      ko: '다른 게 있다면 적어주세요 (선택)',
      en: 'Add anything else (optional)',
    },
    template: {
      ko: '유저가 피했으면 하는 것은 {answer}',
      en: 'What the user wants the AI to avoid is {answer}',
    },
  },
]

function buildAnswerText(answer: GuidedAnswer | undefined): string {
  if (!answer) return ''
  const chipsText = answer.chips.join(', ')
  const freeText = answer.freeText.trim()
  if (chipsText && freeText) return `${chipsText} (${freeText})`
  return chipsText || freeText
}

export function composeGuidedContext(answers: GuidedAnswers, lang: Lang): string {
  const fragments = GUIDED_QUESTIONS
    .map((q) => ({ template: q.template[lang], text: buildAnswerText(answers[q.id]) }))
    .filter((f) => f.text)

  if (fragments.length === 0) return ''

  return fragments
    .map(({ template, text }, index) => {
      const filled = template.replace('{answer}', text)
      const isLast = index === fragments.length - 1
      if (lang === 'ko') return filled + (isLast ? '이다.' : '이고, ')
      return filled + (isLast ? '.' : ', and ')
    })
    .join('')
}
