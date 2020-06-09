export const EPS = 0.000001;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRID_ROWS = 18;
export const GRID_COLS = 26;
export const GRID_WIDTH = CANVAS_WIDTH / GRID_COLS;
export const GRID_HEIGHT = CANVAS_HEIGHT / GRID_ROWS;
export const BLOCK_MARGIN = 3;

export interface Point{
	x:number;
	y:number;
}

export class Vector implements Point{
	x:number;
	y:number;
	constructor(x:number,y:number){
		this.x = x;
		this.y = y;
	}
	static scale(v:Vector, s:number){
		return new Vector(v.x * s, v.y * s);
	}
	static add(v1:Point, v2:Vector){
		return new Vector(v1.x + v2.x, v1.y + v2.y);
	}
	static subtract(toPoint:Point, fromPoint:Point){
		return new Vector(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y);
	}
	static getDirection(toPoint:Point, fromPoint:Point){
		return new NormalizedVector(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y);
	}
	static getNormal(v:Vector){
		//90 degrees clockwise
		return new Vector(-v.y, v.x);
	}
	static dot(v1:Vector, v2:Vector):number{
		return v1.x * v2.x + v1.y * v2.y;
	}
}
export class NormalizedVector extends Vector{
	x:number;
	y:number;
	mag:number;
	constructor(x:number,y:number){
		let mag = Math.sqrt(x*x+y*y);
		super(x/mag, y/mag);
		this.mag = mag;
	}
}

export function clip(val:number,lower:number,upper:number){
	if(lower>upper){
		let tmp = lower;
		lower = upper;
		upper = tmp;
	}
	return Math.max(lower, Math.min(val, upper))
}

export function euclidDist(p1:Point, p2:Point) {
	let dx = p1.x-p2.x;
	let dy = p1.y-p2.y;
	return Math.sqrt(dx*dx + dy*dy);
}

export function canvasPosToGrid(x: number, y: number) {
	return {
		i: Math.trunc(y / CANVAS_HEIGHT * GRID_ROWS),
		j: Math.trunc(x / CANVAS_WIDTH * GRID_COLS)
	};
}

export function gridPosToCanvas(i: number, j: number) {
	return {
		x: j * CANVAS_WIDTH / GRID_COLS,
		y: i * CANVAS_HEIGHT / GRID_ROWS
	};
}