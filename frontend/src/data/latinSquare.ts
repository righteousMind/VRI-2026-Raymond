export type CueType = 'generic' | 'transparent' | 'humorous';

export interface TrialConfig {
  delay: number;
  cueType: CueType;
}

// 9×9 latin square — row = latinIndex % 9, col = questionIndex
const LATIN_SQUARE: TrialConfig[][] = [
  // User 0
  [
    { delay: 1.5, cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
  ],
  // User 1
  [
    { delay: 4,   cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
  ],
  // User 2
  [
    { delay: 6,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
  ],
  // User 3
  [
    { delay: 1.5, cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
  ],
  // User 4
  [
    { delay: 4,   cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
  ],
  // User 5
  [
    { delay: 6,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
  ],
  // User 6
  [
    { delay: 1.5, cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
  ],
  // User 7
  [
    { delay: 4,   cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
    { delay: 6,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
  ],
  // User 8
  [
    { delay: 6,   cueType: 'humorous' },
    { delay: 1.5, cueType: 'generic' },
    { delay: 4,   cueType: 'transparent' },
    { delay: 1.5, cueType: 'humorous' },
    { delay: 4,   cueType: 'generic' },
    { delay: 6,   cueType: 'transparent' },
    { delay: 4,   cueType: 'humorous' },
    { delay: 6,   cueType: 'generic' },
    { delay: 1.5, cueType: 'transparent' },
  ],
];

export function getTrialConfig(latinIndex: number, questionIndex: number): TrialConfig {
  return LATIN_SQUARE[latinIndex % 9][questionIndex];
}
