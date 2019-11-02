import {Shot, ShotSpeed, ShotType} from "./shot.js";
import {TANK_CANNON_LENGTH} from "./index.js";

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

export class Tank {
	color:string;
	ammo:number;
	readonly maxAmmo:number;
	mines:number;
	readonly maxMines:number;
	speed:number;
	cooldown:number;
	shotType:ShotType;
	shots:Shot[];
	x:number;
	y:number;
	protected constructor(color,ammo,mines,speed,cooldown,shotType) {
		this.color = color;
		this.maxAmmo = ammo;
		this.ammo = this.maxAmmo;
		this.speed = speed;
		this.maxMines = mines;
		this.mines = this.maxMines;
		this.cooldown = cooldown;
		this.shotType = shotType;
		this.x=0;
		this.y=0;
		this.shots = [];
	}
	setPos(x,y){
		this.x=x;
		this.y=y;
		return this;
	}
	move(u,d,l,r){
		if(u && !d){
			this.y -= this.speed;
		} else if(!u && d){
			this.y += this.speed;
		}
		if(l && !r){
			this.x -= this.speed;
		} else if(!l && r){
			this.x += this.speed;
		}
		return this;
	}
	shoot(angle){
		let x = this.x + TANK_CANNON_LENGTH*Math.cos(angle);
		let y = this.y + TANK_CANNON_LENGTH*Math.sin(angle);
		this.shots.push(new Shot(this.shotType,x,y,angle));
	}
}



export class Player extends Tank{
	constructor(playerNum:number){
		let color = playerNum === 1 ? "#4070FF" : "#FF3030";
		super(color,5,2,MoveSpeed.MED,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Brown extends Tank{
	constructor(){
		super("#704020",1,0,MoveSpeed.STATIONARY,Cooldown.SLOW,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Grey extends Tank{
	constructor(){
		super("#708090",1,0,MoveSpeed.SLOW,Cooldown.SLOW,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Teal extends Tank{
	constructor(){
		super("#008080",1,0,MoveSpeed.SLOW,Cooldown.SLOW,new ShotType(ShotSpeed.FAST,0));
	}
}
class Yellow extends Tank{
	constructor(){
		super("#FFD700",1,4,MoveSpeed.MED,Cooldown.SLOW,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Red extends Tank{
	constructor(){
		super("#8B0000",3,0,MoveSpeed.SLOW,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Green extends Tank{
	constructor(){
		super("#006400",2,0,MoveSpeed.STATIONARY,Cooldown.FAST,new ShotType(ShotSpeed.FAST,2));
	}
}
class Purple extends Tank{
	constructor(){
		super("#800080",5,2,MoveSpeed.MED,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class White extends Tank{
	constructor(){
		super("#EEFFDD",5,2,MoveSpeed.SLOW,Cooldown.FAST,new ShotType(ShotSpeed.SLOW,1));
	}
}
class Black extends Tank{
	constructor(){
		super("#001122",2,2,MoveSpeed.FAST,Cooldown.FAST,new ShotType(ShotSpeed.FAST,0));
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