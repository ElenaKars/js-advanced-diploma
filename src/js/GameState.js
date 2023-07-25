export default class GameState {
  constructor() {
    this.level = 1;
    this.charactersCount = 2;
    this.positions = [];
    this.currentMove = 'player';
    this.selectedCell = null;
    this.selectedCellIndex = null;
    this.selectedCharacter = null;
    this.selectedCellCoordinates = null;
    this.isAvailableToMove = false;
    this.isAvailableToAttack = false;
    this.playerTypes = ['bowman', 'swordsman', 'magician'];
    this.enemyTypes = ['vampire', 'undead', 'daemon'];
    this.playerTeam = [];
    this.enemyTeam = [];
  }
}
