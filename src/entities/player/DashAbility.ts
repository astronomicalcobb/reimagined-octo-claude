import * as THREE from 'three'
import { EventEmitter } from '@utils/EventEmitter'

export class DashAbility {
  public cooldown: number = 5000
  public dashForce: number = 15.0
  public dashDuration: number = 200
  private lastUsedTime: number = 0
  private isDashing: boolean = false
  private dashEndTime: number = 0
  public events: EventEmitter = new EventEmitter()

  update(deltaTime: number): void {
    if (this.isDashing && Date.now() >= this.dashEndTime) {
      this.isDashing = false
      this.events.emit('dashEnd')
    }
  }

  use(direction: THREE.Vector3, isGrounded: boolean, currentVelocity: THREE.Vector3): THREE.Vector3 | null {
    if (!this.canUse() || !isGrounded) {
      return null
    }

    this.lastUsedTime = Date.now()
    this.isDashing = true
    this.dashEndTime = Date.now() + this.dashDuration

    const dashDirection = direction.clone().normalize()
    dashDirection.y = 0

    if (dashDirection.length() === 0) {
      dashDirection.set(0, 0, -1)
    } else {
      dashDirection.normalize()
    }

    const dashVelocity = dashDirection.multiplyScalar(this.dashForce)

    this.events.emit('dashStart', { direction: dashDirection })

    return dashVelocity
  }

  canUse(): boolean {
    const timeSinceLastUse = Date.now() - this.lastUsedTime
    return timeSinceLastUse >= this.cooldown
  }

  getRemainingCooldown(): number {
    const timeSinceLastUse = Date.now() - this.lastUsedTime
    return Math.max(0, this.cooldown - timeSinceLastUse)
  }

  getCooldownPercentage(): number {
    const remaining = this.getRemainingCooldown()
    return (1 - remaining / this.cooldown) * 100
  }

  isOnCooldown(): boolean {
    return !this.canUse()
  }

  getIsDashing(): boolean {
    return this.isDashing
  }
}
