import * as THREE from 'three'
import { EventEmitter } from '@utils/EventEmitter'

export class DashAbility {
  public dashDistance: number = 8.0
  private hasBeenUsed: boolean = false
  public events: EventEmitter = new EventEmitter()

  update(deltaTime: number): void {
    // No longer needed since dash is instant
  }

  use(direction: THREE.Vector3): THREE.Vector3 | null {
    if (!this.canUse()) {
      return null
    }

    this.hasBeenUsed = true

    const dashDirection = direction.clone()
    dashDirection.y = 0

    if (dashDirection.length() === 0) {
      dashDirection.set(0, 0, 1)
    } else {
      dashDirection.normalize()
    }

    const dashOffset = dashDirection.multiplyScalar(this.dashDistance)

    this.events.emit('dashUsed', { direction: dashDirection })

    return dashOffset
  }

  canUse(): boolean {
    return !this.hasBeenUsed
  }

  reset(): void {
    this.hasBeenUsed = false
    this.events.emit('dashReset')
  }

  getCooldownPercentage(): number {
    return this.hasBeenUsed ? 0 : 100
  }

  isOnCooldown(): boolean {
    return this.hasBeenUsed
  }

  getIsDashing(): boolean {
    return false
  }
}
