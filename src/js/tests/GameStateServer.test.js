import GameStateService from '../GameStateService';

let stateService;
jest.mock('../GameStateService');

beforeEach(() => {
  stateService = new GameStateService();
  jest.resetAllMocks();
});

describe('load method', () => {
  test('successful upload', () => {
    const expected = { level: 1, charactersCount: 2 };
    stateService.load.mockReturnValue(expected);
    expect(stateService.load()).toEqual(expected);
  });

  test('unsuccessful upload', () => {
    stateService.load = jest.fn(() => {
      throw new Error('Invalid state');
    });
    expect(() => stateService.load()).toThrow(new Error('Invalid state'));
  });
});
