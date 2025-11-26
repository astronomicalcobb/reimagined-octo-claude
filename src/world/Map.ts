import * as THREE from 'three'
import { SpawnPoint } from './SpawnPoint'

export class Map {
  public name: string
  public spawnPoints: SpawnPoint[] = []
  public waypoints: THREE.Vector3[] = []
  public meshes: THREE.Object3D[] = []

  constructor(name: string) {
    this.name = name
  }

  addSpawnPoint(position: THREE.Vector3, rotation: number = 0): SpawnPoint {
    const spawnPoint = new SpawnPoint(position, rotation)
    this.spawnPoints.push(spawnPoint)
    return spawnPoint
  }

  addWaypoint(position: THREE.Vector3): void {
    this.waypoints.push(position.clone())
  }

  addMesh(mesh: THREE.Object3D): void {
    this.meshes.push(mesh)
  }

  getAvailableSpawnPoint(excludePosition?: THREE.Vector3, minDistance: number = 10): SpawnPoint | null {
    const availableSpawns = this.spawnPoints.filter(sp => sp.canSpawn())

    if (availableSpawns.length === 0) return null

    if (excludePosition) {
      availableSpawns.sort((a, b) => {
        return b.getDistanceToPoint(excludePosition) - a.getDistanceToPoint(excludePosition)
      })
      return availableSpawns[0]
    }

    return availableSpawns[Math.floor(Math.random() * availableSpawns.length)]
  }

  getRandomWaypoint(): THREE.Vector3 | null {
    if (this.waypoints.length === 0) return null
    return this.waypoints[Math.floor(Math.random() * this.waypoints.length)].clone()
  }

  getClosestWaypoint(position: THREE.Vector3): THREE.Vector3 | null {
    if (this.waypoints.length === 0) return null

    let closest = this.waypoints[0]
    let minDistance = position.distanceTo(this.waypoints[0])

    for (let i = 1; i < this.waypoints.length; i++) {
      const distance = position.distanceTo(this.waypoints[i])
      if (distance < minDistance) {
        minDistance = distance
        closest = this.waypoints[i]
      }
    }

    return closest.clone()
  }

  dispose(): void {
    this.spawnPoints = []
    this.waypoints = []
    this.meshes.forEach(mesh => {
      if (mesh.parent) {
        mesh.parent.remove(mesh)
      }
    })
    this.meshes = []
  }
}
