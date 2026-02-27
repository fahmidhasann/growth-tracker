import { describe, it, expect } from 'vitest';
import { getMoodEmoji, getSkillLabel, MOOD_EMOJIS, SKILL_LEVELS } from './constants';

describe('getMoodEmoji', () => {
  it('returns the correct emoji for each valid mood level', () => {
    expect(getMoodEmoji(1)).toBe('😫');
    expect(getMoodEmoji(2)).toBe('😕');
    expect(getMoodEmoji(3)).toBe('😐');
    expect(getMoodEmoji(4)).toBe('🙂');
    expect(getMoodEmoji(5)).toBe('🤩');
  });

  it('returns the fallback emoji for out-of-range values', () => {
    expect(getMoodEmoji(0)).toBe('😐');
    expect(getMoodEmoji(6)).toBe('😐');
    expect(getMoodEmoji(-1)).toBe('😐');
  });

  it('MOOD_EMOJIS has exactly 5 entries', () => {
    expect(MOOD_EMOJIS.length).toBe(5);
  });
});

describe('getSkillLabel', () => {
  it('returns the correct label for each skill level', () => {
    expect(getSkillLabel(1)).toBe('Beginner');
    expect(getSkillLabel(2)).toBe('Novice');
    expect(getSkillLabel(3)).toBe('Intermediate');
    expect(getSkillLabel(4)).toBe('Advanced');
    expect(getSkillLabel(5)).toBe('Expert');
  });

  it('returns the fallback label for unknown levels', () => {
    expect(getSkillLabel(0)).toBe('Beginner');
    expect(getSkillLabel(99)).toBe('Beginner');
  });

  it('SKILL_LEVELS has exactly 5 entries', () => {
    expect(SKILL_LEVELS.length).toBe(5);
  });
});
