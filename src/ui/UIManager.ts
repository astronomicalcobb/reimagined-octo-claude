import { HUD } from './HUD'
import { Player } from '@entities/player/Player'

export class UIManager {
  private hud: HUD

  constructor() {
    this.hud = new HUD()
  }

  init(): void {
    this.hud.init()
    console.log('UI Manager initialized')
  }

  connectPlayer(player: Player): void {
    this.hud.setPlayer(player)
  }

  update(): void {
    this.hud.update()
  }

  showHUD(): void {
    this.hud.show()
  }

  hideHUD(): void {
    this.hud.hide()
  }

  dispose(): void {
    this.hud.dispose()
  }
}
