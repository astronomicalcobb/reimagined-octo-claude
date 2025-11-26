import { CollisionGroup } from '@types/enums'

export class CollisionGroups {
  static PLAYER = CollisionGroup.PLAYER
  static BOT = CollisionGroup.BOT
  static WORLD = CollisionGroup.WORLD
  static BULLET = CollisionGroup.BULLET

  static getPlayerMask(): number {
    return CollisionGroup.WORLD | CollisionGroup.BOT
  }

  static getBotMask(): number {
    return CollisionGroup.WORLD | CollisionGroup.PLAYER | CollisionGroup.BOT
  }

  static getWorldMask(): number {
    return CollisionGroup.PLAYER | CollisionGroup.BOT
  }

  static getBulletMask(): number {
    return 0
  }
}
