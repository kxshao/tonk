const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TANK_WIDTH = 30;
const TANK_HEIGHT = 24;
const TANK_WIDTH_HALF = TANK_WIDTH/2;
const TANK_HEIGHT_HALF = TANK_HEIGHT/2;
const TANK_MARGIN = 4;
const TANK_INNER_WIDTH = TANK_WIDTH-2*TANK_MARGIN;
const TANK_INNER_HEIGHT = TANK_HEIGHT-2*TANK_MARGIN;
const TANK_CANNON_LENGTH = TANK_WIDTH;
const TANK_CANNON_THICC = 6;
const TANK_CANNON_THICC_HALF = 3;

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";

interface Window {
	G:Game;
	I:Input;
}

class Game{
	constructor(){
	}
}
window.G = new Game();
class Input{
	left:boolean;
	right:boolean;
	up:boolean;
	down:boolean;
	fire:boolean;
	mine:boolean;
	x:number;
	y:number;
	constructor(){
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.fire = false;
		this.mine = false;
		this.x = 0;
		this.y = 0;
	}
}
window.I = new Input();

let tanksLayer = document.createElement('canvas');
tanksLayer.width = CANVAS_WIDTH;
tanksLayer.height = CANVAS_HEIGHT;
let tanksCX = tanksLayer.getContext("2d") as CanvasRenderingContext2D;

let C:HTMLCanvasElement;

$(document).ready(function() {
	C = document.getElementById("canvas") as HTMLCanvasElement;
	C.width = CANVAS_WIDTH;
	C.height = CANVAS_HEIGHT;
	let X = C.getContext("2d") as CanvasRenderingContext2D;

	drawTankBase(tanksCX,40,70,"rgb(255,30,30)");
	drawTankCannon(tanksCX, 40,70,Math.PI / 2);
	X.drawImage(tanksLayer,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

	bindInputEvents(C);
});

function bindInputEvents(e:HTMLElement) {
	e.addEventListener("keydown",function(ev:KeyboardEvent) {
		switch(ev.key) {
			case KEY_UP:
				window.I.up = true;
				break;
			case KEY_DOWN:
				window.I.down = true;
				break;
			case KEY_LEFT:
				window.I.left = true;
				break;
			case KEY_RIGHT:
				window.I.right = true;
				break;
		}
	});
	window.addEventListener("keyup",function(ev:KeyboardEvent) {
		switch(ev.key) {
			case KEY_UP:
				window.I.up = false;
				break;
			case KEY_DOWN:
				window.I.down = false;
				break;
			case KEY_LEFT:
				window.I.left = false;
				break;
			case KEY_RIGHT:
				window.I.right = false;
				break;
		}
	});
	e.addEventListener("mousemove",function(ev:MouseEvent) {
		ev.preventDefault();
		let rect = C.getBoundingClientRect();
		window.I.x = (ev.clientX - rect.left) * C.width / rect.width;
		window.I.y = (ev.clientY - rect.top) * C.height / rect.height;
		$("#txt").text(""+window.I.x+","+window.I.y);
	});
	e.addEventListener("click",function(ev:MouseEvent) {
		ev.preventDefault();
		let rect = C.getBoundingClientRect();
		window.I.x = (ev.clientX - rect.left) * C.width / rect.width;
		window.I.y = (ev.clientY - rect.top) * C.height / rect.height;

		$("#txt").text("click "+window.I.x+","+window.I.y);
	});
	e.addEventListener("contextmenu",function(ev:MouseEvent) {
		ev.preventDefault();
	});
}

function moveTank() {
	//
}

function drawTankBase(X: CanvasRenderingContext2D, x, y, color) {
	x -= TANK_WIDTH_HALF;
	y -= TANK_HEIGHT_HALF;
	X.fillStyle = "rgb(120,100,50)";
	X.fillRect(x,y,TANK_WIDTH,TANK_HEIGHT);
	X.fillStyle = color;
	X.fillRect(x+TANK_MARGIN,y+TANK_MARGIN,TANK_INNER_WIDTH,TANK_INNER_HEIGHT);
}

function drawTankCannon(X: CanvasRenderingContext2D, x, y, angle) {
	resetAngle(X);
	rotate(X,x,y,angle);
	X.strokeStyle = "rgb(0,0,0)";
	X.strokeRect(x,y-TANK_CANNON_THICC_HALF,TANK_CANNON_LENGTH,TANK_CANNON_THICC);
}

function rotate(X: CanvasRenderingContext2D, x, y, angle) {
	X.translate(x,y);
	X.rotate(angle);
	X.translate(-x,-y);
}

function resetAngle(X: CanvasRenderingContext2D) {
	X.setTransform(1, 0, 0, 1, 0, 0);
}