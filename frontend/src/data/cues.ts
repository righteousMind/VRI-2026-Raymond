export type CueType = 'generic' | 'transparent' | 'humorous';

export const GENERIC_CUES = [
  'Let me take a look.',
  'Just a moment while I think.',
  "I'm working on that.",
  'Let me check.',
  'One moment.',
];

export interface QuestionCues {
  questionIndex: number;
  transparent: string;
  humorous: string;
}

export const QUESTION_CUES: QuestionCues[] = [
  {
    questionIndex: 0,
    transparent: "I'm reviewing your schedule and looking for available walking opportunities.",
    humorous:
      "Good thing I enjoy solving scheduling puzzles. I'm reviewing your schedule and looking for the best opportunity to fit in your walk today.",
  },
  {
    questionIndex: 1,
    transparent: "I'm checking your recent activity level and daily goal.",
    humorous:
      "One advantage of being an AI is that I never lose count of steps. I'm reviewing your recent activity level and daily goal to find a realistic target.",
  },
  {
    questionIndex: 2,
    transparent: "I'm identifying places in your routine where additional walking could fit.",
    humorous:
      "Finding extra walking opportunities is one of my favourite digital hobbies. I'm looking through your routine to identify places where you can naturally add more steps.",
  },
  {
    questionIndex: 3,
    transparent: "I'm comparing the available time before and after dinner.",
    humorous:
      "I may not eat dinner myself, but I can still help plan around it. I'm comparing your available time before and after dinner to find the better option.",
  },
  {
    questionIndex: 4,
    transparent: "I'm considering your reported energy patterns and daily commitments.",
    humorous:
      "Fortunately, I don't experience the afternoon slump. I'm considering your energy levels and schedule to identify the most suitable time to be active.",
  },
  {
    questionIndex: 5,
    transparent: "I'm reviewing your routine and activity goals to identify a realistic plan.",
    humorous:
      "Creating realistic plans is easier than resisting software updates. I'm reviewing your routine and goals to identify an achievable activity plan.",
  },
  {
    questionIndex: 6,
    transparent: "I'm looking across your schedule for suitable opportunities to be active.",
    humorous:
      "I spend a lot of time analysing schedules. It's kind of my thing. I'm looking through your day to find the strongest opportunity for physical activity.",
  },
  {
    questionIndex: 7,
    transparent: "I'm reviewing your schedule and step goal to identify achievable changes.",
    humorous:
      "Good thing I like optimisation problems more than most humans do. I'm reviewing your schedule and step goal to find the easiest way to reach your target.",
  },
  {
    questionIndex: 8,
    transparent:
      "I'm combining your schedule, activity goals, and preferences to generate a recommendation.",
    humorous:
      "I enjoy putting pieces together. I'm combining your schedule, goals, and preferences to find the recommendation that fits you best.",
  },
];

export function getCue(questionIndex: number, type: CueType): string {
  const entry = QUESTION_CUES[questionIndex];
  if (!entry) return '';
  if (type === 'generic') {
    return GENERIC_CUES[Math.floor(Math.random() * GENERIC_CUES.length)];
  }
  return entry[type];
}
