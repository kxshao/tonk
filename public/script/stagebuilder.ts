import {RectHitbox, PointHitbox, SphereHitbox, CapsuleHitbox, Hitbox, NullHitbox} from "./hitboxes.js";
import {Point, Vector} from "./utils.js";


const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_ROWS = 18;
const GRID_COLS = 26;
const GRID_WIDTH = CANVAS_WIDTH / GRID_COLS;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_ROWS;
const BLOCK_MARGIN = 3;

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

let C: HTMLCanvasElement;
let X: CanvasRenderingContext2D;
let animationLoop = 0;

let selectedObjType = "point";
let selectedAction = "create";

let tmpPoint: Point = null;
let customSize = 10;
let customColor = "rgb(255,0,0)";

let stage;

class Stage {
	grid:MapTile[][];

	constructor() {
		this.grid = [];
		for (let i = 0; i < GRID_ROWS; i++) {
			this.grid[i] = [];
			for (let j = 0; j < GRID_COLS; j++) {
				this.grid[i][j] = new Floor(i,j);
			}
		}
	}

	serialize(){
		let arr = [];
		for (let i = 0; i < this.grid.length; i++) {
			arr[i] = this.grid[i].map(maptile => maptile.serialize());
		}
		return arr;
	}

	static deserialize(serialized){
		let newStage = new Stage();
		for (let i = 0; i < newStage.grid.length; i++) {
			newStage.grid[i] = serialized[i].map(x => MapTile.deserialize(x));
		}
	}
}

enum MapTileTypes {
	Floor,
	Wall,
	BreakableWall,
	Hole
}

abstract class MapTile {
	gridPos:{i:number,j:number};
	pos: Point;
	blockTanks: boolean;
	blockShots: boolean;
	breakable: boolean;
	collision: Hitbox;
	draw: (X: CanvasRenderingContext2D) => void;

	protected constructor() {}

	abstract serialize(): any[];

	static deserialize(serialized) {
		let tile = serialized[0];
		let i = serialized[1];
		let j = serialized[2];
		switch (tile) {
			case MapTileTypes.Floor:
				return new Floor(i,j);
			case MapTileTypes.Wall:
				return new Wall(i,j);
			case MapTileTypes.BreakableWall:
				return new Floor(i,j);
			case MapTileTypes.Hole:
				return new Floor(i,j);
			default:
				throw new Error();
		}
	}
}

class Floor implements MapTile {
	gridPos;
	pos;
	blockTanks;
	blockShots;
	breakable;
	collision;

	constructor(i:number, j:number) {
		this.gridPos = {i: i, j: j};
		this.pos = gridPosToCanvas(i,j);
		this.blockTanks = false;
		this.blockShots = false;
		this.breakable = false;
		this.collision = new NullHitbox();
	}

	draw(X: CanvasRenderingContext2D) {
		X.fillStyle = "#D2AC64";
		X.fillRect(this.pos.x, this.pos.y, GRID_WIDTH, GRID_HEIGHT);
	}

	serialize() {
		return [MapTileTypes.Floor, this.gridPos.i, this.gridPos.j];
	}
}

class Wall implements MapTile {
	gridPos;
	pos;
	blockTanks;
	blockShots;
	breakable;
	collision;

	constructor(i:number, j:number) {
		this.gridPos = {i: i, j: j};
		this.pos = gridPosToCanvas(i,j);
		this.blockTanks = true;
		this.blockShots = true;
		this.breakable = false;
		this.collision = new NullHitbox();
	}

	draw(X: CanvasRenderingContext2D) {
		X.fillStyle = "#666";
		X.fillRect(this.pos.x, this.pos.y, GRID_WIDTH, GRID_HEIGHT);
		X.fillStyle = "#333";
		X.fillRect(this.pos.x + BLOCK_MARGIN, this.pos.y + BLOCK_MARGIN, GRID_WIDTH - 2 * BLOCK_MARGIN, GRID_HEIGHT - 2 * BLOCK_MARGIN);
	}

	serialize() {
		return [MapTileTypes.Wall, this.gridPos.i, this.gridPos.j];
	}
}

class BreakableWall implements MapTile {
	gridPos;
	pos;
	blockTanks;
	blockShots;
	breakable;
	collision;

	constructor(i:number, j:number) {
		this.gridPos = {i: i, j: j};
		this.pos = gridPosToCanvas(i,j);
		this.blockTanks = true;
		this.blockShots = true;
		this.breakable = true;
		this.collision = new NullHitbox();
	}

