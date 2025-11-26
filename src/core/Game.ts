import { Scene } from './Scene'
import { InputManager } from './InputManager'
import { Time } from './Time'
import { PhysicsWorld } from '@physics/PhysicsWorld'
import { GameState } from '@types/enums'
import { EventEmitter } from '@utils/EventEmitter'
import { Player } from '@entities/player/Player'
import { Map } from '@world/Map'
import { UIManager } from '@ui/UIManager'
import { BotSpawner } from '@entities/bots/BotSpawner'

export class Game {
  private static instance: Game
  private canvas: HTMLCanvasElement
  private scene: Scene | null = null
  private inputManager: InputManager
  private time: Time
  private physicsWorld: PhysicsWorld
  private uiManager: UIManager
  private gameState: GameState = GameState.LOADING
  private animationFrameId: number = 0
  private fixedTimeStep: number = 1 / 60
  private accumulator: number = 0
  public events: EventEmitter = new EventEmitter()

  public player: Player | null = null
  public currentMap: Map | null = null
  public botSpawner: BotSpawner | null = null

  private constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement
    if (!this.canvas) {
      throw new Error('Canvas element not found')
    }

    this.inputManager = InputManager.getInstance()
    this.time = Time.getInstance()
    this.physicsWorld = new PhysicsWorld()
    this.uiManager = new UIManager()
  }

  static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game()
    }
    return Game.instance
  }

  async init(): Promise<void> {
    console.log('Initializing game...')

    this.scene = new Scene(this.canvas)
    this.inputManager.init(this.canvas)
    this.uiManager.init()

    await this.physicsWorld.init()

    console.log('Game initialized')

    this.hideLoadingScreen()
    this.setGameState(GameState.MENU)
  }

  start(): void {
    console.log('Starting game...')
    this.setGameState(GameState.PLAYING)
    this.gameLoop(performance.now())
  }

  private gameLoop(currentTime: number): void {
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))

    this.time.update(currentTime)

    if (this.gameState === GameState.PLAYING) {
      this.accumulator += this.time.deltaTime

      while (this.accumulator >= this.fixedTimeStep) {
        this.fixedUpdate()
        this.accumulator -= this.fixedTimeStep
      }

      this.update(this.time.deltaTime)
    }

    this.render()
  }

  private fixedUpdate(): void {
    if (this.physicsWorld.isInitialized()) {
      this.physicsWorld.step(this.fixedTimeStep)
    }
  }

  private update(deltaTime: number): void {
    if (this.player) {
      this.player.update(deltaTime)
    }

    if (this.botSpawner) {
      this.botSpawner.update(deltaTime)
    }

    this.uiManager.update()
    this.inputManager.resetMouseDelta()
  }

  private render(): void {
    if (this.scene) {
      this.scene.render()
    }
  }

  setGameState(newState: GameState): void {
    const oldState = this.gameState
    this.gameState = newState
    this.events.emit('gameStateChange', { oldState, newState })
    console.log(`Game state changed: ${oldState} -> ${newState}`)
  }

  getGameState(): GameState {
    return this.gameState
  }

  getScene(): Scene | null {
    return this.scene
  }

  getPhysicsWorld(): PhysicsWorld {
    return this.physicsWorld
  }

  getInputManager(): InputManager {
    return this.inputManager
  }

  getTime(): Time {
    return this.time
  }

  setPlayer(player: Player): void {
    this.player = player
    this.uiManager.connectPlayer(player)
    this.uiManager.showHUD()
  }

  getPlayer(): Player | null {
    return this.player
  }

  setMap(map: Map): void {
    this.currentMap = map
  }

  getMap(): Map | null {
    return this.currentMap
  }

  getUIManager(): UIManager {
    return this.uiManager
  }

  setBotSpawner(botSpawner: BotSpawner): void {
    this.botSpawner = botSpawner
  }

  getBotSpawner(): BotSpawner | null {
    return this.botSpawner
  }

  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.classList.add('hidden')
    }
  }

  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }

  dispose(): void {
    this.stop()
    if (this.scene) {
      this.scene.dispose()
    }
    this.physicsWorld.dispose()
  }
}
