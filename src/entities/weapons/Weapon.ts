import * as THREE from 'three'
import { IWeapon } from '@types/interfaces'
import { WeaponType } from '@types/enums'
import { EventEmitter } from '@utils/EventEmitter'

export abstract class Weapon implements IWeapon {
  public name: string
  public type: WeaponType
  public damage: number
  public fireRate: number
  public magazineSize: number
  public currentAmmo: number
  public reserveAmmo: number
  public reloadTime: number
  public spread: number
  public range: number
  public isReloading: boolean = false
  public timeSinceLastShot: number = 0
  public events: EventEmitter = new EventEmitter()

  protected reloadStartTime: number = 0

  constructor(
    name: string,
    type: WeaponType,
    damage: number,
    fireRate: number,
    magazineSize: number,
    reserveAmmo: number,
    reloadTime: number,
    spread: number,
    range: number
  ) {
    this.name = name
    this.type = type
    this.damage = damage
    this.fireRate = fireRate
    this.magazineSize = magazineSize
    this.currentAmmo = magazineSize
    this.reserveAmmo = reserveAmmo
    this.reloadTime = reloadTime
    this.spread = spread
    this.range = range
  }

  abstract fire(origin: THREE.Vector3, direction: THREE.Vector3): boolean

  reload(): void {
    if (this.isReloading || this.currentAmmo === this.magazineSize || this.reserveAmmo === 0) {
      return
    }

    this.isReloading = true
    this.reloadStartTime = Date.now()
    this.events.emit('reloadStart', { weapon: this.name })
  }

  update(deltaTime: number): void {
    this.timeSinceLastShot += deltaTime

    if (this.isReloading) {
      const reloadProgress = (Date.now() - this.reloadStartTime) / 1000
      if (reloadProgress >= this.reloadTime) {
        this.finishReload()
      }
    }
  }

  protected finishReload(): void {
    const ammoNeeded = this.magazineSize - this.currentAmmo
    const ammoToReload = Math.min(ammoNeeded, this.reserveAmmo)

    this.currentAmmo += ammoToReload
    this.reserveAmmo -= ammoToReload

    this.isReloading = false
    this.events.emit('reloadComplete', { weapon: this.name, currentAmmo: this.currentAmmo })
  }

  canFire(): boolean {
    const fireDelay = 60 / this.fireRate
    return !this.isReloading && this.currentAmmo > 0 && this.timeSinceLastShot >= fireDelay
  }

  protected consumeAmmo(): void {
    this.currentAmmo--
    this.timeSinceLastShot = 0
  }

  protected applySpread(direction: THREE.Vector3): THREE.Vector3 {
    const spreadAngle = this.spread * (Math.PI / 180)
    const randomAngle = (Math.random() - 0.5) * spreadAngle
    const randomAngle2 = (Math.random() - 0.5) * spreadAngle

    const spreadDir = direction.clone()
    spreadDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), randomAngle)
    spreadDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), randomAngle2)
    spreadDir.normalize()

    return spreadDir
  }

  getTotalAmmo(): number {
    return this.currentAmmo + this.reserveAmmo
  }

  getReloadProgress(): number {
    if (!this.isReloading) return 1
    const progress = (Date.now() - this.reloadStartTime) / (this.reloadTime * 1000)
    return Math.min(1, progress)
  }
}
