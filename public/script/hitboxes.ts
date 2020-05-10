import {clip, Point, NormalizedVector, Vector, EPS} from "./utils.js";
import { Tank } from "./tank";

export abstract class Hitbox{
	collidePoint:(p:Point)=>boolean;
	collideSphere:(o:SphereHitbox)=>boolean;
	collideRect:(o:RectHitbox)=>boolean;
	collideCaps:(o:CapsuleHitbox)=>boolean;
	static collide(h1:Hitbox, h2:Hitbox){
		if(h2 instanceof PointHitbox){
			return h1.collidePoint(h2);
		} else if (h2 instanceof SphereHitbox){
			return h1.collideSphere(h2);
		} else if (h2 instanceof RectHitbox){
			return h1.collideRect(h2);
		} else if (h2 instanceof CapsuleHitbox){
			return h1.collideCaps(h2);
		}
		return false;
	}
}

export class NullHitbox implements Hitbox{
	constructor() {}
	collidePoint(p:Point){return false;}
	collideSphere(o:SphereHitbox){return false;}
	collideRect(o:RectHitbox){return false;}
	collideCaps(o:CapsuleHitbox){return false;}
}

export class PointHitbox implements Point, Hitbox{
	x:number;
	y:number;
	constructor(x,y){
		this.x=x;
		this.y=y;
	}
	collidePoint(p:Point){
		let dx = Math.abs(p.x-this.x);
		let dy = Math.abs(p.y-this.y);
		return dx < EPS && dy < EPS;
	}
	collideSphere(o:SphereHitbox){
		let dx = o.x-this.x;
		let dy = o.y-this.y;
		return Math.sqrt(dx*dx+dy*dy) < o.r;
	}
	collideRect(o:RectHitbox){
		return (o.x1 <= this.x && o.x2 >= this.x) &&
			(o.y1 <= this.y && o.y2 >= this.y)
	}
	collideCaps(o:CapsuleHitbox){
		return o.collidePoint(this);
	}
}

export class RectHitbox implements Hitbox{
	x1:number;
	y1:number;
	x2:number;
	y2:number;
	constructor(x1,y1,x2,y2){
		this.x1=Math.min(x1,x2);
		this.y1=Math.min(y1,y2);
		this.x2=Math.max(x1,x2);
		this.y2=Math.max(y1,y2);
	}
	collidePoint(p:Point){
		return (this.x1 <= p.x && this.x2 >= p.x) &&
			(this.y1 <= p.y && this.y2 >= p.y)
	}
	collideRect(o:RectHitbox){
		return (this.x1 <= o.x2 && this.x2 >= o.x1) &&
			(this.y1 <= o.y2 && this.y2 >= o.y1)
	}
	collideSphere(o:SphereHitbox){
		return o.collideRect(this);
	}
	collideCaps(o:CapsuleHitbox){
		return o.collideRect(this);
	}
	getClosestEdgePoint(p:Point){
		return {
			x: clip(p.x, this.x1, this.x2),
			y: clip(p.y, this.y1, this.y2)
		};
	}
}
export class SphereHitbox implements Hitbox{
	x:number;
	y:number;
	r:number;
	constructor(x,y,r){
		this.x=x;
		this.y=y;
		this.r=r;
	}
	collidePoint(p:Point){
		let dx = p.x-this.x;
		let dy = p.y-this.y;
		return Math.sqrt(dx*dx+dy*dy) < this.r;
	}
	collideSphere(o:SphereHitbox){
		let dx = o.x-this.x;
		let dy = o.y-this.y;
		return Math.sqrt(dx*dx+dy*dy) < (this.r + o.r);
	}
	collideRect(o:RectHitbox){
		let nearestPoint = o.getClosestEdgePoint(this)
		return this.collidePoint(nearestPoint);
	}
	collideCaps(o:CapsuleHitbox){
		return o.collideSphere(this);
	}
}

export class CapsuleHitbox implements Hitbox{
	p1:Point;
	p2:Point;
	r:number;
	direction:NormalizedVector;
	length:number;
	boundingBox:RectHitbox;
	constructor(p1:Point, p2:Point, r:number){
		this.p1 = p1;
		this.p2 = p2;
		this.r = r;
		this.direction = Vector.getDirection(p2, p1);
		this.length = this.direction.mag;
		this.boundingBox = new RectHitbox(p1.x, p1.y, p2.x, p2.y);
		this.boundingBox.x1 -= r;
		this.boundingBox.y1 -= r;
		this.boundingBox.x2 += r;
		this.boundingBox.y2 += r;
	}

