export class Time {
  private static instance: Time
  private _deltaTime: number = 0
  private _elapsedTime: number = 0
  private _lastFrameTime: number = 0
  private _fixedDeltaTime: number = 1 / 60

  static getInstance(): Time {
    if (!Time.instance) {
      Time.instance = new Time()
    }
    return Time.instance
  }

  get deltaTime(): number {
    return this._deltaTime
  }

  get elapsedTime(): number {
    return this._elapsedTime
  }

  get fixedDeltaTime(): number {
    return this._fixedDeltaTime
  }

  update(currentTime: number): void {
    if (this._lastFrameTime === 0) {
      this._lastFrameTime = currentTime
    }

    this._deltaTime = (currentTime - this._lastFrameTime) / 1000
    this._deltaTime = Math.min(this._deltaTime, 0.1)

    this._elapsedTime = currentTime / 1000
    this._lastFrameTime = currentTime
  }

  reset(): void {
    this._deltaTime = 0
    this._elapsedTime = 0
    this._lastFrameTime = 0
  }
}
