import {RectHitbox, ShotHitbox, TankHitbox} from "./hitboxes.js";


export abstract class Obstacle {
	x:number;
	y:number;
	protected constructor(x,y){
		this.x=x;
		this.y=y;
	}
	abstract collide(o:TankHitbox|ShotHitbox):boolean;
}

export class Edge extends Obstacle{
	x2:number;
	y2:number;
	constructor(x1,y1,x2,y2){
		super(x1,y1);
		this.x2=x2;
		this.y2=y2;
	}
	collide(o: TankHitbox | ShotHitbox) {
		if(o instanceof TankHitbox){
			return o.x1 < this.x ||
				o.x2 > this.x2 ||
				o.y1 < this.y ||
				o.y2 > this.y2;
		}
		return false;
	}
}

export class Wall extends Obstacle{
	hitbox:RectHitbox;
	constructor(x,y,r){
		super(x,y);
		this.hitbox = new RectHitbox(x-r,y-r,x+r,y+r);
	}
	collide(o:TankHitbox|ShotHitbox){
		if(o instanceof TankHitbox){
			return this.hitbox.collideRect(o);
		}
		return false;
	}
}