import {Shot, ShotSpeed, ShotType} from "./shot.js";
import {Hitbox, TankHitbox} from "./hitboxes.js";
import { Point } from "./utils.js";
import {Obstacle, Wall, Edge, Hole} from "./obstacle.js";
import {TankKilledEvent} from "./exceptions.js";

enum MoveSpeed{
	STATIONARY = 0,
	SLOW = 1,
	MED = 2,
	FAST = 3
}

enum Cooldown{
	SLOW = 2,
	FAST = 1
}

export enum TankColors {
	Player1 = "#4070FF",
	Player2 = "#FF3030",
	Brown = "#704020",
	Grey = "#708090",
	Teal = "#008080",
	Yellow = "#FFD700",
	Red = "#8B0000",
	Green = "#006400",
	Purple = "#800080",
	White = "#EEFFDD",
	Black = "#001122",
}

export class Tank {
	static WIDTH = 30;
	static HEIGHT = 24;
	static CANNON_LENGTH = 30;

	color:string;
	ammo:number;
	readonly maxAmmo:number;
	mines:number;
	readonly maxMines:number;
	speed:number;
	cooldown:number;
	shotType:ShotType;
	shots:Shot[];
	pos:TankHitbox;
	angle:number;
	nextPos:TankHitbox;

	protected constructor(color,ammo,mines,speed,cooldown,shotType) {
		this.color = color;
		this.maxAmmo = ammo;
		this.ammo = this.maxAmmo;
		this.speed = speed;
		this.maxMines = mines;
		this.mines = this.maxMines;
		this.cooldown = cooldown;
		this.shotType = shotType;
		this.shots = [];
		this.pos = new TankHitbox(0,0);
		this.angle = 0;
		this.nextPos = null;
	}
	get x(){return this.pos.x}
	get y(){return this.pos.y}
	set x(v:number){this.pos.x = v}
	set y(v:number){this.pos.y = v}

	setPos(x,y){
		this.x=x;
		this.y=y;
		return this;
	}

	tryMove(u,d,l,r){
		let x=this.x;
		let y=this.y;
		if(u && !d){
			y -= this.speed;
		} else if(!u && d){
			y += this.speed;
		}
		if(l && !r){
			x -= this.speed;
		} else if(!l && r){
			x += this.speed;
		}
		this.nextPos = new TankHitbox(x,y);
	}
	resolveCollision(collisionList:any[]){
		if(!this.nextPos) return;

		for(let o of collisionList){
			if((o instanceof Edge) || (o instanceof Hole)){
				if(o.collide(this.nextPos)){
					o.pushBack(this.nextPos);
				}
			} else if(o instanceof Wall){
				if(this.nextPos.collideRect(o)){
					o.pushBack(this.nextPos, this.pos);
				}
			}//todo tank-tank
		}

		this.pos = this.nextPos;
		this.nextPos = null;
	}
	move(u,d,l,r,collisionList){
		this.tryMove(u, d, l, r);
		this.resolveCollision(collisionList);
	}
	shoot(angle){
		let x = this.x + Tank.CANNON_LENGTH*Math.cos(angle);
		let y = this.y + Tank.CANNON_LENGTH*Math.sin(angle);
		this.shots.push(new Shot(this, this.shotType, x, y, angle));
	}
	deleteShot(shot:Shot){
		if(!this.shots.includes(shot)){
			throw new Error("attempted to delete a shot not owned by tank");
		}
		this.shots = this.shots.filter((e) => (e !== shot));
	}
	collide(o:Hitbox){
		return this.pos.collide(o);
	}
	killedBy(tank:Tank){
		console.log(this.color,"killed by",tank.color);
		throw new TankKilledEvent(this, tank);
	}
	serializeShotList(){
		return this.shots.map(shot => (
			{
				"x":shot.pos.x,
				"y":shot.pos.y,
				"a":shot.angle,
				"s":shot.speed,
				"b":shot.bounces,
				// "r":shot.isRocket
			}
		));
	}
	deserializeShotList(list:any[]){
		this.shots = list.map((e) =>
			//the use of new ShotType here is kind of bad semantics
			new Shot(this, new ShotType(e["s"],e["b"]), e["x"], e["y"], e["a"])
		)
	}
}



export class Player extends Tank{
	constructor(playerNum:number){
		let color = playerNum === 1 ? TankColors.Player1 : TankColors.Player2;
		super(color,5,2,MoveSpeed.MED,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Brown extends Tank{
	constructor(){
		super(TankColors.Brown,1,0,MoveSpeed.STATIONARY,Cooldown.SLOW,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Grey extends Tank{
	constructor(){
		super(TankColors.Grey,1,0,MoveSpeed.SLOW,Cooldown.SLOW,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Teal extends Tank{
	constructor(){
		super(TankColors.Teal,1,0,MoveSpeed.SLOW,Cooldown.SLOW,new ShotType(ShotSpeed.FAST,0));
	}
}
class Yellow extends Tank{
	constructor(){
		super(TankColors.Yellow,1,4,MoveSpeed.MED,Cooldown.SLOW,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Red extends Tank{
	constructor(){
		super(TankColors.Red,3,0,MoveSpeed.SLOW,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Green extends Tank{
	constructor(){
		super(TankColors.Green,2,0,MoveSpeed.STATIONARY,Cooldown.FAST,new ShotType(ShotSpeed.FAST,2));
	}
}
class Purple extends Tank{
	constructor(){
		super(TankColors.Purple,5,2,MoveSpeed.MED,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class White extends Tank{
	constructor(){
		super(TankColors.White,5,2,MoveSpeed.SLOW,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Black extends Tank{
	constructor(){
		super(TankColors.Black,2,2,MoveSpeed.FAST,Cooldown.FAST,new ShotType(ShotSpeed.FAST,0));
	}
}
// Player 	Mission 1 	Normal 	Controlled 	Normal 	Controlled 	1 	5 	2
// Brown 	Mission 1 	Stationary 	Passive 	Normal 	Slow 	1 	1 	-
// Grey 	Mission 2 	Slow 	Defensive 	Normal 	Slow 	1 	1 	-
// Teal 	Mission 5 	Slow 	Defensive 	Fast 	Slow 	- 	1 	-
// Yellow* 	Mission 8 	Normal 	Offensive 	Normal 	Slow 	1 	1 	4
// Red 	    Mission 10 	Slow 	Offensive 	Normal 	Fast 	1 	3 	-
// Green 	Mission 12 	Stationary 	Active 	Fast 	Fast 	2 	2 	-
// Purple 	Mission 15 	Normal 	Offensive 	Normal 	Fast 	1 	5 	2
// White* 	Mission 20 	Slow 	Offensive 	Normal 	Fast 	1 	5 	2
// Black 	Mission 50 	Fast 	Offensive 	Fast 	Fast 	- 	2 	2