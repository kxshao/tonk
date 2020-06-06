import { ShotHitbox } from "./hitboxes.js";
import { Point } from "./utils.js";
import { Edge, Wall } from "./obstacle.js";
import {ShotExpiredEvent} from "./exceptions.js";
import {Tank} from "./tank.js";

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
	owner:Tank;
	angle:number;
	speed:number;
	bounces:number;
	isRocket:boolean;
	pos:ShotHitbox;
	nextPos:ShotHitbox;

	constructor(owner:Tank,type:ShotType,x,y,angle){
		this.owner = owner;
		this.pos = new ShotHitbox(x,y);
		this.angle = angle;
		this.speed = type.speed;
		this.bounces = type.maxBounces;
		this.isRocket = this.speed === ShotSpeed.FAST;
	}
	get x(){return this.pos.x}
	get y(){return this.pos.y}
	set x(v:number){this.pos.x = v}
	set y(v:number){this.pos.y = v}

	tryMove(){
		let nextX = this.x + this.speed * Math.cos(this.angle);
		let nextY = this.y + this.speed * Math.sin(this.angle);
		this.nextPos = new ShotHitbox(nextX,nextY);
	}
	resolveCollision(collisionList:any[]){
		if(!this.nextPos) return;

		for(let o of collisionList){
			if(o instanceof Edge){
				if(o.collide(this.nextPos)){
					try{
						this.reflect(o.getNormal(this.pos));
						o.pushBack(this.nextPos);
					} catch (e) {
						if(e instanceof ShotExpiredEvent){
							this.destroy();
						}
					}
				}
			} else if(o instanceof Wall){
				if(o.collide(this.nextPos)){
					try{
						this.reflect(o.getNormal(this.pos));
						o.pushBack(this.nextPos, this.pos);
					} catch (e) {
						if(e instanceof ShotExpiredEvent){
							this.destroy();
						}
					}
				}
			} else if(o instanceof Tank){
				if(o.collide(this.nextPos)){
					try{
						this.kill(o);
					}finally {
						this.destroy();
					}
				}
			}
		}

		this.pos = this.nextPos;
		this.nextPos = null;
	}
	move(collisionList:any[]){
		this.tryMove();
		this.resolveCollision(collisionList);
	}
	reflect(normal:number){
		if(this.angle > Math.PI){
			this.angle -= Math.PI;
		} else {
			this.angle += Math.PI;
		}
		this.angle -= 2*(this.angle - normal);
		this.bounces--;
		if (this.bounces < 0) throw new ShotExpiredEvent();
	}
	kill(tank:Tank){
		tank.killedBy(this.owner);
	}
	destroy(){
		this.owner.deleteShot(this);
	}
}
