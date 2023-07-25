export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    if (new.target.name === 'Character') {
      throw new Error('Нельзя создавать объекты через new Character()');
    }
  }

  levelUp() {
    this.level += 1;

    const life = (1.8 - (1 - this.health / 100));
    this.attack = Math.floor(Math.max(this.attack, this.attack * life));
    this.defence = Math.floor(Math.max(this.defence, this.defence * life));

    this.health += 80;
    if (this.health > 100) {
      this.health = 100;
    }
  }
}
