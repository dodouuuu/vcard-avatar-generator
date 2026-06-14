import { Gender } from '../types'
import { CHAR_FREQ, FEMALE_TOTAL, MALE_TOTAL, TITLE_PATTERNS } from './chinese-gender-data'

const pMale = MALE_TOTAL / (MALE_TOTAL + FEMALE_TOTAL)
const pFemale = FEMALE_TOTAL / (MALE_TOTAL + FEMALE_TOTAL)

/**
 * Predicts gender from a Chinese given name using Naive Bayes.
 * Checks family titles first for direct gender determination.
 * Defaults to male when the name cannot be confidently determined.
 *
 * The model is trained on ~2,000,000 Chinese name records (~9442 characters).
 *
 * @param givenName - The given name to analyze.
 * @returns Gender.M for male, Gender.F for female, or Gender.M as fallback.
 */
export function guessGender(givenName: string): Gender {
  if (!givenName) {
    return Gender.M
  }

  // Keep only Chinese characters for analysis
  givenName = givenName
    .trim()
    .split('')
    .filter((char) => char >= '\u4e00' && char <= '\u9fa0')
    .join('')

  if (!givenName) {
    return Gender.M
  }

  // Check if the given name ends with a gender-indicating title suffix
  for (const [pattern, gender] of TITLE_PATTERNS) {
    if (pattern.test(givenName)) {
      return gender
    }
  }

  const pf = possible(givenName, 0)
  const pm = possible(givenName, 1)

  if (pm > pf) {
    return Gender.M
  } else if (pf > pm) {
    return Gender.F
  }
  return Gender.M
}

/**
 * Computes P(name|gender) * P(gender).
 *
 * @param firstname - The given name to evaluate.
 * @param gender - 0 for female, 1 for male.
 * @returns The probability score for the given gender.
 */
function possible(firstname: string, gender: number): number {
  const total = gender === 0 ? FEMALE_TOTAL : MALE_TOTAL
  let p = gender === 0 ? pFemale : pMale
  for (const char of firstname) {
    const [femaleFreq, maleFreq] = CHAR_FREQ[char] || [0, 0]
    p *= (gender === 0 ? femaleFreq : maleFreq) / total
  }
  return p
}
