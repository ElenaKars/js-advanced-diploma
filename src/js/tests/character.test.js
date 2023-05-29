import Character from '../Character';
import Bowman from '../characters/Bowman';

// Тесты для класса Character
describe('Character', () => {
  it('should throw an error when creating an instance of Character', () => {
    // Проверяем, что при создании экземпляра класса Character выбрасывается исключение
    expect(() => new Character(1)).toThrow('Cannot create an instance of abstract class Character');
  });
});

describe('Bowman', () => {
  it('should create a Bowman character with correct properties at level 1', () => {
    const bowman = new Bowman(1);

    expect(bowman.level).toBe(1);
    expect(bowman.attack).toBe(25);
    expect(bowman.defense).toBe(25);
    expect(bowman.health).toBe(50);
    expect(bowman.type).toBe('bowman');
  });
});
