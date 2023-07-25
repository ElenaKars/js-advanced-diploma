import Character from '../Character';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test.each([
  ['Bowman', Bowman, 1],
  ['Daemon', Daemon, 1],
  ['Magician', Magician, 1],
  ['Swordsman', Swordsman, 1],
  ['Undead', Undead, 1],
  ['Vampire', Vampire, 1],
])('create an instance of %s', (_, ClassName, level) => {
  expect(new ClassName(level)).toBeInstanceOf(ClassName);
});

test('preventing the creation of Character objects', () => {
  expect(() => new Character(1, 'bowman')).toThrow(new Error('Нельзя создавать объекты через new Character()'));
});

describe('levelUp method', () => {
  let char;

  beforeEach(() => {
    char = new Bowman(1);
  });

  test('should raise level by 1', () => {
    char.levelUp();
    expect(char.level).toBe(2);
  });

  test.each([
    ['health is increased by 80', 15, 95],
    ['health cannot be more than 100', 30, 100],
  ])('%s', (_, health, expected) => {
    char.health = health;
    char.levelUp();
    expect(char.health).toBe(expected);
  });

  test('calculates the attack', () => {
    char.health = 30;
    char.levelUp();
    expect(char.attack).toBe(27);
  });

  test('calculates the defence', () => {
    char.health = 10;
    char.levelUp();
    expect(char.defence).toBe(25);
  });
});
