import * as Tanks from "./tank.js";
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TANK_WIDTH = 30;
const TANK_HEIGHT = 24;
const TANK_WIDTH_HALF = TANK_WIDTH / 2;
const TANK_HEIGHT_HALF = TANK_HEIGHT / 2;
const TANK_MARGIN = 4;
const TANK_INNER_WIDTH = TANK_WIDTH - 2 * TANK_MARGIN;
const TANK_INNER_HEIGHT = TANK_HEIGHT - 2 * TANK_MARGIN;
const TANK_CANNON_LENGTH = TANK_WIDTH;
const TANK_CANNON_THICC = 6;
const TANK_CANNON_THICC_HALF = 3;
const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
class Game {
    constructor() {
        this.p1 = new Tanks.Player();
    }
}
window.G = new Game();
let G = window.G;
class Input {
    constructor() {
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
let tanksCX = tanksLayer.getContext("2d");
let C;
let X;
$(document).ready(function () {
    C = document.getElementById("canvas");
    C.width = CANVAS_WIDTH;
    C.height = CANVAS_HEIGHT;
    X = C.getContext("2d");
    G.p1.setPos(0, 0);
    bindInputEvents(C);
    (function () {
        function main() {
            window.G.stopMain = window.requestAnimationFrame(main);
            resetAngle(X);
            X.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            tanksCX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            moveTanks();
            drawTankBase(tanksCX, G.p1.x, G.p1.y, "rgb(255,30,30)");
            drawTankCannon(tanksCX, G.p1.x, G.p1.y, Math.PI / 2);
            X.drawImage(tanksLayer, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        main(); // Start the cycle
    })();
});
function bindInputEvents(e) {
    window.addEventListener("keydown", function (ev) {
        switch (ev.key) {
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
    window.addEventListener("keyup", function (ev) {
        switch (ev.key) {
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
    e.addEventListener("mousemove", function (ev) {
        ev.preventDefault();
        let rect = C.getBoundingClientRect();
        window.I.x = (ev.clientX - rect.left) * C.width / rect.width;
        window.I.y = (ev.clientY - rect.top) * C.height / rect.height;
        $("#txt").text("" + window.I.x + "," + window.I.y);
    });
    e.addEventListener("click", function (ev) {
        ev.preventDefault();
        let rect = C.getBoundingClientRect();
        window.I.x = (ev.clientX - rect.left) * C.width / rect.width;
        window.I.y = (ev.clientY - rect.top) * C.height / rect.height;
        $("#txt").text("click " + window.I.x + "," + window.I.y);
    });
    e.addEventListener("contextmenu", function (ev) {
        ev.preventDefault();
    });
}
function moveTanks() {
    G.p1.move(I.up, I.down, I.left, I.right);
}
function drawTankBase(X, x, y, color) {
    x -= TANK_WIDTH_HALF;
    y -= TANK_HEIGHT_HALF;
    X.fillStyle = "rgb(120,100,50)";
    X.fillRect(x, y, TANK_WIDTH, TANK_HEIGHT);
    X.fillStyle = color;
    X.fillRect(x + TANK_MARGIN, y + TANK_MARGIN, TANK_INNER_WIDTH, TANK_INNER_HEIGHT);
}
function drawTankCannon(X, x, y, angle) {
    resetAngle(X);
    rotate(X, x, y, angle);
    X.strokeStyle = "rgb(0,0,0)";
    X.strokeRect(x, y - TANK_CANNON_THICC_HALF, TANK_CANNON_LENGTH, TANK_CANNON_THICC);
    resetAngle(X);
}
function rotate(X, x, y, angle) {
    X.translate(x, y);
    X.rotate(angle);
    X.translate(-x, -y);
}
function resetAngle(X) {
    X.setTransform(1, 0, 0, 1, 0, 0);
}
