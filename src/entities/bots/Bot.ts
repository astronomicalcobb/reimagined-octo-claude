import * as THREE from 'three'
import { Entity } from '../Entity'
import { EntityType } from '@types/enums'
import { PhysicsWorld } from '@physics/PhysicsWorld'
import { Scene } from '@core/Scene'
import { PlayerHealth } from '@entities/player/PlayerHealth'
import { Weapon } from '@entities/weapons/Weapon'
import { Rifle } from '@entities/weapons/Rifle'

export class Bot extends Entity {
  public health: PlayerHealth
  public weapon: Weapon
  public moveSpeed: number = 4.0
  public rotationSpeed: number = 3.0
  public lookDirection: THREE.Vector3 = new THREE.Vector3(0, 0, -1)
  private physicsWorld: PhysicsWorld
  private scene: Scene

  constructor(
    id: string,
    scene: Scene,
    physicsWorld: PhysicsWorld,
    initialPosition: THREE.Vector3
  ) {
    super(id, EntityType.BOT, initialPosition)

    this.scene = scene
    this.physicsWorld = physicsWorld
    this.health = new PlayerHealth(id, 100)
    this.weapon = new Rifle()

    this.createMesh()
    this.createPhysicsBody()

    this.setupHealthEvents()
  }

  private createMesh(): void {
    const group = new THREE.Group()

    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.0, 8, 16)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.8
    group.add(body)

    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16)
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.6
    group.add(head)

    this.mesh = group
    this.mesh.position.copy(this.position)
    this.scene.add(this.mesh)
  }

  private createPhysicsBody(): void {
    const body = this.physicsWorld.addRigidBody(
      this.id,
      this.position,
      'kinematic',
      'capsule',
      { halfHeight: 0.5, radius: 0.3 }
    )

    const collider = this.physicsWorld.getCollider(this.id)
    console.log(`Bot ${this.id} physics created:`, {
      body: body ? 'SUCCESS' : 'FAILED',
      collider: collider ? 'SUCCESS' : 'FAILED',
      position: this.position
    })
  }

  private setupHealthEvents(): void {
    this.health.events.on('death', () => {
      console.log(`Bot ${this.id} died`)
      this.hideMesh()
    })
  }

  private hideMesh(): void {
    if (this.mesh) {
      this.mesh.visible = false
    }
  }

  private showMesh(): void {
    if (this.mesh) {
      this.mesh.visible = true
    }
  }

  update(deltaTime: number): void {
    if (this.health.isDead) return

    this.weapon.update(deltaTime)
    this.updateMeshPosition()
  }

  private updateMeshPosition(): void {
    if (this.mesh) {
      this.mesh.position.copy(this.position)

      const angle = Math.atan2(this.lookDirection.x, this.lookDirection.z)
      this.mesh.rotation.y = angle
    }
  }

  setPosition(position: THREE.Vector3): void {
    this.position.copy(position)
    const body = this.physicsWorld.getRigidBody(this.id)
    if (body) {
      body.setTranslation({ x: position.x, y: position.y, z: position.z }, true)
    }
    this.updateMeshPosition()
  }

  moveTowards(target: THREE.Vector3, deltaTime: number): void {
    const direction = target.clone().sub(this.position)
    direction.y = 0

    if (direction.length() > 0.5) {
      direction.normalize()
      this.lookDirection.copy(direction)

      const movement = direction.multiplyScalar(this.moveSpeed * deltaTime)
      const newPosition = this.position.clone().add(movement)
      newPosition.y = Math.max(0.5, newPosition.y)

      this.setPosition(newPosition)
    }
  }

  lookAt(target: THREE.Vector3): void {
    const direction = target.clone().sub(this.position)
    direction.y = 0

    if (direction.length() > 0) {
      direction.normalize()
      this.lookDirection.copy(direction)
    }
  }

  fireWeapon(targetPosition: THREE.Vector3): boolean {
    const direction = targetPosition.clone().sub(this.position).normalize()
    return this.weapon.fire(this.position.clone().add(new THREE.Vector3(0, 1.5, 0)), direction)
  }

  takeDamage(amount: number, attacker?: string): void {
    this.health.takeDamage(amount, attacker)
  }

  destroy(): void {
    super.destroy()
    this.physicsWorld.removeRigidBody(this.id)
    if (this.mesh) {
      this.scene.remove(this.mesh)
    }
  }
}
