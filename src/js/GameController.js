/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-syntax */
import themes from './themes';
import cursors from './cursors';
import {
  getInfo, getCoordinates, randomIndex,
} from './utils';
import GameState from './GameState';
import GamePlay from './GamePlay';
import {
  generateTeam, genPosLeft, genPosRight, characterGenerator,
} from './generators';
import PositionedCharacter from './PositionedCharacter';
import Character from './Character';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import Team from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
    this.currentCellIdx = null;
  }

  init() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.start();
  }

  // НАЧАЛО ИГРЫ
  start() {
    this.createTeams();
    this.drawBoard();
  }

  onNewGameClick() {
    this.blockBoard();
    this.gameState = new GameState();
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.currentCellIdx = null;
    this.createTeams();
    this.drawBoard();
  }

  onSaveGameClick() {
    this.stateService.save(this.gameState);
  }

  onLoadGameClick() {
    if (this.stateService.storage.length > 0/* сохраненная игра */) {
      const loadedGame = this.stateService.load();
      this.gameState = new GameState();
      this.gameState.level = loadedGame.level;
      this.gameState.charactersCount = loadedGame.charactersCount;
      this.gameState.positions = loadedGame.positions;
      this.gameState.currentMove = loadedGame.currentMove;
      this.gameState.selectedCell = loadedGame.selectedCell;
      this.gameState.selectedCellIndex = loadedGame.selectedCellIndex;
      this.gameState.selectedCharacter = loadedGame.selectedCharacter;
      this.gameState.selectedCellCoordinates = loadedGame.selectedCellCoordinates;
      this.gameState.isAvailableToMove = loadedGame.isAvailableToMove;
      this.gameState.isAvailableToAttack = loadedGame.isAvailableToAttack;
      const playerChars = [];
      const enemyChars = [];
      this.gameState.positions.forEach((pos) => {
        Object.setPrototypeOf(pos.character, Character.prototype);
        if (this.gameState.playerTypes.some((item) => item === pos.character.type)) {
          playerChars.push(pos.character);
        }
        if (this.gameState.enemyTypes.some((item) => item === pos.character.type)) {
          enemyChars.push(pos.character);
        }
      });
      this.gameState.playerTeam = new Team(playerChars);
      this.gameState.enemyTeam = new Team(enemyChars);
      this.drawBoard();
    }
  }

  // КЛИК ПО КЛЕТКЕ
  async onCellClick(index) {
    const currentCell = this.gamePlay.cells[index];
    const currentCellWithChar = currentCell.firstChild;
    let isEnemy;
    let isAvailableToMove;
    let isAvailableToAttack;

    if (currentCellWithChar) {
      isEnemy = this.gameState.enemyTeam.characters.some((item) => currentCellWithChar.classList.contains(item.type));
    }

    if (this.gameState.selectedCell) {
      isAvailableToMove = this.availableTo(index, this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.moveDist);
      isAvailableToAttack = this.availableTo(index, this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.attackDist);
    }

    // выбрать персонажа (есть персонаж в клетке && персонаж свой)
    if (currentCellWithChar && !isEnemy) {
      this.gamePlay.deselectCell(this.gameState.selectedCellIndex);
      this.gamePlay.selectCell(index);
      this.gameState.selectedCell = currentCell;
      this.gameState.selectedCellIndex = index;
      this.gameState.selectedCharacter = this.findCharacter(index);
      this.gameState.selectedCellCoordinates = getCoordinates(index, this.gamePlay.boardSize);
    }

    // переместить персонажа в пустую клетку (в клетке нет персонажа && клетка в зоне хода)
    if (!currentCellWithChar && isAvailableToMove) {
      this.gamePlay.deselectCell(this.gameState.selectedCellIndex);
      this.gamePlay.deselectCell(this.currentCellIdx);
      this.moveToAnEmptyCell(index);
      if (this.gameState.currentMove === 'player') {
        await this.enemyMove();
      }
    }

    // атака (есть персонаж в клетке && персонаж противника)
    if (currentCellWithChar && isEnemy) {
      if (isAvailableToAttack) {
        this.gamePlay.deselectCell(this.gameState.selectedCellIndex);
        this.gamePlay.deselectCell(this.currentCellIdx);
        const enemyCharacter = this.findCharacter(index);
        await this.attack(this.gameState.selectedCharacter, enemyCharacter, index);
        if (this.gameState.enemyTeam.characters.length === 0) {
          this.gameLevelUp();
          return;
        }
        if (this.gameState.currentMove === 'player') {
          await this.enemyMove();
        }
      } else {
        GamePlay.showError('Этот игрок противника недоступен для атаки!');
      }
    }
  }

  // НАВЕДЕНИЕ НА КЛЕТКУ
  onCellEnter(index) {
    if (typeof this.currentCellIdx === 'number' && !this.gamePlay.cells[this.currentCellIdx].classList.contains('selected-yellow')) {
      this.gamePlay.deselectCell(this.currentCellIdx);
    }
    const currentCell = this.gamePlay.cells[index];
    const currentCellWithChar = currentCell.firstChild;
    let isEnemy;
    let isAvailableToMove;
    let isAvailableToAttack;

    // показать инфу (есть персонаж в клетке)
    if (currentCellWithChar) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.showCellTooltip(getInfo(this.findCharacter(index)), index);
      isEnemy = this.gameState.enemyTypes.some((item) => currentCellWithChar.classList.contains(item));
    }

    if (this.gameState.selectedCell) {
      isAvailableToMove = this.availableTo(index, this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.moveDist);
      isAvailableToAttack = this.availableTo(index, this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.attackDist);
    }

    // если есть выделенная клетка
    if (this.gameState.selectedCell) {
      // если наведенная клетка в зоне хода
      if (isAvailableToMove) {
        // если наведенная клетка пустая
        if (!currentCellWithChar) {
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
        }
      // если наведенная клетка НЕ в зоне хода
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }

      // если в клетке персонаж противника
      if (currentCellWithChar && isEnemy) {
        // если в зоне атаки
        if (isAvailableToAttack) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }

    // если в наведенной клетке есть персонаж и он свой
    if (currentCellWithChar && !isEnemy) {
      this.gamePlay.setCursor(cursors.pointer);
    }

    this.currentCellIdx = index;
  }

  // ПОКИНУТЬ КЛЕТКУ
  onCellLeave(index) {
    this.gamePlay.setCursor(cursors.auto);
    this.gamePlay.hideCellTooltip(index);
  }

  // ПЕРЕХОД НА СЛЕД. УРОВЕНЬ
  gameLevelUp() {
    if (this.gameState.currentMove === 'enemy') {
      // Проигрыш
      // eslint-disable-next-line
      alert('Вы проиграли.\nЧтобы начать новую игру нажмите "New game".');
      this.blockBoard();
      return;
    }
    this.gameState.level += 1;
    if (this.gameState.level > 4) {
      // Победа
      this.blockBoard();
      // eslint-disable no-alert
      alert('Поздравляю! Вы победили!');
    } else {
      // Переход на следующий уровень
      /* eslint-disable no-alert */
      alert(`Уровень пройден! Переход на уровень ${this.gameState.level}`);
      this.gameState.playerTeam.characters.forEach((char) => char.levelUp());
      this.gameState.charactersCount += 1;
      this.gameState.positions = [];
      this.createTeams();
      this.drawBoard();
    }
  }

  // СОЗДАНИЕ КОМАНД
  createTeams() {
    if (this.gameState.level === 1) {
      this.gameState.playerTeam = generateTeam(this.playerTypes, this.gameState.level, this.gameState.charactersCount);
      this.gameState.enemyTeam = generateTeam(this.enemyTypes, this.gameState.level, this.gameState.charactersCount);
    } else {
      const countForPlayer = this.numberOfCharactersToAdd(this.gameState.playerTeam.characters);
      const countForEnemy = this.numberOfCharactersToAdd(this.gameState.enemyTeam.characters);
      const playerChars = [];
      const enemyChars = [];
      for (let i = 1; i <= countForPlayer; i += 1) {
        playerChars.push(characterGenerator(this.playerTypes, this.gameState.level).next().value);
      }
      for (let i = 1; i <= countForEnemy; i += 1) {
        enemyChars.push(characterGenerator(this.enemyTypes, this.gameState.level).next().value);
      }
      playerChars.forEach((item) => this.gameState.playerTeam.characters.push(item));
      enemyChars.forEach((item) => this.gameState.enemyTeam.characters.push(item));
    }
    const posLeft = genPosLeft(this.gameState.charactersCount);
    const posRight = genPosRight(this.gameState.charactersCount);
    this.gameState.playerTeam.characters.forEach((item) => {
      this.gameState.positions.push(new PositionedCharacter(item, posLeft.next().value));
    });
    this.gameState.enemyTeam.characters.forEach((item) => {
      this.gameState.positions.push(new PositionedCharacter(item, posRight.next().value));
    });
  }

  // ОПРЕДЕЛЕНИЕ СКОЛЬКО ПЕРСОНАЖЕЙ НУЖНО ДОБАВИТЬ НА СЛЕД. УРОВНЕ
  numberOfCharactersToAdd(team) {
    return this.gameState.charactersCount - team.length;
  }

  // ПЕРЕМЕЩЕНИЕ ПЕРСОНАЖА В ПУСТУЮ КЛЕТКУ
  moveToAnEmptyCell(index) {
    // находим индекс выделенного персонажа в массиве this.gameState.positions
    const idx = this.gameState.positions.findIndex((item) => item.position === this.gameState.selectedCellIndex);
    this.gameState.positions[idx].position = index;
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.clearSelectedCell();
  }

  // АТАКА
  async attack(attacker, target, targetIndex) {
    const damage = Math.floor(Math.max(attacker.attack - target.defence, attacker.attack * 0.2));
    // eslint-disable-next-line no-param-reassign
    target.health -= damage;
    await this.gamePlay.showDamage(targetIndex, damage);
    this.checkDeath(target);
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.clearSelectedCell();
  }

  // ПРОВЕРКА НА СМЕРТЬ
  checkDeath(character) {
    if (character.health <= 0) {
      let idx = this.gameState.positions.findIndex((item) => item.character.health <= 0);
      this.gameState.positions.splice(idx, 1);
      idx = this.gameState.enemyTeam.characters.findIndex((item) => item.health <= 0);
      this.gameState.enemyTeam.characters.splice(idx, 1);
    }
  }

  // НАЙТИ ПЕРСОНАЖ В ПОЗИЦИЯХ
  findCharacter(index) {
    const findIdx = this.gameState.positions.findIndex((item) => item.position === index);
    return this.gameState.positions[findIdx].character;
  }

  // ОЧИСТКА ВЫДЕЛЕННОЙ КЛЕТКИ
  clearSelectedCell() {
    this.gameState.selectedCell = null;
    this.gameState.selectedCellIndex = null;
    this.gameState.selectedCharacter = null;
    this.gameState.selectedCellCoordinates = null;
    this.gameState.isAvailableToMove = false;
    this.gameState.isAvailableToAttack = false;
  }

  // ОТРИСОВКА ПОЛЯ
  drawBoard() {
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
  }

  // БЛОКИРОВКА ПОЛЯ
  blockBoard() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.setCursor(cursors.auto);
  }

  // ХОД ПРОТИВНИКА
  async enemyMove() {
    this.gameState.currentMove = 'enemy';
    const { playerTeam } = this.gameState;
    const { enemyTeam } = this.gameState;
    let isAvailableToAttack;
    const arrOfEnemyPos = [];
    // меняем местами команды, теперь противник становится игроком и наоборот
    this.gameState.playerTeam = enemyTeam;
    this.gameState.enemyTeam = playerTeam;

    // перебираем индексы персонажей в позициях; если персонаж противника, то переводим его индекс в координаты и добавляем в массив
    this.gameState.positions.forEach((item) => {
      if (this.gameState.enemyTeam.characters.some((char) => char.type === item.character.type)) {
        arrOfEnemyPos.push(item.position);
      }
    });

    // перебираем персонажей в команде для определения возможности атаки
    for (const char of this.gameState.playerTeam.characters) {
      // если ход противника (компьютера)
      if (this.gameState.currentMove === 'enemy') {
        // то находим индекс персонажа в позициях
        const idx = this.gameState.positions.findIndex((pos) => pos.character === char);
        // выделяем его
        await this.onCellClick(this.gameState.positions[idx].position);
        // перебираем позиции противника
        for (const pos of arrOfEnemyPos) {
          // определяем возможна ли атака
          isAvailableToAttack = this.availableTo(pos, this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.attackDist);
          // если возможна, то атакуем и передаем ход
          if (isAvailableToAttack) {
            await this.onCellClick(pos);
            this.gameState.currentMove = 'player';
            this.gameState.playerTeam = playerTeam;
            this.gameState.enemyTeam = enemyTeam;
            break;
          }
        }
      }
    }
    // если атака невозможна, то перемещаем последнего из предыдущей итерации персонажа в пустую клетку
    if (this.gameState.currentMove === 'enemy') {
      await this.onCellClick(randomIndex(this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.moveDist, this.gamePlay.boardSize));
      this.gameState.currentMove = 'player';
      this.gameState.playerTeam = playerTeam;
      this.gameState.enemyTeam = enemyTeam;
    }
  }

  // ДОСТУПЕН ЛИ  ИНДЕКС ДЛЯ ХОДА/АТАКИ
  // eslint-disable-next-line consistent-return
  availableTo(index, selectedCoordinates, distance) {
    const currentCoordinates = getCoordinates(index, this.gamePlay.boardSize);
    const differenceX = Math.abs(currentCoordinates.x - selectedCoordinates.x);
    const differenceY = Math.abs(currentCoordinates.y - selectedCoordinates.y);
    if (differenceX <= distance && differenceY <= distance
    && (differenceX === differenceY || differenceX === 0 || differenceY === 0)) {
      return true;
    }
  }
}
