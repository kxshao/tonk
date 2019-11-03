export class RectHitbox {
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
	collideRect(o:RectHitbox){
		return (this.x1 <= o.x2 && this.x2 >= o.x1) &&
			(this.y1 <= o.y2 && this.y2 >= o.y1)
	}
	getClosestEdgePoint(x,y){
		return {
			x: Math.max(this.x1, Math.min(x, this.x2)),
			y: Math.max(this.y1, Math.min(y, this.y2))
		};
	}
}

export class TankHitbox implements RectHitbox{
	static rx = 15;
	static ry = 12;

	x:number;
	y:number;
	constructor(x,y) {
		this.x=x;
		this.y=y;
	}
	get x1(){return this.x-TankHitbox.rx}
	get y1(){return this.y-TankHitbox.ry}
	get x2(){return this.x+TankHitbox.rx}
	get y2(){return this.y+TankHitbox.ry}
	collideRect = RectHitbox.prototype.collideRect.bind(this);
	getClosestEdgePoint = RectHitbox.prototype.getClosestEdgePoint.bind(this);
	nudgeX(v:number){
		this.x += v;
	}
	nudgeY(v:number){
		this.y += v;
	}
}
export class ShotHitbox {
	static r = 5;

	x:number;
	y:number;
	constructor(x,y) {
		this.x=x;
		this.y=y;
	}
}