import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';

const allowedTypes = [Bowman, Swordsman, Magician];

describe('characterGenerator function', () => {
  test('the generator should produce characters indefinitely', () => {
    expect(characterGenerator(allowedTypes, 1).next().done).toBeFalsy();
  });

  test('the generator should produce characters given the allowed types', () => {
    const char = characterGenerator(allowedTypes, 1).next().value;
    const result = allowedTypes.map((Item) => new Item(1).type).some((item) => item === char.type);
    expect(result).toBeTruthy();
  });
});

describe('generateTeam function', () => {
  test.each([
    [2, 4, 2],
    [3, 2, 3],
    [4, 3, 4],
  ])('should create %i characters', (count, level, expected) => {
    const team = generateTeam(allowedTypes, level, count);
    expect(team.characters.length).toBe(expected);
  });

  test.each([
    [4, 2],
    [2, 3],
    [3, 4],
  ])('should create characters with levels up to %i', (level, count) => {
    const team = generateTeam(allowedTypes, level, count);
    const result = team.characters.every((item) => item.level <= level);
    expect(result).toBeTruthy();
  });
});
