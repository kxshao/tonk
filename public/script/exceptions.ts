import {Tank} from "./tank.js";

export class GameEvent{}
export class TankKilledEvent extends GameEvent{
    killed:Tank;
    killer:Tank;
    constructor(killed:Tank, killer:Tank) {
        super();
        this.killed = killed;
        this.killer = killer;
    }
}
export class ShotExpiredEvent extends GameEvent{}
