import * as THREE from 'three'

export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t
  }

  static randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(this.randomRange(min, max + 1))
  }

  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI)
  }

  static distance2D(x1: number, z1: number, x2: number, z2: number): number {
    const dx = x2 - x1
    const dz = z2 - z1
    return Math.sqrt(dx * dx + dz * dz)
  }

  static distance3D(v1: THREE.Vector3, v2: THREE.Vector3): number {
    return v1.distanceTo(v2)
  }

  static getRandomPointInCircle(radius: number): { x: number; z: number } {
    const angle = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * radius
    return {
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r
    }
  }
}
