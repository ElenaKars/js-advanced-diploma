/* eslint-disable max-len */
export function calcTileType(index, boardSize) {
  if (index === 0) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index > 0 && index < (boardSize - 1)) {
    return 'top';
  }
  if (index === boardSize * (boardSize - 1)) {
    return 'bottom-left';
  }
  if (index === boardSize * boardSize - 1) {
    return 'bottom-right';
  }
  if (index > (boardSize * (boardSize - 1)) && index < (boardSize * boardSize - 1)) {
    return 'bottom';
  }
  if (index % boardSize === 0) {
    return 'left';
  }
  if ((index + 1) % boardSize === 0) {
    return 'right';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }
  if (health < 50) {
    return 'normal';
  }
  return 'high';
}

export function getInfo(character) {
  const levelInfo = String.fromCodePoint(0x1F396) + character.level;
  const attackInfo = String.fromCodePoint(0x2694) + character.attack;
  const defenceInfo = String.fromCodePoint(0x1F6E1) + character.defence;
  const healthInfo = String.fromCodePoint(0x2764) + character.health;
  return `${levelInfo} ${attackInfo} ${defenceInfo} ${healthInfo}`;
}

export function getCoordinates(index, square) {
  const coordinates = { x: null, y: null };
  if (index === 0) {
    coordinates.x = 1;
    coordinates.y = 1;
  }
  if (index > 0 && index < square) {
    coordinates.x = 1;
    coordinates.y = index + 1;
  }
  if (index >= square) {
    if (index % square === 0) {
      coordinates.x = Math.ceil((index + 1) / square);
      coordinates.y = 1;
    } else {
      coordinates.x = Math.ceil(index / square);
      coordinates.y = (index % square) + 1;
    }
  }
  return coordinates;
}

function getIndex(coordinates, square) {
  return (coordinates.x - 1) * square - 1 + coordinates.y;
}

export function randomIndex(selectedCoordinates, distance, square) {
  const coordinates = { x: null, y: null };
  let differenceX;
  let differenceY;

  do {
    coordinates.x = Math.floor(Math.random() * (distance * 2 + 1)) + (selectedCoordinates.x - distance);
    coordinates.y = Math.floor(Math.random() * (distance * 2 + 1)) + (selectedCoordinates.y - distance);
    differenceX = Math.abs(coordinates.x - selectedCoordinates.x);
    differenceY = Math.abs(coordinates.y - selectedCoordinates.y);
  } while ((coordinates.x === selectedCoordinates.x && coordinates.y === selectedCoordinates.y)
  || (coordinates.x > square || coordinates.y > square)
  || (coordinates.x <= 0 || coordinates.y <= 0)
  || (differenceX > distance || differenceY > distance)
  || (differenceX !== differenceY && differenceX !== 0 && differenceY !== 0));

  return getIndex(coordinates, square);
}
