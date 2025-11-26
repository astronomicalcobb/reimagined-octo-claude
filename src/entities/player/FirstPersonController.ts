import * as THREE from 'three'
import { InputManager } from '@core/InputManager'
import { PhysicsWorld } from '@physics/PhysicsWorld'
import RAPIER from '@dimforge/rapier3d-compat'

export class FirstPersonController {
  private camera: THREE.PerspectiveCamera
  private physicsBody: RAPIER.RigidBody | null = null
  private physicsWorld: PhysicsWorld
  private inputManager: InputManager
  private playerId: string

  public position: THREE.Vector3 = new THREE.Vector3()
  public velocity: THREE.Vector3 = new THREE.Vector3()
  public isGrounded: boolean = false

  private moveSpeed: number = 5.0
  private sprintSpeed: number = 7.5
  private jumpForce: number = 5.0
  private mouseSensitivity: number = 0.002
  private pitch: number = 0
  private yaw: number = 0

  private readonly cameraHeight: number = 1.7
  private readonly maxPitch: number = Math.PI / 2 - 0.1

  constructor(
    camera: THREE.PerspectiveCamera,
    physicsWorld: PhysicsWorld,
    inputManager: InputManager,
    playerId: string,
    initialPosition: THREE.Vector3 = new THREE.Vector3(0, 2, 0)
  ) {
    this.camera = camera
    this.physicsWorld = physicsWorld
    this.inputManager = inputManager
    this.playerId = playerId
    this.position.copy(initialPosition)

    this.initPhysics()
  }

  private initPhysics(): void {
    this.physicsBody = this.physicsWorld.addRigidBody(
      this.playerId,
      this.position,
      'kinematic',
      'capsule',
      { halfHeight: 0.5, radius: 0.3 }
    )

    console.log('Player physics body created:', this.physicsBody ? 'SUCCESS' : 'FAILED')
  }

  update(deltaTime: number): void {
    if (!this.physicsBody) {
      console.warn('No physics body for player')
      return
    }

    this.handleMouseLook()
    this.checkGrounded()
    this.handleMovement(deltaTime)
    this.updateCameraPosition()
  }

  private handleMouseLook(): void {
    if (!this.inputManager.isPointerLocked) return

    const mouseDelta = this.inputManager.getMouseDelta()

    this.yaw -= mouseDelta.x * this.mouseSensitivity
    this.pitch -= mouseDelta.y * this.mouseSensitivity

    this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch))

    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ')
  }

  private handleMovement(deltaTime: number): void {
    const moveDirection = new THREE.Vector3()

    if (this.inputManager.isKeyDown('KeyW')) moveDirection.z += 1
    if (this.inputManager.isKeyDown('KeyS')) moveDirection.z -= 1
    if (this.inputManager.isKeyDown('KeyA')) moveDirection.x -= 1
    if (this.inputManager.isKeyDown('KeyD')) moveDirection.x += 1

    if (moveDirection.length() > 0) {
      moveDirection.normalize()

      const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0))
      const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.yaw, 0))

      const moveVec = new THREE.Vector3()
      moveVec.addScaledVector(forward, moveDirection.z)
      moveVec.addScaledVector(right, moveDirection.x)
      moveVec.normalize()

      const speed = this.inputManager.isKeyDown('ShiftLeft') ? this.sprintSpeed : this.moveSpeed
      this.velocity.x = moveVec.x * speed
      this.velocity.z = moveVec.z * speed
    } else {
      this.velocity.x = 0
      this.velocity.z = 0
    }

    if (this.inputManager.isKeyDown('Space') && this.isGrounded) {
      this.velocity.y = this.jumpForce
    }

    if (!this.isGrounded) {
      this.velocity.y += -9.81 * deltaTime
    } else if (this.velocity.y < 0) {
      this.velocity.y = 0
    }

    const newPosition = this.position.clone()
    newPosition.x += this.velocity.x * deltaTime
    newPosition.y += this.velocity.y * deltaTime
    newPosition.z += this.velocity.z * deltaTime

    newPosition.y = Math.max(0.5, newPosition.y)

    if (this.physicsBody) {
      this.physicsBody.setTranslation({ x: newPosition.x, y: newPosition.y, z: newPosition.z }, true)
      const translation = this.physicsBody.translation()
      this.position.set(translation.x, translation.y, translation.z)
    }
  }

  private checkGrounded(): void {
    const rayOrigin = new THREE.Vector3(this.position.x, this.position.y, this.position.z)
    const rayDirection = new THREE.Vector3(0, -1, 0)
    const result = this.physicsWorld.raycast(rayOrigin, rayDirection, 1.5, true)

    this.isGrounded = result.hit && result.distance !== undefined && result.distance < 1.2
  }

  private updateCameraPosition(): void {
    this.camera.position.set(
      this.position.x,
      this.position.y + this.cameraHeight,
      this.position.z
    )
  }

  setPosition(position: THREE.Vector3): void {
    this.position.copy(position)
    if (this.physicsBody) {
      this.physicsBody.setTranslation({ x: position.x, y: position.y, z: position.z }, true)
    }
    this.updateCameraPosition()
  }

  getForwardDirection(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'))
  }

  getRightDirection(): THREE.Vector3 {
    return new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.yaw, 0))
  }

  getCameraDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3()
    this.camera.getWorldDirection(direction)
    return direction
  }

  dispose(): void {
    if (this.physicsBody) {
      this.physicsWorld.removeRigidBody(this.playerId)
      this.physicsBody = null
    }
  }
}
