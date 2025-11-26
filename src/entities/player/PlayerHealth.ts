import { IHealth } from '@types/interfaces'
import { EventEmitter } from '@utils/EventEmitter'

export class PlayerHealth implements IHealth {
  public maxHealth: number = 100
  public currentHealth: number = 100
  public isDead: boolean = false
  public events: EventEmitter = new EventEmitter()
  private playerId: string

  constructor(playerId: string, maxHealth: number = 100) {
    this.playerId = playerId
    this.maxHealth = maxHealth
    this.currentHealth = maxHealth
  }

  takeDamage(amount: number, attacker?: string): void {
    if (this.isDead) return

    this.currentHealth = Math.max(0, this.currentHealth - amount)
    this.events.emit('damage', { amount, attacker, currentHealth: this.currentHealth })

    if (this.currentHealth <= 0) {
      this.die()
    }
  }

  heal(amount: number): void {
    if (this.isDead) return

    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount)
    this.events.emit('heal', { amount, currentHealth: this.currentHealth })
  }

  die(): void {
    if (this.isDead) return

    this.isDead = true
    this.currentHealth = 0
    this.events.emit('death', { playerId: this.playerId })
  }

  respawn(): void {
    this.currentHealth = this.maxHealth
    this.isDead = false
    this.events.emit('respawn', { playerId: this.playerId })
  }

  getHealthPercentage(): number {
    return (this.currentHealth / this.maxHealth) * 100
  }

  isAlive(): boolean {
    return !this.isDead && this.currentHealth > 0
  }
}
