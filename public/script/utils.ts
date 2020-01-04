export const EPS = 0.000001;

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
	scale(s:number){
		this.x *= s;
		this.y *= s;
		return this;
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
