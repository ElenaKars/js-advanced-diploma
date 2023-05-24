import Character from '../Character';

export default class Vampire extends Character {
    constructor(level) {
        super(level, 'vampire');
        this.attack = 40;
        this.defense = 10;
        this.health = 50;
    }
}