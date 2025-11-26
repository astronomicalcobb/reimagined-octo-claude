import { Weapon } from './Weapon'
import { Pistol } from './Pistol'
import { Rifle } from './Rifle'
import { Shotgun } from './Shotgun'
import { EventEmitter } from '@utils/EventEmitter'
import { PhysicsWorld } from '@physics/PhysicsWorld'
import * as THREE from 'three'

export class WeaponManager {
  public weapons: Weapon[] = []
  public currentWeaponIndex: number = 0
  public events: EventEmitter = new EventEmitter()
  private physicsWorld: PhysicsWorld
  private ownerId: string

  constructor(physicsWorld: PhysicsWorld, ownerId: string) {
    this.physicsWorld = physicsWorld
    this.ownerId = ownerId

    this.weapons.push(new Pistol())
    this.weapons.push(new Rifle())
    this.weapons.push(new Shotgun())

    this.setupWeaponEvents()
  }

  private setupWeaponEvents(): void {
    this.weapons.forEach(weapon => {
      weapon.events.on('fire', (data) => {
        this.handleWeaponFire(data)
      })

      weapon.events.on('emptyClick', () => {
        console.log(`${weapon.name} - Empty!`)
      })

      weapon.events.on('reloadStart', () => {
        console.log(`${weapon.name} - Reloading...`)
      })

      weapon.events.on('reloadComplete', () => {
        console.log(`${weapon.name} - Reload complete`)
      })
    })
  }

  private handleWeaponFire(data: any): void {
    const raycastResult = this.physicsWorld.raycast(
      data.origin,
      data.direction,
      data.range,
      true
    )

    if (raycastResult.hit) {
      this.events.emit('hit', {
        weapon: data.weapon,
        damage: data.damage,
        point: raycastResult.point,
        normal: raycastResult.normal,
        collider: raycastResult.collider,
        attacker: this.ownerId
      })
    }

    this.events.emit('weaponFired', {
      weapon: data.weapon,
      hit: raycastResult.hit,
      origin: data.origin,
      direction: data.direction
    })
  }

  getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex]
  }

  switchWeapon(index: number): void {
    if (index >= 0 && index < this.weapons.length && index !== this.currentWeaponIndex) {
      this.currentWeaponIndex = index
      this.events.emit('weaponSwitch', { weapon: this.getCurrentWeapon().name })
      console.log(`Switched to ${this.getCurrentWeapon().name}`)
    }
  }

  nextWeapon(): void {
    const nextIndex = (this.currentWeaponIndex + 1) % this.weapons.length
    this.switchWeapon(nextIndex)
  }

  previousWeapon(): void {
    const prevIndex = (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length
    this.switchWeapon(prevIndex)
  }

  fireCurrentWeapon(origin: THREE.Vector3, direction: THREE.Vector3): boolean {
    return this.getCurrentWeapon().fire(origin, direction)
  }

  reloadCurrentWeapon(): void {
    this.getCurrentWeapon().reload()
  }

  update(deltaTime: number): void {
    this.weapons.forEach(weapon => weapon.update(deltaTime))
  }
}
