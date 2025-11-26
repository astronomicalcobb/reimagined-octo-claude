import * as THREE from 'three'
import { EntityType, WeaponType } from './enums'

export interface IEntity {
  id: string
  type: EntityType
  position: THREE.Vector3
  rotation: THREE.Euler
  update(deltaTime: number): void
  destroy(): void
}

export interface IHealth {
  maxHealth: number
  currentHealth: number
  isDead: boolean
  takeDamage(amount: number, attacker?: string): void
  heal(amount: number): void
  die(): void
  respawn(): void
  getHealthPercentage(): number
}

export interface IWeapon {
  name: string
  type: WeaponType
  damage: number
  fireRate: number
  magazineSize: number
  currentAmmo: number
  reserveAmmo: number
  reloadTime: number
  spread: number
  range: number
  isReloading: boolean
  fire(origin: THREE.Vector3, direction: THREE.Vector3): boolean
  reload(): void
  update(deltaTime: number): void
}

export interface IGameMode {
  name: string
  start(): void
  end(): void
  update(deltaTime: number): void
  reset(): void
}

export interface PlayerScore {
  id: string
  name: string
  kills: number
  deaths: number
  kd: number
}

export interface SpawnPointData {
  position: THREE.Vector3
  rotation: number
}

export interface DamageInfo {
  amount: number
  attacker: string
  victim: string
  weaponType: WeaponType
  timestamp: number
}
