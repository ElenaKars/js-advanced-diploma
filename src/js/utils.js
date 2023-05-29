export function calcTileType(index, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;

  if (row === 0 && col === 0) {
    return 'top-left';
  }
  if (row === 0 && col === boardSize - 1) {
    return 'top-right';
  }
  if (row === 0) {
    return 'top';
  }
  if (row === boardSize - 1 && col === 0) {
    return 'bottom-left';
  }
  if (row === boardSize - 1 && col === boardSize - 1) {
    return 'bottom-right';
  }
  if (row === boardSize - 1) {
    return 'bottom';
  }
  if (col === boardSize - 1) {
    return 'right';
  }
  if (col === 0) {
    return 'left';
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
