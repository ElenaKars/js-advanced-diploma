import Character from '../Character';

export default class Bowman extends Character {
    constructor(level) {
        super(level, 'bowman');
        this.attack = 25;
        this.defense = 25;
        this.health = 50;
    }
}