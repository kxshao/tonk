import * as Tanks from "./tank.js";
import Socket = SocketIOClient.Socket;
import {Edge, Hole, Wall} from "./obstacle.js";
import {TankKilledEvent} from "./exceptions.js";
import * as SB from "./stagebuilder.js";
import {BLOCK_MARGIN, CANVAS_HEIGHT, CANVAS_WIDTH, GRID_HEIGHT, GRID_WIDTH, gridPosToCanvas} from "./utils.js";
import {Floor} from "./stagebuilder.js";


const TANK_WIDTH = Tanks.Tank.WIDTH;
const TANK_HEIGHT = Tanks.Tank.HEIGHT;
const TANK_WIDTH_HALF = TANK_WIDTH/2;
const TANK_HEIGHT_HALF = TANK_HEIGHT/2;
const TANK_MARGIN = 4;
const TANK_INNER_WIDTH = TANK_WIDTH-2*TANK_MARGIN;
const TANK_INNER_HEIGHT = TANK_HEIGHT-2*TANK_MARGIN;
const TANK_TURRET_LENGTH = TANK_INNER_HEIGHT + TANK_MARGIN/2;
const TANK_TURRET_LENGTH_HALF = TANK_TURRET_LENGTH/2;
const TANK_CANNON_LENGTH = Tanks.Tank.CANNON_LENGTH;
const TANK_CANNON_THICC = 6;
const TANK_CANNON_THICC_HALF = TANK_CANNON_THICC/2;
const SHOT_LENGTH = 20;
const SHOT_LENGTH_HALF = SHOT_LENGTH/2;
const SHOT_THICC = 10;
const SHOT_THICC_HALF = SHOT_THICC/2;

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";

declare global{
	interface Window {
		G:Game;
		I:Input;
	}
}

class Game{
	stopMain;
	sock:Socket;
	p1:Tanks.Tank;
	p2:Tanks.Tank;
	id:string;
	stage;
	collisionList;
	constructor(stageData:SB.Stage){
		this.stage = stageData;
		this.p1 = new Tanks.Player(1);
		this.p2 = new Tanks.Player(2);
		let p1pos = gridPosToCanvas(stageData.p1[0],stageData.p1[1]);
		let p2pos = gridPosToCanvas(stageData.p2[0],stageData.p2[1]);
		this.p1.setPos(p1pos.x + GRID_WIDTH/2, p1pos.y + GRID_HEIGHT/2);
		this.p2.setPos(p2pos.x + GRID_WIDTH/2, p2pos.y + GRID_HEIGHT/2);
		this.collisionList = [];
		for (let i = 0; i < stageData.grid.length; i++){
			for (let j = 0; j < stageData.grid[0].length; j++){
				let pos = gridPosToCanvas(i,j);
				pos.x += GRID_WIDTH/2;
				pos.y += GRID_HEIGHT/2;
				if(stageData.grid[i][j] instanceof SB.Wall){
					this.collisionList.push(new Wall(pos.x, pos.y, GRID_HEIGHT / 2 - BLOCK_MARGIN));
				} else if(stageData.grid[i][j] instanceof SB.Hole){
					this.collisionList.push(new Hole(pos.x, pos.y, GRID_HEIGHT / 2 - BLOCK_MARGIN));
				} else if(stageData.grid[i][j] instanceof SB.BreakableWall){
					this.collisionList.push(new Wall(pos.x, pos.y, GRID_HEIGHT / 2 - BLOCK_MARGIN));
				}
			}
		}
	}
}
let G:Game;
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
let I = window.I;

let tanksLayer = document.createElement('canvas');
tanksLayer.width = CANVAS_WIDTH;
tanksLayer.height = CANVAS_HEIGHT;
let tanksCX = tanksLayer.getContext("2d") as CanvasRenderingContext2D;
let shotsLayer = document.createElement('canvas');
shotsLayer.width = CANVAS_WIDTH;
shotsLayer.height = CANVAS_HEIGHT;
let shotsCX = shotsLayer.getContext("2d") as CanvasRenderingContext2D;
let hitboxLayer = document.createElement('canvas');
hitboxLayer.width = CANVAS_WIDTH;
hitboxLayer.height = CANVAS_HEIGHT;
let hitboxCX = hitboxLayer.getContext("2d") as CanvasRenderingContext2D;

let C:HTMLCanvasElement;
let X:CanvasRenderingContext2D;

let edge = new Edge(0,0,800,600);

let stageData;

