import * as THREE from 'three'
import { Weapon } from './Weapon'
import { WeaponType } from '@types/enums'

export class Pistol extends Weapon {
  constructor() {
    super(
      'Pistol',
      WeaponType.PISTOL,
      25,
      300,
      12,
      60,
      1.5,
      2,
      50
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

    const spreadDirection = this.applySpread(direction)

    this.events.emit('fire', {
      weapon: this.name,
      origin: origin.clone(),
      direction: spreadDirection,
      damage: this.damage,
      range: this.range
    })

    return true
  }
}
