import {RectHitbox, PointHitbox, SphereHitbox, CapsuleHitbox, Hitbox} from "./hitboxes.js";
import { Point, Vector } from "./utils.js";


const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";

let layer1 = document.createElement('canvas');
layer1.width = CANVAS_WIDTH;
layer1.height = CANVAS_HEIGHT;
let L1CX = layer1.getContext("2d") as CanvasRenderingContext2D;
let layer2 = document.createElement('canvas');
layer2.width = CANVAS_WIDTH;
layer2.height = CANVAS_HEIGHT;
let L2CX = layer2.getContext("2d") as CanvasRenderingContext2D;

let C:HTMLCanvasElement;
let X:CanvasRenderingContext2D;
let animationLoop = 0;
let objList:CollisionObject[] = [];

let selectedObjType = "point";
let selectedAction = "create";

let tmpPoint:Point = null;
let customSize = 10;
let customColor = "rgb(255,0,0)";

class CollisionObject{
	hitbox:Hitbox;
	baseColor;
	collisions:CollisionObject[];
	constructor(hitbox, color){
		this.hitbox = hitbox;
		this.baseColor = color;
		this.collisions = [];
	}
	getColor(){
		if(this.collisions.length){
			return "#FF00FF";
		}
		return this.baseColor;
	}
	collide(objects:CollisionObject[]){
		for(const o of objects){
			if(Hitbox.collide(this.hitbox,o.hitbox)){
				this.collisions.push(o);
				o.collisions.push(this);
			}
		}
	}
}

$(document).ready(function() {
	C = document.getElementById("canvas") as HTMLCanvasElement;
	C.width = CANVAS_WIDTH;
	C.height = CANVAS_HEIGHT;
	X = C.getContext("2d") as CanvasRenderingContext2D;

	document.getElementById('pause').onclick=function(){
		if(animationLoop){
			window.cancelAnimationFrame(animationLoop);
			animationLoop = 0;
		} else {
			main();
		}
	}
	document.getElementById('nextframe').onclick=function(){
		if(animationLoop){
			window.cancelAnimationFrame(animationLoop);
			animationLoop = 0;
		}
		main(false);
	}
	document.getElementById('clear').onclick=function(){
		X.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		L1CX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		L2CX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	}
	bindInputEvents(C);

	$("#choose_object .option").click(function(e){
		//deselect others
		$("#choose_object .selected").removeClass("selected");
		$(e.target).addClass("selected");
		selectedObjType = e.target.innerText;
		//clear half-drawn things
		tmpPoint = null;
	});
	$("#choose_action .option").click(function(e){
		$("#choose_action .selected").removeClass("selected");
		$(e.target).addClass("selected");
		selectedAction = e.target.innerText;
	});
	$("#size_input").change(function(e){
		// @ts-ignore
		let v = parseFloat(e.target.value);
		if(v > 0){
			customSize = v;
		} else {
			alert("size input error");
		}
	});
	$("#color_input").change(function(e){
		// @ts-ignore
		customColor = e.target.value;
	});
	$("#size_input").val(10);
	$("#color_input").val("#FF0000");
	init();
});