$(document).ready(function() {
	C = document.getElementById("canvas") as HTMLCanvasElement;
	C.width = CANVAS_WIDTH;
	C.height = CANVAS_HEIGHT;
	X = C.getContext("2d") as CanvasRenderingContext2D;

	document.getElementById("upload_stage").onclick = function(){
		let container = $(`<div class="popup-container"></div>`);
		container.on("click", function () {
			container.remove();
		});
		let popup = $(`<div class="popup"><h1 class="popup-heading">Paste or upload JSON data here</h1></div>`);
		popup.on("click", function (ev) {
			ev.stopPropagation();
		});
		let content = $(`<div class="popup-content"></div>`);
		let inputBox = $(`<textarea class="codebox" maxlength="10000"></textarea>`);
		content.append(inputBox);
		let buttons = $(`<div class="popup-submit"></div>`);
		let uploadFile = $(`<input id="filein" type="file">`);
		let submitButton = $(`<button>submit</button>`);
		buttons.append(uploadFile);
		buttons.append(submitButton);
		uploadFile.on("change", function (ev) {
			let file = (ev.target as HTMLInputElement).files[0];
			(async function(file) {
				try{
					// @ts-ignore
					// may not be supported in all browsers
					let text = await file.text();
					console.log("length of input read:",text.length);
					if(text.length > 10000){
						// noinspection ExceptionCaughtLocallyJS
						throw new Error("input file too long");
					}
					inputBox.val(text);
				}catch (e) {
					console.error(e);
				}finally {
					console.log("file load process done");
				}
			})(file);
		});
		submitButton.on("click", function (ev) {
			try{
				let text = "" + inputBox.val();
				let data = JSON.parse(text);
				stageData = SB.Stage.deserialize(data);
				alert("successfully loaded stage data");
				container.remove();
			} catch (e) {
				alert("failed to understand input");
				console.error(e);
			}
		});
		popup.append(content);
		popup.append(buttons);
		container.append(popup);
		$("body").append(container);
	};
	document.getElementById("connectBtn").onclick=function(){
		G = new Game(stageData);
		window.G = G;

		G.sock = io.connect('/game',{
			query:{
				username: $("#connectId").text()
			}
		});
		G.sock.on('connect', function(sock:Socket){
			$("#connectStatus").text("connected");
			console.log("socket",sock);
			G.id = String($("#connectId").val());
			init();
			bindInputEvents(C);
			G.sock.on('receivePos', function (data) {
				data = JSON.parse(data);
				if(G.id !== data.id){
					G.p2.setPos(data.x, data.y);
					G.p2.angle = data.cannon_dir;
				}
			});
			G.sock.on('receiveShots', function (data) {
				data = JSON.parse(data);
				if(G.id !== data.id){
					G.p2.deserializeShotList(data["shots"]);
				}
			});
		});
		$("#connectBtn").remove();
	};



});