	draw(X: CanvasRenderingContext2D) {
		X.fillStyle = "#D2AC64";
		X.fillRect(this.pos.x, this.pos.y, GRID_WIDTH, GRID_HEIGHT);
		X.fillStyle = "#A35E3D";
		X.fillRect(this.pos.x + BLOCK_MARGIN, this.pos.y + BLOCK_MARGIN, GRID_WIDTH - 2 * BLOCK_MARGIN, GRID_HEIGHT - 2 * BLOCK_MARGIN);
	}

	serialize() {
		return [MapTileTypes.BreakableWall, this.gridPos.i, this.gridPos.j];
	}
}

class Hole implements MapTile {
	gridPos;
	pos;
	blockTanks;
	blockShots;
	breakable;
	collision;

	constructor(i:number, j:number) {
		this.gridPos = {i: i, j: j};
		this.pos = gridPosToCanvas(i,j);
		this.blockTanks = true;
		this.blockShots = false;
		this.breakable = false;
		this.collision = new NullHitbox();
	}

	draw(X: CanvasRenderingContext2D) {
		X.fillStyle = "#D2AC64";
		X.fillRect(this.pos.x, this.pos.y, GRID_WIDTH, GRID_HEIGHT);
		drawCircle(X, this.pos.x + GRID_WIDTH / 2, this.pos.y + GRID_HEIGHT / 2, GRID_HEIGHT / 2 - BLOCK_MARGIN, "#111");
	}

	serialize() {
		return [MapTileTypes.Hole, this.gridPos.i, this.gridPos.j];
	}
}

