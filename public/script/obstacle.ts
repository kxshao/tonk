import {RectHitbox, ShotHitbox, TankHitbox} from "./hitboxes.js";
import { Point, EPS } from "./utils.js";


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
	x1:number;
	y1:number;
	x2:number;
	y2:number;
	constructor(x1,y1,x2,y2){
		super(x1,y1);
		this.x1=x1;
		this.y1=y1;
		this.x2=x2;
		this.y2=y2;
	}
	collide(o: TankHitbox | ShotHitbox) {
		if(o instanceof TankHitbox){
			return o.x1 < this.x1 ||
				o.x2 > this.x2 ||
				o.y1 < this.y1 ||
				o.y2 > this.y2;
		}
		return false;
	}
	pushBack(tankCollision:TankHitbox){
		if(tankCollision.x1 < this.x1){
			tankCollision.x1 = this.x1 + EPS;
		}
		if(tankCollision.x2 > this.x2){
			tankCollision.x2 = this.x2 - EPS;
		}
		if(tankCollision.y1 < this.y1){
			tankCollision.y1 = this.y1 + EPS;
		}
		if(tankCollision.y2 > this.y2){
			tankCollision.y2 = this.y2 - EPS;
		}
	}
}

export class Wall extends Obstacle{
	hitbox:RectHitbox;
	constructor(x,y,r){
		super(x,y);
		this.hitbox = new RectHitbox(x-r,y-r,x+r,y+r);
	}
	get x1(){return this.hitbox.x1}
	get y1(){return this.hitbox.y1}
	get x2(){return this.hitbox.x2}
	get y2(){return this.hitbox.y2}

	collide(o:TankHitbox|ShotHitbox){
		if(o instanceof TankHitbox){
			return this.hitbox.collideRect(o);
		}
		return false;
	}
	pushBack(tankCollision:TankHitbox, fromPos:Point){
		let distX = Math.abs(fromPos.x - this.x);
		let distY = Math.abs(fromPos.y - this.y);

		if(distX > distY){
			if(fromPos.x < this.x){
				//left
				tankCollision.x2 = this.x1 - EPS;
			} else {
				//right
				tankCollision.x1 = this.x2 + EPS;
			}
		} else {
			if(fromPos.y < this.y){
				//up
				tankCollision.y2 = this.y1 - EPS;
			} else {
				//down
				tankCollision.y1 = this.y2 + EPS;
			}
		}
	}
	getNormal(p:Point){
		let distX1 = Math.abs(p.x - this.x1);
		let distX2 = Math.abs(p.x - this.x2);
		let distY1 = Math.abs(p.y - this.y1);
		let distY2 = Math.abs(p.y - this.y2);
		let closestDist = Math.min(distX1,distX2,distY1,distY2);
		if(closestDist === distX1){
			//left
			return Math.PI;
		}
		if(closestDist === distX2){
			//right
			return 0;
		}
		if(closestDist === distY1){
			//up
			//angles are CLOCKWISE for consistency with canvas operations
			return 3*Math.PI/2;
		}
		if(closestDist === distY2){
			//down
			return Math.PI/2;
		}
		throw new Error();
	}
}