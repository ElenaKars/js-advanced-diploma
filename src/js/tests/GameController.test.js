import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import { getCoordinates } from '../utils';

const gameCtrl = new GameController(new GamePlay(), new GameStateService());
const boardSize = 8;

test.each([
  [19, 1, 3],
  [43, 59, 2],
  [13, 14, 3],
  [61, 37, 4],
])('availableTo method, move from cell with index %i to cell with index %i with distance %i', (startCell, endCell, dist) => {
  const result = gameCtrl.availableTo(endCell, getCoordinates(startCell, boardSize), dist);
  expect(result).toBeTruthy();
});