	collidePoint(p:Point){
		let p1_to_p = Vector.subtract(p, this.p1);
		let d = Vector.dot(p1_to_p, this.direction);
		let clippedDist = clip(d, 0, this.length);
		let closestPoint = Vector.add(this.p1, Vector.scale(this.direction,clippedDist));
		return new SphereHitbox(closestPoint.x, closestPoint.y, this.r).collidePoint(p);
	}
	collideSphere(o:SphereHitbox){
		let p1_to_p = Vector.subtract(o, this.p1);
		let d = Vector.dot(p1_to_p, this.direction);
		let clippedDist = clip(d, 0, this.length);
		let closestPoint = Vector.add(this.p1, Vector.scale(this.direction,clippedDist));
		return new SphereHitbox(closestPoint.x, closestPoint.y, this.r).collideSphere(o);
	}
	collideRect(o:RectHitbox){
		//quick broad phase check
		if(!this.boundingBox.collideRect(o)){
			return false;
		}
		//check if either end of capsule collides with box edge
		if(new SphereHitbox(this.p1.x, this.p1.y, this.r).collideRect(o)){
			return true;
		}
		if(new SphereHitbox(this.p2.x, this.p2.y, this.r).collideRect(o)){
			return true;
		}
		//find which vertex is closest
		let midpoint = {
			x: (o.x1+o.x2)/2,
			y: (o.y1+o.y2)/2
		};
		let p1_to_p = Vector.subtract(midpoint, this.p1);
		let d = Vector.dot(p1_to_p, this.direction);
		let clippedDist = clip(d, 0, this.length);
		let closestPointToBoxCentre = Vector.add(this.p1, Vector.scale(this.direction,clippedDist));
		let dx1 = Math.abs(o.x1-closestPointToBoxCentre.x);
		let dx2 = Math.abs(o.x2-closestPointToBoxCentre.x);
		let dy1 = Math.abs(o.y1-closestPointToBoxCentre.y);
		let dy2 = Math.abs(o.y2-closestPointToBoxCentre.y);
		let closestVertex = {
			x: dx1 < dx2 ? o.x1 : o.x2,
			y: dy1 < dy2 ? o.y1 : o.y2
		};
		//check if capsule collides with box vertex
		p1_to_p = Vector.subtract(closestVertex, this.p1);
		d = Vector.dot(p1_to_p, this.direction);
		clippedDist = clip(d, 0, this.length);
		let closestPointToVertex = Vector.add(this.p1, Vector.scale(this.direction,clippedDist));
		if(new SphereHitbox(closestPointToVertex.x, closestPointToVertex.y, this.r).collidePoint(closestVertex)){
			return true;
		}
		return false;
	}
	collideCaps(o:CapsuleHitbox){
		return false;//todo
	}
}

export class TankHitbox implements Hitbox{
	static rx = 15;
	static ry = 12;

	x:number;
	y:number;
	collidePoint;
	collideRect;
	collideSphere;
	collideCaps;
	getClosestEdgePoint;
	constructor(x:number, y:number) {
		this.x=x;
		this.y=y;
		this.collidePoint = RectHitbox.prototype.collidePoint.bind(this);
		this.collideRect = RectHitbox.prototype.collideRect.bind(this);
		this.collideSphere = RectHitbox.prototype.collideSphere.bind(this);
		this.collideCaps = RectHitbox.prototype.collideCaps.bind(this);
		this.getClosestEdgePoint = RectHitbox.prototype.getClosestEdgePoint.bind(this);
	}
	get x1(){return this.x-TankHitbox.rx}
	get y1(){return this.y-TankHitbox.ry}
	get x2(){return this.x+TankHitbox.rx}
	get y2(){return this.y+TankHitbox.ry}
	set x1(v:number){this.x = v + TankHitbox.rx;}
	set y1(v:number){this.y = v + TankHitbox.ry;}
	set x2(v:number){this.x = v - TankHitbox.rx;}
	set y2(v:number){this.y = v - TankHitbox.ry;}
	

}
export class ShotHitbox {
	static r = 5;

	x:number;
	y:number;
	constructor(x,y) {
		this.x=x;
		this.y=y;
	}
	get x1(){return this.x-ShotHitbox.r}
	get y1(){return this.y-ShotHitbox.r}
	get x2(){return this.x+ShotHitbox.r}
	get y2(){return this.y+ShotHitbox.r}
	set x1(v:number){this.x = v + ShotHitbox.r;}
	set y1(v:number){this.y = v + ShotHitbox.r;}
	set x2(v:number){this.x = v - ShotHitbox.r;}
	set y2(v:number){this.y = v - ShotHitbox.r;}
	get sphere(){return new SphereHitbox(this.x, this.y, ShotHitbox.r)}

	collideRect(o:RectHitbox){
		return this.sphere.collideRect(o);
	}
}