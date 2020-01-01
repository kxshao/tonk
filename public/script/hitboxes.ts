import {clip, Point} from "./utils.js";
import { Tank } from "./tank";

interface Hitbox{
	collidePoint:(x,y)=>boolean;
	collideSphere:(o:SphereHitbox)=>boolean;
	collideRect:(o:RectHitbox)=>boolean;
}

export class RectHitbox implements Hitbox{
	x1:number;
	y1:number;
	x2:number;
	y2:number;
	constructor(x1,y1,x2,y2){
		this.x1=x1;
		this.y1=y1;
		this.x2=x2;
		this.y2=y2;
	}
	collidePoint(x,y){
		return (this.x1 <= x && this.x2 >= x) &&
			(this.y1 <= y && this.y2 >= y)
	}
	collideRect(o:RectHitbox){
		return (this.x1 <= o.x2 && this.x2 >= o.x1) &&
			(this.y1 <= o.y2 && this.y2 >= o.y1)
	}
	collideSphere(o:SphereHitbox){
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
	collidePoint(x,y){
		let dx = x-this.x;
		let dy = y-this.y;
		return Math.sqrt(dx*dx+dy*dy) < this.r;
	}
	collideSphere(o:SphereHitbox){
		let dx = o.x-this.x;
		let dy = o.y-this.y;
		return Math.sqrt(dx*dx+dy*dy) < (this.r + o.r);
	}
	collideRect(o:RectHitbox){
		let nearestPoint = o.getClosestEdgePoint(this)
		return this.collidePoint(nearestPoint.x, nearestPoint.y);
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
	getClosestEdgePoint;
	constructor(x:number, y:number) {
		this.x=x;
		this.y=y;
		this.collidePoint = RectHitbox.prototype.collidePoint.bind(this);
		this.collideRect = RectHitbox.prototype.collideRect.bind(this);
		this.collideSphere = RectHitbox.prototype.collideSphere.bind(this);
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
	sphere:SphereHitbox;
	constructor(x,y) {
		this.x=x;
		this.y=y;
		this.sphere = new SphereHitbox(this.x, this.y, ShotHitbox.r);
	}
	collideRect(o:RectHitbox){
		return this.sphere.collideRect(o);
	}
}