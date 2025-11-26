import * as THREE from 'three'
import { Bot } from './Bot'
import { Map } from '@world/Map'

export class BotNavigator {
  private bot: Bot
  private map: Map
  private currentWaypoint: THREE.Vector3 | null = null
  private waypointReachedDistance: number = 2.0

  constructor(bot: Bot, map: Map) {
    this.bot = bot
    this.map = map
  }

  update(deltaTime: number): void {
    if (!this.currentWaypoint) {
      this.pickNewWaypoint()
    }

    if (this.currentWaypoint) {
      this.bot.moveTowards(this.currentWaypoint, deltaTime)

      const distance = this.bot.position.distanceTo(this.currentWaypoint)
      if (distance < this.waypointReachedDistance) {
        this.currentWaypoint = null
      }
    }
  }

  moveToTarget(target: THREE.Vector3, deltaTime: number): void {
    this.bot.moveTowards(target, deltaTime)
  }

  pickNewWaypoint(): void {
    this.currentWaypoint = this.map.getRandomWaypoint()
  }

  setTarget(target: THREE.Vector3): void {
    this.currentWaypoint = target
  }

  hasReachedTarget(): boolean {
    if (!this.currentWaypoint) return true
    return this.bot.position.distanceTo(this.currentWaypoint) < this.waypointReachedDistance
  }
}
