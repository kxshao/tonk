export enum ShotSpeed{
	SLOW = 1,
	FAST = 2
}

export class ShotType {
	speed:number;
	maxBounces:number;
	constructor(s,b){
		this.speed = s;
		this.maxBounces = b;
	}
}

export class Shot {
	x:number;
	y:number;
	angle:number;
	speed:number;
	bounces:number;
	isRocket:boolean;

	constructor(type:ShotType,x,y,angle){
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.speed = type.speed;
		this.bounces = type.maxBounces;
		this.isRocket = this.speed === ShotSpeed.FAST;
	}
	move(){
		this.x += this.speed * Math.cos(this.angle);
		this.y += this.speed * Math.sin(this.angle);
		return this;
	}
}
