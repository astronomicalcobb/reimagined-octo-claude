import * as THREE from 'three'

export class Scene {
  public threeScene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.threeScene = new THREE.Scene()
    this.threeScene.background = new THREE.Color(0x87CEEB)
    this.threeScene.fog = new THREE.Fog(0x87CEEB, 50, 100)

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 1.7, 0)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = false

    this.setupLighting()

    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.threeScene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = false
    this.threeScene.add(directionalLight)
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  add(object: THREE.Object3D): void {
    this.threeScene.add(object)
  }

  remove(object: THREE.Object3D): void {
    this.threeScene.remove(object)
  }

  render(): void {
    this.renderer.render(this.threeScene, this.camera)
  }

  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z)
  }

  setCameraRotation(x: number, y: number, z: number): void {
    this.camera.rotation.set(x, y, z)
  }

  dispose(): void {
    window.removeEventListener('resize', this.onWindowResize.bind(this))
    this.renderer.dispose()
  }
}
