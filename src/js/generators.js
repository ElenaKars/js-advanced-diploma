import Team from './Team';

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const idx = Math.floor(Math.random() * allowedTypes.length);
  const level = Math.floor(Math.random() * maxLevel + 1);
  const character = new allowedTypes[idx](1);
  for (let i = 1; i < level; i += 1) {
    character.levelUp();
  }
  yield character;
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const characters = [];
  for (let i = 1; i <= characterCount; i += 1) {
    characters.push(characterGenerator(allowedTypes, maxLevel).next().value);
  }
  return new Team(characters);
}

export function* genPosLeft(characterCount) {
  const left = [];
  const positions = new Set();
  for (let i = 0; i < 8 ** 2; i += 1) {
    if (i === 0 || i === 1 || i % 8 === 0 || i % 8 === 1) {
      left.push(i);
    }
  }
  while (positions.size < characterCount) {
    positions.add(left[Math.floor(Math.random() * left.length)]);
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const pos of positions) {
    yield pos;
  }
}
export function* genPosRight(characterCount) {
  const right = [];
  const positions = new Set();
  for (let i = 0; i < 8 ** 2; i += 1) {
    if (i === 8 - 2 || i === 8 - 1 || (i + 2) % 8 === 0 || (i + 1) % 8 === 0) {
      right.push(i);
    }
  }
  while (positions.size < characterCount) {
    positions.add(right[Math.floor(Math.random() * right.length)]);
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const pos of positions) {
    yield pos;
  }
}
