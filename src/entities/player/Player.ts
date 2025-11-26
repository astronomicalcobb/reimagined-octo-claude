import * as THREE from 'three'
import { Entity } from '../Entity'
import { EntityType } from '@types/enums'
import { FirstPersonController } from './FirstPersonController'
import { PlayerHealth } from './PlayerHealth'
import { DashAbility } from './DashAbility'
import { WeaponManager } from '@entities/weapons/WeaponManager'
import { InputManager } from '@core/InputManager'
import { PhysicsWorld } from '@physics/PhysicsWorld'

export class Player extends Entity {
  public controller: FirstPersonController
  public health: PlayerHealth
  public dashAbility: DashAbility
  public weaponManager: WeaponManager
  private camera: THREE.PerspectiveCamera
  private inputManager: InputManager
  private physicsWorld: PhysicsWorld

  constructor(
    id: string,
    camera: THREE.PerspectiveCamera,
    physicsWorld: PhysicsWorld,
    inputManager: InputManager,
    initialPosition: THREE.Vector3 = new THREE.Vector3(0, 2, 0)
  ) {
    super(id, EntityType.PLAYER, initialPosition)

    this.camera = camera
    this.inputManager = inputManager
    this.physicsWorld = physicsWorld

    this.controller = new FirstPersonController(
      camera,
      physicsWorld,
      inputManager,
      id,
      initialPosition
    )

    this.health = new PlayerHealth(id)
    this.dashAbility = new DashAbility()
    this.weaponManager = new WeaponManager(physicsWorld, id)

    this.setupHealthEvents()
    this.setupWeaponEvents()
  }

  private setupHealthEvents(): void {
    this.health.events.on('death', () => {
      console.log('Player died')
      setTimeout(() => {
        this.respawn()
      }, 3000)
    })

    this.health.events.on('respawn', () => {
      console.log('Player respawned')
      this.dashAbility.reset()
    })
  }

  private setupWeaponEvents(): void {
    this.weaponManager.events.on('hit', (data) => {
      console.log(`Player hit ${data.entityType}: ${data.entityId}`)
    })
  }

  setBotDamageCallback(callback: (entityId: string, entityType: string, damage: number) => void): void {
    this.weaponManager.events.on('hit', (data) => {
      if (data.entityId && data.entityType) {
        callback(data.entityId, data.entityType, data.damage)
      }
    })
  }

  update(deltaTime: number): void {
    if (this.health.isDead) return

    this.controller.update(deltaTime)
    this.dashAbility.update(deltaTime)
    this.weaponManager.update(deltaTime)

    this.handleDash()
    this.handleWeaponInput()

    this.position.copy(this.controller.position)
  }

  private handleWeaponInput(): void {
    if (this.inputManager.isMouseButtonDown(0)) {
      const origin = this.getCameraPosition()
      const direction = this.getForwardDirection()
      this.weaponManager.fireCurrentWeapon(origin, direction)
    }

    if (this.inputManager.isKeyDown('KeyR')) {
      this.weaponManager.reloadCurrentWeapon()
    }

    if (this.inputManager.isKeyDown('Digit1')) {
      this.weaponManager.switchWeapon(0)
    } else if (this.inputManager.isKeyDown('Digit2')) {
      this.weaponManager.switchWeapon(1)
    } else if (this.inputManager.isKeyDown('Digit3')) {
      this.weaponManager.switchWeapon(2)
    }
  }

  private handleDash(): void {
    if (this.inputManager.isKeyDown('KeyE') && this.dashAbility.canUse()) {
      const moveDirection = new THREE.Vector3()

      if (this.inputManager.isKeyDown('KeyW')) moveDirection.z += 1
      if (this.inputManager.isKeyDown('KeyS')) moveDirection.z -= 1
      if (this.inputManager.isKeyDown('KeyA')) moveDirection.x -= 1
      if (this.inputManager.isKeyDown('KeyD')) moveDirection.x += 1

      if (moveDirection.length() === 0) {
        moveDirection.z = 1
      }

      moveDirection.normalize()

      const forward = this.controller.getForwardDirection()
      forward.y = 0
      forward.normalize()
      const right = this.controller.getRightDirection()

      const dashDir = new THREE.Vector3()
      dashDir.addScaledVector(forward, moveDirection.z)
      dashDir.addScaledVector(right, moveDirection.x)
      dashDir.normalize()

      const dashOffset = this.dashAbility.use(dashDir)

      if (dashOffset) {
        const newPosition = this.controller.position.clone().add(dashOffset)
        this.controller.setPosition(newPosition)
        console.log('Dash used! Distance:', dashOffset.length())
      }
    }
  }

  respawn(): void {
    this.health.respawn()
    this.dashAbility.reset()
    this.position.set(0, 2, 0)
    this.controller.setPosition(this.position)
    this.controller.velocity.set(0, 0, 0)
  }

  takeDamage(amount: number, attacker?: string): void {
    this.health.takeDamage(amount, attacker)
  }

  getForwardDirection(): THREE.Vector3 {
    return this.controller.getCameraDirection()
  }

  getCameraPosition(): THREE.Vector3 {
    return this.camera.position.clone()
  }

  destroy(): void {
    super.destroy()
    this.controller.dispose()
  }
}
