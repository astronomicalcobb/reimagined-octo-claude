import * as THREE from 'three'
import { Bot } from './Bot'
import { BotNavigator } from './BotNavigator'
import { Player } from '@entities/player/Player'
import { PhysicsWorld } from '@physics/PhysicsWorld'
import { AIState } from '@types/enums'

export class BotAI {
  private bot: Bot
  private navigator: BotNavigator
  private player: Player
  private physicsWorld: PhysicsWorld
  private currentState: AIState = AIState.PATROL
  private detectionRange: number = 30.0
  private attackRange: number = 20.0
  private retreatHealthThreshold: number = 30
  private lastStateChangeTime: number = 0
  private stateChangeDelay: number = 500
  private lastFireTime: number = 0
  private fireDelay: number = 200
  private burstCount: number = 0
  private maxBurstCount: number = 5

  constructor(
    bot: Bot,
    navigator: BotNavigator,
    player: Player,
    physicsWorld: PhysicsWorld
  ) {
    this.bot = bot
    this.navigator = navigator
    this.player = player
    this.physicsWorld = physicsWorld
  }

  update(deltaTime: number): void {
    if (this.bot.health.isDead) return

    this.updateState()
    this.executeState(deltaTime)
  }

  private updateState(): void {
    const now = Date.now()
    if (now - this.lastStateChangeTime < this.stateChangeDelay) return

    const distanceToPlayer = this.bot.position.distanceTo(this.player.position)
    const canSeePlayer = this.hasLineOfSight(this.player.position)

    const previousState = this.currentState

    if (this.bot.health.getHealthPercentage() < this.retreatHealthThreshold) {
      this.currentState = AIState.RETREAT
    } else if (canSeePlayer && distanceToPlayer <= this.attackRange) {
      this.currentState = AIState.ATTACK
    } else if (canSeePlayer && distanceToPlayer <= this.detectionRange) {
      this.currentState = AIState.CHASE
    } else {
      this.currentState = AIState.PATROL
    }

    if (previousState !== this.currentState) {
      this.lastStateChangeTime = now
      this.onStateChange(previousState, this.currentState)
    }
  }

  private executeState(deltaTime: number): void {
    switch (this.currentState) {
      case AIState.PATROL:
        this.patrol(deltaTime)
        break
      case AIState.CHASE:
        this.chase(deltaTime)
        break
      case AIState.ATTACK:
        this.attack(deltaTime)
        break
      case AIState.RETREAT:
        this.retreat(deltaTime)
        break
    }
  }

  private patrol(deltaTime: number): void {
    this.navigator.update(deltaTime)
  }

  private chase(deltaTime: number): void {
    const targetPos = this.player.position.clone()
    targetPos.y = this.bot.position.y
    this.navigator.moveToTarget(targetPos, deltaTime)
    this.bot.lookAt(this.player.position)
  }

  private attack(deltaTime: number): void {
    this.bot.lookAt(this.player.position)

    const now = Date.now()
    if (now - this.lastFireTime > this.fireDelay && this.burstCount < this.maxBurstCount) {
      const accuracy = 0.7
      const targetPos = this.player.position.clone()
      targetPos.x += (Math.random() - 0.5) * 2 * (1 - accuracy)
      targetPos.y += (Math.random() - 0.5) * 2 * (1 - accuracy) + 1.5
      targetPos.z += (Math.random() - 0.5) * 2 * (1 - accuracy)

      if (this.bot.fireWeapon(targetPos)) {
        this.lastFireTime = now
        this.burstCount++
      }
    }

    if (this.burstCount >= this.maxBurstCount) {
      setTimeout(() => {
        this.burstCount = 0
      }, 1000)
    }

    const distanceToPlayer = this.bot.position.distanceTo(this.player.position)
    if (distanceToPlayer < 10) {
      const awayDirection = this.bot.position.clone().sub(this.player.position)
      awayDirection.normalize()
      const retreatTarget = this.bot.position.clone().add(awayDirection.multiplyScalar(5))
      this.navigator.moveToTarget(retreatTarget, deltaTime)
    }
  }

  private retreat(deltaTime: number): void {
    const awayDirection = this.bot.position.clone().sub(this.player.position)
    awayDirection.y = 0
    awayDirection.normalize()

    const retreatTarget = this.bot.position.clone().add(awayDirection.multiplyScalar(10))
    this.navigator.moveToTarget(retreatTarget, deltaTime)
    this.bot.lookAt(this.player.position)
  }

  private hasLineOfSight(targetPosition: THREE.Vector3): boolean {
    const origin = this.bot.position.clone()
    origin.y += 1.5

    const direction = targetPosition.clone().sub(origin)
    const distance = direction.length()
    direction.normalize()

    const result = this.physicsWorld.raycast(origin, direction, distance, true)

    return !result.hit || result.distance! >= distance - 1
  }

  private onStateChange(oldState: AIState, newState: AIState): void {
    console.log(`Bot ${this.bot.id} state: ${oldState} -> ${newState}`)
  }

  getCurrentState(): AIState {
    return this.currentState
  }
}
