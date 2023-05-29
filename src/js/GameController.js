import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    const currentLevel = 1;

    const theme = themes[currentLevel];
    this.gamePlay.drawUi(theme);
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.loadGame();
  }

  // onCellClick(index) {
  //   // TODO: react to click
  // }

  // onCellEnter(index) {
  //   // TODO: react to mouse enter
  // }

  // onCellLeave(index) {
  //   // TODO: react to mouse leave
  // }

  bindCharactersToCells() {
    const positions = [];
    const playerTeam = generateTeam(['allowedType1', 'allowedType2'], 3, 2);
    const enemyTeam = generateTeam(['allowedType3', 'allowedType4'], 3, 2);

    for (let i = 0; i < playerTeam.length; i += 1) {
      const character = playerTeam[i];
      let position = i;

      const cellOccupied = positions.includes(position);
      if (cellOccupied) {
        position = this.findFreePosition(positions);
      }

      const positionedCharacter = new PositionedCharacter(character, position);
      positions.push(positionedCharacter);
      position += 1;
    }

    for (let i = 0; i < enemyTeam.length; i += 1) {
      const character = enemyTeam[i];
      let position = 63 - i;

      const cellOccupied = positions.includes(position);
      if (cellOccupied) {
        position = this.findFreePosition(positions);
      }
      const positionedCharacter = new PositionedCharacter(character, position);
      positions.push(positionedCharacter);
      position += 1;
    }
    return positions;
  }

  static findFreePosition(positions) {
    let position = 0;
    while (positions.includes(position)) {
      position += 1;
    }
    return position;
  }

  loadGame() {
    const positions = this.bindCharactersToCells();
    this.gamePlay.redrawPositions(positions);
  }
}