function main(cont?) {
	if(cont !== false){
		animationLoop = window.requestAnimationFrame( main );
	}

	X.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	L1CX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	L2CX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

	for (let i = 0; i < objList.length; i++) {
		let o = objList[i];
		o.collide(objList.slice(i+1));
		let h = o.hitbox;
		if(h instanceof PointHitbox){
			X.fillStyle = o.getColor();
			X.fillRect(h.x-1, h.y-1, 2, 2);
		} else if(h instanceof RectHitbox){
			X.fillStyle = o.getColor();
			X.fillRect(h.x1, h.y1, h.x2-h.x1, h.y2-h.y1);
		} else if (h instanceof SphereHitbox){
			drawCircle(X, h.x, h.y, h.r, o.getColor());
		} else if (h instanceof CapsuleHitbox){
			drawCapsule(X, h, o.getColor());
		}
	}
	
	X.drawImage(layer1,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	X.drawImage(layer2,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
}

function init() {
	;
}

function bindInputEvents(e:HTMLElement) {
	e.addEventListener("mousemove",function(ev:MouseEvent) {
		ev.preventDefault();
		let rect = C.getBoundingClientRect();
		let x = (ev.clientX - rect.left) * C.width / rect.width;
		let y = (ev.clientY - rect.top) * C.height / rect.height;
		$("#mousecoord").text(""+Math.trunc(x)+","+Math.trunc(y));
	});
	e.addEventListener("click",function(ev:MouseEvent) {
		ev.preventDefault();
		let rect = C.getBoundingClientRect();
		let x = (ev.clientX - rect.left) * C.width / rect.width;
		let y = (ev.clientY - rect.top) * C.height / rect.height;

		$("#mousecoord").text("click "+Math.trunc(x)+","+Math.trunc(y));

		if(selectedAction === "create"){
			X.fillStyle = customColor;
			switch(selectedObjType){
				case "point":
					objList.push(new CollisionObject(
						new PointHitbox(x,y),
						customColor
					));
					X.fillRect(x-1, y-1, 2, 2);
					break;
				case "sphere":
					objList.push(new CollisionObject(
						new SphereHitbox(x,y,customSize),
						customColor
					));
					drawCircle(X, x, y, customSize, customColor);
					break;
				case "box":
					if(tmpPoint){
						objList.push(new CollisionObject(
							new RectHitbox(tmpPoint.x, tmpPoint.y, x, y),
							customColor
						));
						let p = {
							x:Math.min(tmpPoint.x, x),
							y:Math.min(tmpPoint.y, y),
						};
						let dx = Math.abs(tmpPoint.x-x);
						let dy = Math.abs(tmpPoint.y-y);
						X.fillRect(p.x, p.y, dx, dy);
						tmpPoint = null;
					} else {
						tmpPoint = {
							x:x,
							y:y
						};
					}
					break;
				case "capsule":
					let r = customSize;
					if(tmpPoint){
						objList.push(new CollisionObject(
							new CapsuleHitbox(tmpPoint, {x:x,y:y}, customSize),
							customColor
						));
						drawCircle(X, x, y, r, customColor);
						let direction = Vector.getDirection({x:x,y:y}, tmpPoint);
						let normal = Vector.getNormal(direction);
						let p1_1 = Vector.add(tmpPoint, Vector.scale(normal,r));
						let p1_2 = Vector.add(tmpPoint, Vector.scale(normal,-r));
						let p2_1 = Vector.add(p1_1, Vector.scale(direction,direction.mag));
						let p2_2 = Vector.add(p1_2, Vector.scale(direction,direction.mag));
						drawLine(X, p1_1.x, p1_1.y, p2_1.x, p2_1.y, customColor);
						drawLine(X, p1_2.x, p1_2.y, p2_2.x, p2_2.y, customColor);
						tmpPoint = null;
					} else {
						tmpPoint = {
							x:x,
							y:y
						};
						drawCircle(X, x, y, r, customColor);
					}
					break;
			}
		}
	});
	e.addEventListener("contextmenu",function(ev:MouseEvent) {
		ev.preventDefault();
	});
}

function drawLine(X: CanvasRenderingContext2D, x1, y1, x2, y2, color){
	X.beginPath();
	X.moveTo(x1, y1);
	X.lineTo(x2, y2)
	X.strokeStyle = color;
	X.stroke();
	resetAngle(X);
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

function drawCapsule(X: CanvasRenderingContext2D, caps:CapsuleHitbox, color){
	drawCircle(X, caps.p1.x, caps.p1.y, caps.r, color);
	drawCircle(X, caps.p2.x, caps.p2.y, caps.r, color);
	let normal = Vector.getNormal(caps.direction);
	let p1_1 = Vector.add(caps.p1, Vector.scale(normal,caps.r));
	let p1_2 = Vector.add(caps.p1, Vector.scale(normal,-caps.r));
	let p2_1 = Vector.add(caps.p2, Vector.scale(normal,caps.r));
	let p2_2 = Vector.add(caps.p2, Vector.scale(normal,-caps.r));
	drawLine(X, p1_1.x, p1_1.y, p2_1.x, p2_1.y, color);
	drawLine(X, p1_2.x, p1_2.y, p2_2.x, p2_2.y, color);
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