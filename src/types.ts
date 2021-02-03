// TYPES 
type Color = {
  r: number,
  g: number,
  b: number,
  alpha: number,
}

type Vector2 = {
  x: number,
  y: number,
}

type Tank = {
  tankType: string,
  position: Vector2,
  direction: string,
  speed: number,
  bullet: Bullet,
  bulletSpeed: number,
  player: boolean,
  wasDestroyed: boolean,
  isSpawning: boolean,
  id: number,
}

type TankData = {
  width: number,
  height: number,
  defaultSpeed: number,
  bulletSpeed: number,
}

type Bullet = {
  vx: number,
  vy: number,
  width: number,
  height: number,
  position: Vector2, 
  collided: boolean,
}
