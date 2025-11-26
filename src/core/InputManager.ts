import * as THREE from 'three'

export class InputManager {
  private static instance: InputManager
  private keys: Map<string, boolean> = new Map()
  private mouseButtons: Map<number, boolean> = new Map()
  private mouseDelta: THREE.Vector2 = new THREE.Vector2()
  private previousMouseX: number = 0
  private previousMouseY: number = 0
  private _isPointerLocked: boolean = false

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager()
    }
    return InputManager.instance
  }

  init(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('keyup', this.onKeyUp.bind(this))
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))

    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this))

    canvas.addEventListener('click', () => {
      if (!this._isPointerLocked) {
        canvas.requestPointerLock()
      }
    })
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys.set(event.code, true)
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.set(event.code, false)
  }

  private onMouseDown(event: MouseEvent): void {
    this.mouseButtons.set(event.button, true)
  }

  private onMouseUp(event: MouseEvent): void {
    this.mouseButtons.set(event.button, false)
  }

  private onMouseMove(event: MouseEvent): void {
    if (this._isPointerLocked) {
      this.mouseDelta.x = event.movementX
      this.mouseDelta.y = event.movementY
    }
  }

  private onPointerLockChange(): void {
    this._isPointerLocked = document.pointerLockElement !== null
  }

  isKeyDown(code: string): boolean {
    return this.keys.get(code) || false
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouseButtons.get(button) || false
  }

  getMouseDelta(): THREE.Vector2 {
    return this.mouseDelta.clone()
  }

  get isPointerLocked(): boolean {
    return this._isPointerLocked
  }

  lockPointer(canvas: HTMLCanvasElement): void {
    canvas.requestPointerLock()
  }

  unlockPointer(): void {
    document.exitPointerLock()
  }

  resetMouseDelta(): void {
    this.mouseDelta.set(0, 0)
  }

  reset(): void {
    this.keys.clear()
    this.mouseButtons.clear()
    this.resetMouseDelta()
  }
}
