import * as THREE from 'three'
import { Bot } from './Bot'
import { BotAI } from './BotAI'
import { BotNavigator } from './BotNavigator'
import { Scene } from '@core/Scene'
import { PhysicsWorld } from '@physics/PhysicsWorld'
import { Map } from '@world/Map'
import { Player } from '@entities/player/Player'
import { EventEmitter } from '@utils/EventEmitter'

interface BotInstance {
  bot: Bot
  ai: BotAI
  navigator: BotNavigator
}

export class BotSpawner {
  private scene: Scene
  private physicsWorld: PhysicsWorld
  private map: Map
  private player: Player
  private maxBots: number = 5
  private bots: BotInstance[] = []
  private respawnDelay: number = 5000
  private nextBotId: number = 0
  public events: EventEmitter = new EventEmitter()

  constructor(
    scene: Scene,
    physicsWorld: PhysicsWorld,
    map: Map,
    player: Player
  ) {
    this.scene = scene
    this.physicsWorld = physicsWorld
    this.map = map
    this.player = player
  }

  init(): void {
    for (let i = 0; i < this.maxBots; i++) {
      this.spawnBot()
    }
    console.log(`Spawned ${this.maxBots} bots`)
  }

  private spawnBot(): void {
    const spawnPoint = this.map.getAvailableSpawnPoint(this.player.position, 15)
    if (!spawnPoint) {
      console.warn('No available spawn point for bot')
      return
    }

    const botId = `bot-${this.nextBotId++}`
    const bot = new Bot(botId, this.scene, this.physicsWorld, spawnPoint.position.clone())

    const navigator = new BotNavigator(bot, this.map)
    const ai = new BotAI(bot, navigator, this.player, this.physicsWorld)

    const botInstance: BotInstance = { bot, ai, navigator }
    this.bots.push(botInstance)

    bot.health.events.on('death', () => {
      this.handleBotDeath(botInstance)
    })

    bot.weapon.events.on('fire', (data) => {
      this.handleBotWeaponFire(bot, data)
    })

    spawnPoint.markOccupied()
    setTimeout(() => spawnPoint.markFree(), 2000)
  }

  private handleBotDeath(botInstance: BotInstance): void {
    console.log(`Bot ${botInstance.bot.id} killed`)

    this.events.emit('botKilled', { botId: botInstance.bot.id })

    setTimeout(() => {
      this.removeBot(botInstance)
      this.spawnBot()
    }, this.respawnDelay)
  }

  private removeBot(botInstance: BotInstance): void {
    const index = this.bots.indexOf(botInstance)
    if (index !== -1) {
      botInstance.bot.destroy()
      this.bots.splice(index, 1)
    }
  }

  private handleBotWeaponFire(bot: Bot, data: any): void {
    const raycastResult = this.physicsWorld.raycast(
      data.origin,
      data.direction,
      data.range,
      true
    )

    if (raycastResult.hit) {
      const playerBody = this.physicsWorld.getRigidBody('player-1')
      if (playerBody && raycastResult.collider === this.physicsWorld.getCollider('player-1')) {
        this.player.takeDamage(data.damage, bot.id)
        console.log(`Bot hit player for ${data.damage} damage`)
      }
    }
  }

  update(deltaTime: number): void {
    for (const botInstance of this.bots) {
      if (!botInstance.bot.health.isDead) {
        botInstance.bot.update(deltaTime)
        botInstance.ai.update(deltaTime)
      }
    }
  }

  getBots(): Bot[] {
    return this.bots.map(instance => instance.bot)
  }

  getAliveBotCount(): number {
    return this.bots.filter(instance => !instance.bot.health.isDead).length
  }

  dispose(): void {
    for (const botInstance of this.bots) {
      botInstance.bot.destroy()
    }
    this.bots = []
  }
}
