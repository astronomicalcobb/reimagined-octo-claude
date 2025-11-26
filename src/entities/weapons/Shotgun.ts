import * as THREE from 'three'
import { Weapon } from './Weapon'
import { WeaponType } from '@types/enums'

export class Shotgun extends Weapon {
  private pelletsPerShot: number = 8

  constructor() {
    super(
      'Shotgun',
      WeaponType.SHOTGUN,
      12,
      70,
      6,
      30,
      2.5,
      15,
      25
    )
  }

  fire(origin: THREE.Vector3, direction: THREE.Vector3): boolean {
    if (!this.canFire()) {
      if (this.currentAmmo === 0 && !this.isReloading) {
        this.events.emit('emptyClick')
      }
      return false
    }

    this.consumeAmmo()

    for (let i = 0; i < this.pelletsPerShot; i++) {
      const spreadDirection = this.applySpread(direction)

      this.events.emit('fire', {
        weapon: this.name,
        origin: origin.clone(),
        direction: spreadDirection,
        damage: this.damage,
        range: this.range,
        pelletIndex: i
      })
    }

    return true
  }
}
