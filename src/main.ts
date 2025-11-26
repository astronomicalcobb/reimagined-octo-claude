import { Game } from '@core/Game'
import { Player } from '@entities/player/Player'
import { MapBuilder } from '@world/MapBuilder'
import * as THREE from 'three'

async function main() {
  console.log('Starting 3D FPS Browser Game...')

  const game = Game.getInstance()

  try {
    await game.init()

    const scene = game.getScene()
    const physicsWorld = game.getPhysicsWorld()
    const inputManager = game.getInputManager()

    if (!scene) {
      throw new Error('Scene not initialized')
    }

    const mapBuilder = new MapBuilder(scene, physicsWorld)
    const arenaMap = mapBuilder.buildSimpleArena()
    game.setMap(arenaMap)

    const spawnPoint = arenaMap.getAvailableSpawnPoint()
    const initialPosition = spawnPoint
      ? spawnPoint.position.clone()
      : new THREE.Vector3(0, 2, 0)

    const player = new Player(
      'player-1',
      scene.camera,
      physicsWorld,
      inputManager,
      initialPosition
    )
    game.setPlayer(player)

    console.log('Player created at position:', player.position)
    console.log('Player controller:', player.controller)

    game.start()

    console.log('Game started successfully!')
    console.log('Controls:')
    console.log('- Click canvas to lock pointer')
    console.log('- WASD: Move')
    console.log('- Space: Jump')
    console.log('- Shift: Dash')
    console.log('- Left Mouse: Shoot')
    console.log('- R: Reload')
    console.log('- 1/2/3: Switch weapons')
  } catch (error) {
    console.error('Failed to initialize game:', error)
  }
}

main()
