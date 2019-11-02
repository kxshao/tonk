import {ShotHitbox, TankHitbox} from "./hitboxes.js";


export abstract class Obstacle {
	x:number;
	y:number;
	protected constructor(x,y){
		this.x=x;
		this.y=y;
	}
	abstract collide(o:TankHitbox|ShotHitbox):boolean;
}

export class Wall extends Obstacle{
	r:number;
	constructor(x,y,r){
		super(x,y);
		this.r = r;
	}
	collide(o:TankHitbox|ShotHitbox){
		let dx = Math.abs(this.x-o.x);
		let dy = Math.abs(this.y-o.y);
		return dx < this.r && dy < this.r;
	}
}