import { Player } from '@entities/player/Player'

export class HUD {
  private player: Player | null = null
  private container: HTMLElement | null = null

  private healthBar: HTMLElement | null = null
  private healthText: HTMLElement | null = null
  private ammoText: HTMLElement | null = null
  private weaponText: HTMLElement | null = null
  private crosshair: HTMLElement | null = null
  private dashCooldown: HTMLElement | null = null
  private dashCooldownFill: HTMLElement | null = null

  init(): void {
    this.container = document.getElementById('ui-overlay')
    if (!this.container) {
      console.error('UI overlay container not found')
      return
    }

    this.container.innerHTML = `
      <div id="hud" style="display: none; width: 100%; height: 100%; position: relative;">
        <!-- Health (Top Left) -->
        <div style="position: absolute; top: 20px; left: 20px; color: white; font-size: 18px;">
          <div style="margin-bottom: 10px; font-weight: bold;">Health</div>
          <div style="width: 200px; height: 30px; background: rgba(0,0,0,0.5); border: 2px solid #fff; border-radius: 4px; overflow: hidden;">
            <div id="health-bar" style="height: 100%; background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000); transition: width 0.2s;"></div>
          </div>
          <div id="health-text" style="margin-top: 5px;">100 / 100</div>
        </div>

        <!-- Ammo (Bottom Right) -->
        <div style="position: absolute; bottom: 80px; right: 20px; color: white; text-align: right;">
          <div id="weapon-name" style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">Pistol</div>
          <div id="ammo-text" style="font-size: 32px; font-weight: bold;">12 / 36</div>
        </div>

        <!-- Dash Ability (Bottom Center) -->
        <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); text-align: center;">
          <div style="color: white; margin-bottom: 5px; font-size: 14px;">DASH (One Use)</div>
          <div style="position: relative; width: 60px; height: 60px; margin: 0 auto;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(0,0,0,0.5); border: 3px solid rgba(255,255,255,0.3);"></div>
            <div id="dash-cooldown-fill" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #00ff00; transition: background 0.3s;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 18px; font-weight: bold;">E</div>
          </div>
        </div>

        <!-- Crosshair (Center) -->
        <div id="crosshair" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <div style="width: 2px; height: 12px; background: white; position: absolute; left: 50%; transform: translateX(-50%); top: -16px; box-shadow: 0 0 2px black;"></div>
          <div style="width: 2px; height: 12px; background: white; position: absolute; left: 50%; transform: translateX(-50%); bottom: -16px; box-shadow: 0 0 2px black;"></div>
          <div style="width: 12px; height: 2px; background: white; position: absolute; top: 50%; transform: translateY(-50%); left: -16px; box-shadow: 0 0 2px black;"></div>
          <div style="width: 12px; height: 2px; background: white; position: absolute; top: 50%; transform: translateY(-50%); right: -16px; box-shadow: 0 0 2px black;"></div>
          <div style="width: 4px; height: 4px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 2px black;"></div>
        </div>
      </div>
    `

    this.healthBar = document.getElementById('health-bar')
    this.healthText = document.getElementById('health-text')
    this.ammoText = document.getElementById('ammo-text')
    this.weaponText = document.getElementById('weapon-name')
    this.crosshair = document.getElementById('crosshair')
    this.dashCooldown = document.getElementById('dash-cooldown')
    this.dashCooldownFill = document.getElementById('dash-cooldown-fill')
  }

  setPlayer(player: Player): void {
    this.player = player
  }

  update(): void {
    if (!this.player) return

    this.updateHealth()
    this.updateAmmo()
    this.updateDashCooldown()
  }

  private updateHealth(): void {
    if (!this.player || !this.healthBar || !this.healthText) return

    const health = this.player.health
    const percentage = health.getHealthPercentage()

    this.healthBar.style.width = `${percentage}%`
    this.healthText.textContent = `${Math.ceil(health.currentHealth)} / ${health.maxHealth}`

    if (percentage > 60) {
      this.healthBar.style.background = 'linear-gradient(90deg, #00ff00, #88ff00)'
    } else if (percentage > 30) {
      this.healthBar.style.background = 'linear-gradient(90deg, #ffff00, #ffaa00)'
    } else {
      this.healthBar.style.background = 'linear-gradient(90deg, #ff4400, #ff0000)'
    }
  }

  private updateAmmo(): void {
    if (!this.player || !this.ammoText || !this.weaponText) return

    const weapon = this.player.weaponManager.getCurrentWeapon()
    this.weaponText.textContent = weapon.name.toUpperCase()
    this.ammoText.textContent = `${weapon.currentAmmo} / ${weapon.reserveAmmo}`

    if (weapon.currentAmmo === 0) {
      this.ammoText.style.color = '#ff0000'
    } else if (weapon.currentAmmo <= weapon.magazineSize * 0.3) {
      this.ammoText.style.color = '#ffaa00'
    } else {
      this.ammoText.style.color = '#ffffff'
    }
  }

  private updateDashCooldown(): void {
    if (!this.player || !this.dashCooldownFill) return

    const dashAbility = this.player.dashAbility

    if (dashAbility.canUse()) {
      this.dashCooldownFill.style.background = '#00ff00'
      this.dashCooldownFill.style.opacity = '1'
    } else {
      this.dashCooldownFill.style.background = '#333333'
      this.dashCooldownFill.style.opacity = '0.5'
    }
  }

  show(): void {
    const hud = document.getElementById('hud')
    if (hud) {
      hud.style.display = 'block'
    }
  }

  hide(): void {
    const hud = document.getElementById('hud')
    if (hud) {
      hud.style.display = 'none'
    }
  }

  dispose(): void {
    if (this.container) {
      this.container.innerHTML = ''
    }
  }
}