function init() {

	function main() {
		G.stopMain = window.requestAnimationFrame( main );

		resetAngle(X);
		X.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		tanksCX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		shotsCX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		hitboxCX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

		X.fillStyle = "#D2AC64";
		X.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		for (let i = 0; i < G.stage.grid.length; i++) {
			for (let j = 0; j < G.stage.grid[i].length; j++) {
				let tile = G.stage.grid[i][j];
				tile.draw(X);
			}
		}

		moveTanks();
		drawTankBase(tanksCX,G.p1.x,G.p1.y,G.p1.color);
		G.p1.angle = getAngle(G.p1.x,G.p1.y,I.x,I.y);
		drawTankCannon(tanksCX, G.p1.x,G.p1.y,G.p1.angle,G.p1.color);

		drawTankBase(tanksCX,G.p2.x,G.p2.y,G.p2.color);
		drawTankCannon(tanksCX, G.p2.x,G.p2.y,G.p2.angle,G.p2.color);

		for(let shot of G.p1.shots){
			drawShot(shotsCX,shot.x,shot.y,shot.angle,shot.isRocket);
			//shot hitbox
			drawCircle(hitboxCX, shot.x, shot.y, 5, "rgb(230,200,0)");
		}
		for(let shot of G.p2.shots){
			drawShot(shotsCX,shot.x,shot.y,shot.angle,shot.isRocket);
			//shot hitbox
			drawCircle(hitboxCX, shot.x, shot.y, 5, "rgb(230,30,0)");
		}

		X.drawImage(tanksLayer,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		X.drawImage(shotsLayer,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		X.drawImage(hitboxLayer,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

		G.sock.emit('sendPos', JSON.stringify({
			"id": G.id,
			"x": G.p1.x,
			"y": G.p1.y,
			"cannon_dir":G.p1.angle
		}));
		G.sock.emit('sendShots', JSON.stringify({
			"id": G.id,
			"shots": G.p1.serializeShotList()
		}));
	}
	main(); // Start the cycle
}

function bindInputEvents(e:HTMLElement) {
	window.addEventListener("keydown",function(ev:KeyboardEvent) {
		switch(ev.key) {
			case KEY_UP:
				ev.preventDefault();
				window.I.up = true;
				break;
			case KEY_DOWN:
				ev.preventDefault();
				window.I.down = true;
				break;
			case KEY_LEFT:
				ev.preventDefault();
				window.I.left = true;
				break;
			case KEY_RIGHT:
				ev.preventDefault();
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

		G.p1.shoot(getAngle(G.p1.x,G.p1.y,I.x,I.y));
	});
	e.addEventListener("contextmenu",function(ev:MouseEvent) {
		ev.preventDefault();
	});
}

function moveTanks() {
	let collisionList = [edge, G.p1, G.p2, ...G.collisionList];
	G.p1.move(I.up,I.down,I.left,I.right, collisionList);
	for(let shot of [...G.p1.shots, ...G.p2.shots]){
		try {
			shot.move(collisionList);
		}catch (e) {
			if (e instanceof TankKilledEvent){
				//todo - kill animation or something here
				X.fillStyle = e.killer.color;
				X.fillText("+1", e.killer.x, e.killer.y, 10);
				X.fillText("killed", e.killed.x, e.killed.y, 10);
			}
		}
	}
}

function drawCircle(X: CanvasRenderingContext2D, x, y, r, color){
	X.beginPath();
	//move to right edge of circle to avoid extra path from centre to edge
	X.moveTo(x+r, y);
	X.arc(x, y, r, 0, 2*Math.PI);
	X.fillStyle = color;
	X.fill();
	resetAngle(X);
}

export function drawTankBase(X: CanvasRenderingContext2D, x, y, color) {
	x -= TANK_WIDTH_HALF;
	y -= TANK_HEIGHT_HALF;
	X.fillStyle = "rgb(120,100,50)";
	X.fillRect(x,y,TANK_WIDTH,TANK_HEIGHT);
	X.fillStyle = color;
	X.fillRect(x+TANK_MARGIN,y+TANK_MARGIN,TANK_INNER_WIDTH,TANK_INNER_HEIGHT);
	X.fillStyle = "rgb(220,200,250)";
	X.fillRect(x,y,3,3);
}

export function drawTankCannon(X: CanvasRenderingContext2D, x, y, angle, color) {
	rotate(X,x,y,angle);
	X.strokeStyle = "rgb(30,30,30)";
	X.fillStyle = color;
	X.fillRect(x-TANK_TURRET_LENGTH_HALF,y-TANK_TURRET_LENGTH_HALF,TANK_TURRET_LENGTH,TANK_TURRET_LENGTH);
	X.strokeRect(x-TANK_TURRET_LENGTH_HALF,y-TANK_TURRET_LENGTH_HALF,TANK_TURRET_LENGTH,TANK_TURRET_LENGTH);
	X.fillRect(x,y-TANK_CANNON_THICC_HALF,TANK_CANNON_LENGTH,TANK_CANNON_THICC);
	X.strokeRect(x,y-TANK_CANNON_THICC_HALF,TANK_CANNON_LENGTH,TANK_CANNON_THICC);

	resetAngle(X);
}

function drawShot(X: CanvasRenderingContext2D, x, y, angle, isRocket) {
	rotate(X,x,y,angle);
	X.beginPath();
	x-=SHOT_LENGTH_HALF;
	y-=SHOT_THICC_HALF;
	X.moveTo(x,y);
	X.lineTo(x+SHOT_LENGTH-SHOT_THICC_HALF,y);
	X.arc(x+SHOT_LENGTH-SHOT_THICC_HALF,y+SHOT_THICC_HALF,SHOT_THICC_HALF,-Math.PI/2,Math.PI/2);
	X.lineTo(x,y+SHOT_THICC);
	X.lineTo(x,y);

	X.fillStyle = "rgb(220,220,220)";
	X.fill();
	X.strokeStyle = "rgb(69,69,69)";
	X.stroke();

	if(isRocket){
		//todo
	}

	resetAngle(X);
}

function rotate(X: CanvasRenderingContext2D, x, y, angle) {
	X.translate(x,y);
	X.rotate(angle);
	X.translate(-x,-y);
}

function getAngle(fromX, fromY, toX, toY) {
	let dy = toY-fromY;
	let dx = toX-fromX;
	return Math.atan2(dy,dx);
}

function resetAngle(X: CanvasRenderingContext2D) {
	X.setTransform(1, 0, 0, 1, 0, 0);
}