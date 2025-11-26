import * as THREE from 'three'
import { Weapon } from './Weapon'
import { WeaponType } from '@types/enums'

export class Rifle extends Weapon {
  constructor() {
    super(
      'Rifle',
      WeaponType.RIFLE,
      30,
      600,
      30,
      120,
      2.0,
      1,
      100
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