$(document).ready(function () {
	C = document.getElementById("canvas") as HTMLCanvasElement;
	C.width = CANVAS_WIDTH;
	C.height = CANVAS_HEIGHT;
	X = C.getContext("2d") as CanvasRenderingContext2D;

	document.getElementById('pause').onclick = function () {
		if (animationLoop) {
			window.cancelAnimationFrame(animationLoop);
			animationLoop = 0;
		} else {
			main();
		}
	};
	document.getElementById('nextframe').onclick = function () {
		if (animationLoop) {
			window.cancelAnimationFrame(animationLoop);
			animationLoop = 0;
		}
		main(false);
	};
	document.getElementById('clear').onclick = function () {
		X.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		L1CX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		L2CX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	};
	bindInputEvents(C);

	$("#choose_object .option").click(function (e) {
		//deselect others
		$("#choose_object .selected").removeClass("selected");
		$(e.target).addClass("selected");
		selectedObjType = e.target.innerText;
		//clear half-drawn things
		tmpPoint = null;
	});
	$("#choose_action .option").click(function (e) {
		$("#choose_action .selected").removeClass("selected");
		$(e.target).addClass("selected");
		selectedAction = e.target.innerText;
	});
	$("#size_input").change(function (e) {
		// @ts-ignore
		let v = parseFloat(e.target.value);
		if (v > 0) {
			customSize = v;
		} else {
			alert("size input error");
		}
	});
	$("#color_input").change(function (e) {
		// @ts-ignore
		customColor = e.target.value;
	});
	$("#size_input").val(10);
	$("#color_input").val("#FF0000");

	document.getElementById("import").onclick = function () {
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
				stage = Stage.deserialize(data);
				alert("successfully loaded stage data");
				container.remove();
				main(false);
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
	document.getElementById("export").onclick = function () {
		let container = $(`<div class="popup-container"></div>`);
		container.on("click", function () {
			container.remove();
		});
		let popup = $(`<div class="popup"><h1 class="popup-heading">Copy or save to file</h1></div>`);
		popup.on("click", function (ev) {
			ev.stopPropagation();
		});
		let content = $(`<div class="popup-content"></div>`);
		let inputBox = $(`<p class="codebox"></p>`);
		content.append(inputBox);
		inputBox.text(JSON.stringify(stage.serialize()));
		let buttons = $(`<div class="popup-submit"></div>`);
		let saveButton = $(`<button>save</button>`);
		buttons.append(saveButton);
		saveButton.on("click", function (ev) {
			ev.stopPropagation();
		});
		popup.append(content);
		popup.append(buttons);
		container.append(popup);
		$("body").append(container);
	};

	init();
});

function main(cont?) {
	if (cont !== false) {
		animationLoop = window.requestAnimationFrame(main);
	}

	X.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	L1CX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	L2CX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	for (let i = 0; i < stage.grid.length; i++) {
		for (let j = 0; j < stage.grid[i].length; j++) {
			let tile: MapTile = stage.grid[i][j];
			tile.draw(X)
		}
	}

	X.drawImage(layer1, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	X.drawImage(layer2, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	drawGrid(X);
}

function init() {
	stage = new Stage();
	drawGrid(X);
	//@ts-ignore
	window.stage = stage;
}

function canvasPosToGrid(x: number, y: number) {
	return {
		i: Math.trunc(y / CANVAS_HEIGHT * GRID_ROWS),
		j: Math.trunc(x / CANVAS_WIDTH * GRID_COLS)
	};
}

function gridPosToCanvas(i: number, j: number) {
	return {
		x: j * CANVAS_WIDTH / GRID_COLS,
		y: i * CANVAS_HEIGHT / GRID_ROWS
	};
}

function drawGrid(X: CanvasRenderingContext2D) {
	for (let i = 0; i < GRID_ROWS; i++) {
		drawLine(X, 0, i * CANVAS_HEIGHT / GRID_ROWS,
			CANVAS_WIDTH, i * CANVAS_HEIGHT / GRID_ROWS, "black");
	}
	for (let i = 0; i < GRID_COLS; i++) {
		drawLine(X, i * CANVAS_WIDTH / GRID_COLS, 0,
			i * CANVAS_WIDTH / GRID_COLS, CANVAS_HEIGHT, "black");
	}
}

function bindInputEvents(e: HTMLElement) {
	e.addEventListener("mousemove", function (ev: MouseEvent) {
		ev.preventDefault();
		let rect = C.getBoundingClientRect();
		let x = (ev.clientX - rect.left) * C.width / rect.width;
		let y = (ev.clientY - rect.top) * C.height / rect.height;
		$("#mousecoord").text("" + Math.trunc(x) + "," + Math.trunc(y));
	});
	e.addEventListener("click", function (ev: MouseEvent) {
		ev.preventDefault();
		let rect = C.getBoundingClientRect();
		let x = (ev.clientX - rect.left) * C.width / rect.width;
		let y = (ev.clientY - rect.top) * C.height / rect.height;

		let gridPos = canvasPosToGrid(x, y);
		let i = gridPos.i;
		let j = gridPos.j;

		$("#mousecoord").text("grid position " + i + "," + j);

		if (selectedAction === "create") {
			if (selectedObjType === "wall") {
				stage.grid[i][j] = new Wall(i,j);
			}
			if (selectedObjType === "breakable") {
				stage.grid[i][j] = new BreakableWall(i,j);
			}
			if (selectedObjType === "floor") {
				stage.grid[i][j] = new Floor(i,j);
			}
			if (selectedObjType === "hole") {
				stage.grid[i][j] = new Hole(i,j);
			}
		} else if (selectedAction === "select") {
			//todo
		}
	});
	e.addEventListener("contextmenu", function (ev: MouseEvent) {
		ev.preventDefault();
	});
}

function drawLine(X: CanvasRenderingContext2D, x1, y1, x2, y2, color) {
	X.beginPath();
	X.moveTo(x1, y1);
	X.lineTo(x2, y2);
	X.strokeStyle = color;
	X.stroke();
	resetAngle(X);
}

function drawCircle(X: CanvasRenderingContext2D, x, y, r, color) {
	X.beginPath();
	//move to right edge of circle to avoid extra path from centre to edge
	X.moveTo(x + r, y);
	X.arc(x, y, r, 0, 2 * Math.PI);
	X.fillStyle = color;
	X.fill();
	resetAngle(X);
}

function drawCapsule(X: CanvasRenderingContext2D, caps: CapsuleHitbox, color) {
	drawCircle(X, caps.p1.x, caps.p1.y, caps.r, color);
	drawCircle(X, caps.p2.x, caps.p2.y, caps.r, color);
	let normal = Vector.getNormal(caps.direction);
	let p1_1 = Vector.add(caps.p1, Vector.scale(normal, caps.r));
	let p1_2 = Vector.add(caps.p1, Vector.scale(normal, -caps.r));
	let p2_1 = Vector.add(caps.p2, Vector.scale(normal, caps.r));
	let p2_2 = Vector.add(caps.p2, Vector.scale(normal, -caps.r));
	drawLine(X, p1_1.x, p1_1.y, p2_1.x, p2_1.y, color);
	drawLine(X, p1_2.x, p1_2.y, p2_2.x, p2_2.y, color);
}

function rotate(X: CanvasRenderingContext2D, x, y, angle) {
	X.translate(x, y);
	X.rotate(angle);
	X.translate(-x, -y);
}

function getAngle(fromX, fromY, toX, toY) {
	let dy = toY - fromY;
	let dx = toX - fromX;
	return Math.atan2(dy, dx);
}

function resetAngle(X: CanvasRenderingContext2D) {
	X.setTransform(1, 0, 0, 1, 0, 0);
}