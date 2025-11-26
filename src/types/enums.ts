export enum GameState {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export enum EntityType {
  PLAYER = 'PLAYER',
  BOT = 'BOT',
  PROJECTILE = 'PROJECTILE'
}

export enum WeaponType {
  PISTOL = 'PISTOL',
  RIFLE = 'RIFLE',
  SHOTGUN = 'SHOTGUN'
}

export enum AIState {
  PATROL = 'PATROL',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
  RETREAT = 'RETREAT'
}

export enum CollisionGroup {
  PLAYER = 1 << 0,    // 1
  BOT = 1 << 1,       // 2
  WORLD = 1 << 2,     // 4
  BULLET = 1 << 3     // 8
}
