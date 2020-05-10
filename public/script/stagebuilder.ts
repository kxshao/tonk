import {RectHitbox, PointHitbox, SphereHitbox, CapsuleHitbox, Hitbox, NullHitbox} from "./hitboxes.js";
import { Point, Vector } from "./utils.js";


const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_ROWS = 10;
const GRID_COLS = 10;

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

let selectedObjType = "point";
let selectedAction = "create";

let tmpPoint:Point = null;
let customSize = 10;
let customColor = "rgb(255,0,0)";

let grid;

enum MapTileTypes{
    Floor,
    Wall,
    BreakableWall,
    Hole
}
abstract class MapTile{
    pos:Point;
    blockTanks:boolean;
    blockShots:boolean;
    breakable:boolean;
    collision:Hitbox;
    draw:(X:CanvasRenderingContext2D)=>void;
    protected constructor(){}
    static deserialize(serialized){
        let tile = serialized[0];
        let pos = {x:serialized[1], y:serialized[2]};
        switch (tile) {
            case MapTileTypes.Floor:
                return new Floor(pos);
            case MapTileTypes.Wall:
                return new Wall(pos);
            case MapTileTypes.BreakableWall:
                return new Floor(pos);
            case MapTileTypes.Hole:
                return new Floor(pos);
            default:
                throw new Error();
        }
    }
}
class Floor implements MapTile{
    pos;
    blockTanks;
    blockShots;
    breakable;
    collision;
    constructor(pos:Point) {
        this.pos = pos;
        this.blockTanks = false;
        this.blockShots = false;
        this.breakable = false;
        this.collision = new NullHitbox();
    }
    draw(X:CanvasRenderingContext2D){
        //todo
    }
    serialize(){
        return [MapTileTypes.Floor, this.pos.x, this.pos.y];
    }
}
class Wall implements MapTile{
    pos;
    blockTanks;
    blockShots;
    breakable;
    collision;
    constructor(pos:Point) {
        this.pos = pos;
        this.blockTanks = true;
        this.blockShots = true;
        this.breakable = false;
        this.collision = new NullHitbox();
    }
    draw(X:CanvasRenderingContext2D){
        //todo
    }
    serialize(){
        return [MapTileTypes.Wall, this.pos.x, this.pos.y];
    }
}
class BreakableWall implements MapTile{
    pos;
    blockTanks;
    blockShots;
    breakable;
    collision;
    constructor(pos:Point) {
        this.pos = pos;
        this.blockTanks = true;
        this.blockShots = true;
        this.breakable = true;
        this.collision = new NullHitbox();
    }
    draw(X:CanvasRenderingContext2D){
        //todo
    }
    serialize(){
        return [MapTileTypes.BreakableWall, this.pos.x, this.pos.y];
    }
}
class Hole implements MapTile{
    pos;
    blockTanks;
    blockShots;
    breakable;
    collision;
    constructor(pos:Point) {
        this.pos = pos;
        this.blockTanks = true;
        this.blockShots = false;
        this.breakable = false;
        this.collision = new NullHitbox();
    }
    draw(X:CanvasRenderingContext2D){
        //todo
    }
    serialize(){
        return [MapTileTypes.Hole, this.pos.x, this.pos.y];
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
    };
    document.getElementById('nextframe').onclick=function(){
        if(animationLoop){
            window.cancelAnimationFrame(animationLoop);
            animationLoop = 0;
        }
        main(false);
    };
    document.getElementById('clear').onclick=function(){
        X.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        L1CX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        L2CX.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    };
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

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let tile:MapTile = grid[i][j];
            tile.draw(X)
        }
    }

    X.drawImage(layer1,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    X.drawImage(layer2,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    drawGrid(X);
}

function init() {
    grid = [];
    for (let i = 0; i < GRID_ROWS; i++) {
        grid[i] = [];
        let yPos = i*CANVAS_HEIGHT/GRID_ROWS;
        for (let j = 0; j < GRID_COLS; j++) {
            let xPos = j*CANVAS_WIDTH/GRID_COLS;
            grid[i][j] = new Floor({x:xPos, y:yPos});
        }
    }
    drawGrid(X);
    //@ts-ignore
    window.grid = grid;
}

function getGridPos(x:number|number[],y?:number):Point {
    if (x instanceof Array){
        y = x[1];
        x = x[0];
    }
    return {
        x:Math.trunc(x/CANVAS_WIDTH*GRID_COLS),
        y:Math.trunc(y/CANVAS_HEIGHT*GRID_ROWS)
    };
}

function drawGrid(X:CanvasRenderingContext2D) {
    for (let i = 0; i < GRID_ROWS; i++) {
        drawLine(X,0,i*CANVAS_HEIGHT/GRID_ROWS,
            CANVAS_WIDTH,i*CANVAS_HEIGHT/GRID_ROWS,"black");
    }
    for (let i = 0; i < GRID_COLS; i++) {
        drawLine(X,i*CANVAS_WIDTH/GRID_COLS,0,
            i*CANVAS_WIDTH/GRID_COLS, CANVAS_HEIGHT,"black");
    }
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

        let gridPos = getGridPos(x,y);

        $("#mousecoord").text("grid position "+gridPos.x+","+gridPos.y);

        if(selectedAction === "create"){
            grid[gridPos.y][gridPos.x] = new Wall(gridPos);
            //todo
        }
    });
    e.addEventListener("contextmenu",function(ev:MouseEvent) {
        ev.preventDefault();
    });
}

function drawLine(X: CanvasRenderingContext2D, x1, y1, x2, y2, color){
    X.beginPath();
    X.moveTo(x1, y1);
    X.lineTo(x2, y2);
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