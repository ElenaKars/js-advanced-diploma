import Team from './Team';

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const CharacterClass = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const level = Math.floor(Math.random() * maxLevel) + 1;
    yield new CharacterClass(level);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = new Team();

  const generator = characterGenerator(allowedTypes, maxLevel);
  for (let i = 0; i < characterCount; i++) {
    const character = generator.next().value;
    team.characters.push(character);
  }

  return team;
}
