import * as THREE from 'three'
import { IEntity } from '@types/interfaces'
import { EntityType } from '@types/enums'

export abstract class Entity implements IEntity {
  public id: string
  public type: EntityType
  public position: THREE.Vector3
  public rotation: THREE.Euler
  public mesh: THREE.Object3D | null = null

  constructor(id: string, type: EntityType, position: THREE.Vector3 = new THREE.Vector3()) {
    this.id = id
    this.type = type
    this.position = position.clone()
    this.rotation = new THREE.Euler()
  }

  abstract update(deltaTime: number): void

  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z)
    if (this.mesh) {
      this.mesh.position.copy(this.position)
    }
  }

  setRotation(x: number, y: number, z: number): void {
    this.rotation.set(x, y, z)
    if (this.mesh) {
      this.mesh.rotation.copy(this.rotation)
    }
  }

  destroy(): void {
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh)
    }
    this.mesh = null
  }
}
