import p5, { Vector } from 'p5';
import {floor, random} from "lodash";

export class Particle {
    private acc: Vector;
    private vel: Vector;
    private pos: Vector;
    private prePos: Vector;
    private strokeSize: number;

    constructor() {
        this.pos = new Vector(random(window.innerWidth)/2, random(window.innerHeight)/2);
        this.vel = new Vector(0, 0);
        this.prePos = this.pos.copy();
        this.acc = new Vector(0, 0);
        this.strokeSize = random(6);
    }

    FollowField(field: Vector[], scale: number, cols: number) {
        const x = floor(this.pos.x / scale);
        const y = floor(this.pos.y / scale);
        const index = x + y * cols;
        const force = field[index];
        this.ApplyForce(force);
    }

    Update() {
        this.vel.add(this.acc);
        this.vel.limit(4.0);

        this.prePos = this.pos.copy();
        this.pos.add(this.vel);

        if (this.pos.x > window.innerWidth) {
            this.pos.x = (this.pos.x - window.innerWidth);
            this.prePos = this.pos.copy();
        }
        if (this.pos.x < 0) {
            this.pos.x = (window.innerWidth + this.pos.x);
            this.prePos = this.pos.copy();
        }
        if (this.pos.y > window.innerHeight) {
            this.pos.y = (this.pos.y - window.innerHeight);
            this.prePos = this.pos.copy();
        }
        if (this.pos.y < 0) {
            this.pos.y = (window.innerHeight + this.pos.y);
            this.prePos = this.pos.copy();
        }

        this.acc.mult(0);
    }

    ApplyForce(force: Vector) {
        this.acc.add(force);
    }

    Show(p: p5) {
        p.stroke(255, 10);
        p.strokeWeight(this.strokeSize);

        p.line(this.prePos.x, this.prePos.y, this.pos.x, this.pos.y);
    }
}