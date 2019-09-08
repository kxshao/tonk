enum MoveSpeed{
	STATIONARY = 0,
	SLOW = 1,
	MED = 2,
	FAST = 3
}
enum ShotSpeed{
	SLOW = 1,
	FAST = 2
}
enum Cooldown{
	SLOW = 2,
	FAST = 1
}

export class Tank {
	ammo:number;
	readonly maxAmmo:number;
	mines:number;
	readonly maxMines:number;
	speed:number;
	cooldown:number;
	shotType:Shot;
	x:number;
	y:number;
	protected constructor(ammo,mines,speed,cooldown,shotType) {
		this.maxAmmo = ammo;
		this.ammo = this.maxAmmo;
		this.speed = speed;
		this.maxMines = mines;
		this.mines = this.maxMines;
		this.cooldown = cooldown;
		this.shotType = shotType;
		this.x=0;
		this.y=0;
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
}

class Shot {
	speed:number;
	bounces:number;
	maxBounces:number;
	constructor(s,b){
		this.speed = s;
		this.maxBounces = b;
		this.bounces = this.maxBounces;
	}
}

export class Player extends Tank{
	constructor(){
		super(5,2,MoveSpeed.MED,Cooldown.FAST,new Shot(ShotSpeed.SLOW,1));
	}
}
class Brown extends Tank{
	constructor(){
		super(1,0,MoveSpeed.STATIONARY,Cooldown.SLOW,new Shot(ShotSpeed.SLOW,1));
	}
}
class Grey extends Tank{
	constructor(){
		super(1,0,MoveSpeed.SLOW,Cooldown.SLOW,new Shot(ShotSpeed.SLOW,1));
	}
}
class Teal extends Tank{
	constructor(){
		super(1,0,MoveSpeed.SLOW,Cooldown.SLOW,new Shot(ShotSpeed.FAST,0));
	}
}
class Yellow extends Tank{
	constructor(){
		super(1,4,MoveSpeed.MED,Cooldown.SLOW,new Shot(ShotSpeed.SLOW,1));
	}
}
class Red extends Tank{
	constructor(){
		super(3,0,MoveSpeed.SLOW,Cooldown.FAST,new Shot(ShotSpeed.SLOW,1));
	}
}
class Green extends Tank{
	constructor(){
		super(2,0,MoveSpeed.STATIONARY,Cooldown.FAST,new Shot(ShotSpeed.FAST,2));
	}
}
class Purple extends Tank{
	constructor(){
		super(5,2,MoveSpeed.MED,Cooldown.FAST,new Shot(ShotSpeed.SLOW,1));
	}
}
class White extends Tank{
	constructor(){
		super(5,2,MoveSpeed.SLOW,Cooldown.FAST,new Shot(ShotSpeed.SLOW,1));
	}
}
class Black extends Tank{
	constructor(){
		super(2,2,MoveSpeed.FAST,Cooldown.FAST,new Shot(ShotSpeed.FAST,0));
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