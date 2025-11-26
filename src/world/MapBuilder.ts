import * as THREE from 'three'
import { Scene } from '@core/Scene'
import { PhysicsWorld } from '@physics/PhysicsWorld'
import { CollisionGroups } from '@physics/CollisionGroups'
import { Map } from './Map'

export class MapBuilder {
  private scene: Scene
  private physicsWorld: PhysicsWorld

  constructor(scene: Scene, physicsWorld: PhysicsWorld) {
    this.scene = scene
    this.physicsWorld = physicsWorld
  }

  buildSimpleArena(): Map {
    const map = new Map('Simple Arena')

    const arenaSize = 50
    const wallHeight = 5
    const coverHeight = 2.5

    this.createGround(map, arenaSize)
    this.createWalls(map, arenaSize, wallHeight)
    this.createCoverObjects(map, arenaSize, coverHeight)
    this.createSpawnPoints(map, arenaSize)
    this.createWaypoints(map, arenaSize)

    console.log(`Map "${map.name}" built with ${map.spawnPoints.length} spawn points and ${map.waypoints.length} waypoints`)

    return map
  }

  private createGround(map: Map, size: number): void {
    const gridHelper = new THREE.GridHelper(size, 50, 0x444444, 0x888888)
    gridHelper.position.y = 0.01
    this.scene.add(gridHelper)
    map.addMesh(gridHelper)

    const groundGeometry = new THREE.PlaneGeometry(size, size)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.8,
      metalness: 0.2
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.receiveShadow = true
    this.scene.add(ground)
    map.addMesh(ground)

    this.physicsWorld.addRigidBody(
      'ground',
      new THREE.Vector3(0, 0, 0),
      'fixed',
      'plane',
      {},
      CollisionGroups.WORLD,
      CollisionGroups.getWorldMask()
    )
  }

  private createWalls(map: Map, size: number, height: number): void {
    const halfSize = size / 2
    const wallThickness = 1
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.7
    })

    const wallConfigs = [
      { pos: new THREE.Vector3(0, height / 2, -halfSize), size: new THREE.Vector3(size / 2, height / 2, wallThickness / 2) },
      { pos: new THREE.Vector3(0, height / 2, halfSize), size: new THREE.Vector3(size / 2, height / 2, wallThickness / 2) },
      { pos: new THREE.Vector3(-halfSize, height / 2, 0), size: new THREE.Vector3(wallThickness / 2, height / 2, size / 2) },
      { pos: new THREE.Vector3(halfSize, height / 2, 0), size: new THREE.Vector3(wallThickness / 2, height / 2, size / 2) }
    ]

    wallConfigs.forEach((config, index) => {
      const wallGeometry = new THREE.BoxGeometry(
        config.pos.x === 0 ? size : wallThickness,
        height,
        config.pos.z === 0 ? size : wallThickness
      )
      const wall = new THREE.Mesh(wallGeometry, wallMaterial)
      wall.position.copy(config.pos)
      wall.castShadow = true
      wall.receiveShadow = true
      this.scene.add(wall)
      map.addMesh(wall)

      this.physicsWorld.addRigidBody(
        `wall-${index}`,
        config.pos,
        'fixed',
        'box',
        config.size,
        CollisionGroups.WORLD,
        CollisionGroups.getWorldMask()
      )
    })
  }

  private createCoverObjects(map: Map, arenaSize: number, height: number): void {
    const coverMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9
    })

    const coverPositions = [
      new THREE.Vector3(10, height / 2, 10),
      new THREE.Vector3(-10, height / 2, 10),
      new THREE.Vector3(10, height / 2, -10),
      new THREE.Vector3(-10, height / 2, -10),
      new THREE.Vector3(0, height / 2, 15),
      new THREE.Vector3(0, height / 2, -15),
      new THREE.Vector3(15, height / 2, 0),
      new THREE.Vector3(-15, height / 2, 0)
    ]

    coverPositions.forEach((pos, index) => {
      const isBox = index % 2 === 0
      let geometry: THREE.BufferGeometry
      let dimensions: { x?: number; y?: number; z?: number; radius?: number }

      if (isBox) {
        const width = 2
        const depth = 2
        geometry = new THREE.BoxGeometry(width, height, depth)
        dimensions = { x: width / 2, y: height / 2, z: depth / 2 }
      } else {
        const radius = 1
        geometry = new THREE.CylinderGeometry(radius, radius, height, 16)
        dimensions = { radius, y: height / 2 }
      }

      const mesh = new THREE.Mesh(geometry, coverMaterial)
      mesh.position.copy(pos)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)
      map.addMesh(mesh)

      this.physicsWorld.addRigidBody(
        `cover-${index}`,
        pos,
        'fixed',
        isBox ? 'box' : 'box',
        dimensions,
        CollisionGroups.WORLD,
        CollisionGroups.getWorldMask()
      )
    })
  }

  private createSpawnPoints(map: Map, arenaSize: number): void {
    const radius = arenaSize / 2 - 5
    const numSpawns = 8

    for (let i = 0; i < numSpawns; i++) {
      const angle = (i / numSpawns) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const rotation = angle + Math.PI

      map.addSpawnPoint(new THREE.Vector3(x, 1, z), rotation)
    }
  }

  private createWaypoints(map: Map, arenaSize: number): void {
    const radius = arenaSize / 3
    const numWaypoints = 12

    for (let i = 0; i < numWaypoints; i++) {
      const angle = (i / numWaypoints) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      map.addWaypoint(new THREE.Vector3(x, 0, z))
    }

    map.addWaypoint(new THREE.Vector3(0, 0, 0))
  }
}
