import * as THREE from 'three'
import { SpawnPointData } from '@types/interfaces'

export class SpawnPoint {
  public position: THREE.Vector3
  public rotation: number
  public isOccupied: boolean = false
  public lastSpawnTime: number = 0

  constructor(position: THREE.Vector3, rotation: number = 0) {
    this.position = position.clone()
    this.rotation = rotation
  }

  markOccupied(): void {
    this.isOccupied = true
    this.lastSpawnTime = Date.now()
  }

  markFree(): void {
    this.isOccupied = false
  }

  canSpawn(minTimeBetweenSpawns: number = 2000): boolean {
    if (this.isOccupied) return false
    const timeSinceLastSpawn = Date.now() - this.lastSpawnTime
    return timeSinceLastSpawn >= minTimeBetweenSpawns
  }

  getDistanceToPoint(point: THREE.Vector3): number {
    return this.position.distanceTo(point)
  }

  toData(): SpawnPointData {
    return {
      position: this.position.clone(),
      rotation: this.rotation
    }
  }
}
