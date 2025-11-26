import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { EventEmitter } from '@utils/EventEmitter'

export class PhysicsWorld {
  private world: RAPIER.World | null = null
  private bodies: Map<string, RAPIER.RigidBody> = new Map()
  private colliders: Map<string, RAPIER.Collider> = new Map()
  private colliderToId: Map<RAPIER.Collider, string> = new Map()
  public events: EventEmitter = new EventEmitter()
  private initialized: boolean = false

  async init(): Promise<void> {
    await RAPIER.init()

    const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0)
    this.world = new RAPIER.World(gravity)
    this.initialized = true

    console.log('Physics world initialized')
  }

  isInitialized(): boolean {
    return this.initialized
  }

  step(deltaTime: number): void {
    if (!this.world) return
    this.world.step()
  }

  addRigidBody(
    id: string,
    position: THREE.Vector3,
    bodyType: 'dynamic' | 'kinematic' | 'fixed',
    shapeType: 'box' | 'sphere' | 'capsule' | 'plane',
    dimensions: { x?: number; y?: number; z?: number; radius?: number; halfHeight?: number },
    collisionGroups?: number,
    collisionMask?: number
  ): RAPIER.RigidBody | null {
    if (!this.world) return null

    let rigidBodyDesc: RAPIER.RigidBodyDesc

    switch (bodyType) {
      case 'dynamic':
        rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        break
      case 'kinematic':
        rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
        break
      case 'fixed':
        rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
        break
    }

    rigidBodyDesc.setTranslation(position.x, position.y, position.z)
    const rigidBody = this.world.createRigidBody(rigidBodyDesc)

    let colliderDesc: RAPIER.ColliderDesc

    switch (shapeType) {
      case 'box':
        colliderDesc = RAPIER.ColliderDesc.cuboid(
          dimensions.x || 0.5,
          dimensions.y || 0.5,
          dimensions.z || 0.5
        )
        break
      case 'sphere':
        colliderDesc = RAPIER.ColliderDesc.ball(dimensions.radius || 0.5)
        break
      case 'capsule':
        colliderDesc = RAPIER.ColliderDesc.capsule(
          dimensions.halfHeight || 0.5,
          dimensions.radius || 0.3
        )
        break
      case 'plane':
        colliderDesc = RAPIER.ColliderDesc.cuboid(100, 0.1, 100)
        break
    }

    if (collisionGroups !== undefined && collisionMask !== undefined) {
      colliderDesc.setCollisionGroups(
        (collisionGroups << 16) | collisionMask
      )
    }

    const collider = this.world.createCollider(colliderDesc, rigidBody)

    this.bodies.set(id, rigidBody)
    this.colliders.set(id, collider)
    this.colliderToId.set(collider, id)

    console.log(`PhysicsWorld: Added entity ${id}, collider handle: ${collider.handle}, total tracked: ${this.colliderToId.size}`)

    return rigidBody
  }

  removeRigidBody(id: string): void {
    if (!this.world) return

    const body = this.bodies.get(id)
    const collider = this.colliders.get(id)

    if (body) {
      this.world.removeRigidBody(body)
      this.bodies.delete(id)
    }

    if (collider) {
      this.colliderToId.delete(collider)
      this.colliders.delete(id)
    }
  }

  getRigidBody(id: string): RAPIER.RigidBody | undefined {
    return this.bodies.get(id)
  }

  getCollider(id: string): RAPIER.Collider | undefined {
    return this.colliders.get(id)
  }

  getEntityIdFromCollider(collider: RAPIER.Collider): string | undefined {
    return this.colliderToId.get(collider)
  }

  setBodyPosition(id: string, position: THREE.Vector3): void {
    const body = this.bodies.get(id)
    if (body) {
      body.setTranslation({ x: position.x, y: position.y, z: position.z }, true)
    }
  }

  getBodyPosition(id: string): THREE.Vector3 | null {
    const body = this.bodies.get(id)
    if (body) {
      const translation = body.translation()
      return new THREE.Vector3(translation.x, translation.y, translation.z)
    }
    return null
  }

  raycast(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number,
    solidOnly: boolean = true
  ): { hit: boolean; point?: THREE.Vector3; normal?: THREE.Vector3; collider?: RAPIER.Collider; distance?: number; entityId?: string } {
    if (!this.world) return { hit: false }

    const ray = new RAPIER.Ray(origin, direction)
    const hit = this.world.castRay(ray, maxDistance, solidOnly)

    // Only log weapon raycasts (longer range) to reduce spam
    const isWeaponRaycast = maxDistance > 10
    if (isWeaponRaycast) {
      console.log(`[WEAPON RAYCAST] range=${maxDistance}, hit=${!!hit}, toi=${hit?.toi}, collider=${hit?.collider?.handle}`)
    }

    if (hit) {
      // Rapier uses 'toi' (time of impact), not 'timeOfImpact'
      const timeOfImpact = hit.toi

      if (timeOfImpact === undefined || timeOfImpact === null) {
        if (isWeaponRaycast) {
          console.warn('Hit detected but toi is undefined/null:', hit)
        }
        return { hit: false }
      }

      const hitPoint = ray.pointAt(timeOfImpact)
      const entityId = this.colliderToId.get(hit.collider)

      if (isWeaponRaycast) {
        console.log(`[WEAPON HIT] ✓ entityId=${entityId}, type=${entityId?.split('-')[0]}, distance=${timeOfImpact.toFixed(2)}`)
      }

      const result: { hit: boolean; point?: THREE.Vector3; normal?: THREE.Vector3; collider?: RAPIER.Collider; distance?: number; entityId?: string } = {
        hit: true,
        point: new THREE.Vector3(hitPoint.x, hitPoint.y, hitPoint.z),
        collider: hit.collider,
        distance: timeOfImpact,
        entityId: entityId
      }

      if (hit.normal) {
        result.normal = new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z)
      }

      return result
    }

    return { hit: false }
  }

  dispose(): void {
    if (this.world) {
      this.world.free()
      this.world = null
    }
    this.bodies.clear()
    this.colliders.clear()
    this.colliderToId.clear()
  }
}
