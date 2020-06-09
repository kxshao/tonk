import {RectHitbox, ShotHitbox, SphereHitbox, TankHitbox} from "./hitboxes.js";
import {Point, EPS, euclidDist, Vector} from "./utils.js";


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
		return o.x1 < this.x1 ||
			o.x2 > this.x2 ||
			o.y1 < this.y1 ||
			o.y2 > this.y2;
	}
	pushBack(hitbox:TankHitbox | ShotHitbox){
		if(hitbox.x1 < this.x1){
			//possible bug in inspector
			//does not happen if hitbox is set to just one class instead of Union
			// noinspection JSConstantReassignment
			hitbox.x1 = this.x1 + EPS;
		}
		if(hitbox.x2 > this.x2){
			// noinspection JSConstantReassignment
			hitbox.x2 = this.x2 - EPS;
		}
		if(hitbox.y1 < this.y1){
			// noinspection JSConstantReassignment
			hitbox.y1 = this.y1 + EPS;
		}
		if(hitbox.y2 > this.y2){
			// noinspection JSConstantReassignment
			hitbox.y2 = this.y2 - EPS;
		}
	}
	getNormal(p:Point){
		let distX1 = Math.abs(p.x - this.x1);
		let distX2 = Math.abs(p.x - this.x2);
		let distY1 = Math.abs(p.y - this.y1);
		let distY2 = Math.abs(p.y - this.y2);
		let closestDist = Math.min(distX1,distX2,distY1,distY2);
		//edge reflects inward, unlike blocks which reflect outward
		if(closestDist === distX1){
			//hit left, go right
			return 0;
		}
		if(closestDist === distX2){
			//hit right, go left
			return Math.PI;
		}
		if(closestDist === distY1){
			//hit top, go down
			//angles are CLOCKWISE for consistency with canvas operations
			return Math.PI/2;
		}
		if(closestDist === distY2){
			//hit bottom, go up
			return 3*Math.PI/2;
		}
		throw new Error();
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
		if(o instanceof ShotHitbox){
			return this.hitbox.collideSphere(o.sphere);
		}
		return false;
	}
	pushBack(hitbox:TankHitbox|ShotHitbox, fromPos:Point){
		let distX = Math.abs(fromPos.x - this.x);
		let distY = Math.abs(fromPos.y - this.y);

		if(distX > distY){
			if(fromPos.x < this.x){
				//left
				// noinspection JSConstantReassignment
				hitbox.x2 = this.x1 - EPS;
			} else {
				//right
				// noinspection JSConstantReassignment
				hitbox.x1 = this.x2 + EPS;
			}
		} else {
			if(fromPos.y < this.y){
				//up
				// noinspection JSConstantReassignment
				hitbox.y2 = this.y1 - EPS;
			} else {
				//down
				// noinspection JSConstantReassignment
				hitbox.y1 = this.y2 + EPS;
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
export class Hole extends Obstacle{
	hitbox:SphereHitbox;
	r:number;
	constructor(x,y,r){
		super(x,y);
		this.r = r;
		this.hitbox = new SphereHitbox(x,y,r);
	}

	collide(o:TankHitbox){
		if(o instanceof TankHitbox){
			return this.hitbox.collideRect(o);
		}
		return false;
	}
	pushBack(hitbox:TankHitbox){
		let closestPoint = hitbox.getClosestEdgePoint(this);
		//do nothing if no collision
		if(euclidDist(closestPoint,this) > this.r){
			return;
		}
		let direction = Vector.getDirection(closestPoint, this);
		let tangentPoint = Vector.add(this, Vector.scale(direction, this.r + EPS));
		hitbox.x += tangentPoint.x - closestPoint.x;
		hitbox.y += tangentPoint.y - closestPoint.y;
	}
}