import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import { characterGenerator, generateTeam } from '../generators';

describe('Character', () => {
  test('should throw an exception when creating an instance of the Character class', () => {
    expect(() => new Character()).toThrow();
  });

  test('should not throw an exception when creating instances of the inherited classes', () => {
    expect(() => new Bowman(1)).not.toThrow();
    expect(() => new Swordsman(1)).not.toThrow();
  });
});

describe('characterGenerator', () => {
  const allowedTypes = [Bowman, Swordsman];
  const maxLevel = 3;
  const generator = characterGenerator(allowedTypes, maxLevel);

  test('should continuously generate new characters from the allowed types', () => {
    for (let i = 0; i < 10; i++) {
      const character = generator.next().value;
      expect(character instanceof Bowman || character instanceof Swordsman).toBe(true);
    }
  });
});

describe('generateTeam', () => {
  const allowedTypes = [Bowman, Swordsman];
  const maxLevel = 3;
  const characterCount = 5;
  const team = generateTeam(allowedTypes, maxLevel, characterCount);

  test('should generate a team with the specified character count and level range', () => {
    expect(team.characters.length).toBe(characterCount);

    for (const character of team.characters) {
      expect(character instanceof Bowman || character instanceof Swordsman).toBe(true);
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    }
  });
});
