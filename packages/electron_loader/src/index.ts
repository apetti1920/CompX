import p5 from 'p5';

const containerElement = document.getElementById('p5-container');

const sketch = (p: p5) => {
    let x = 100;
    let y = 100;

    p.setup = function() {
        p.createCanvas(800, 400);
    };

    p.draw = function() {
        p.background(0);
        p.fill(255);
        p.rect(x, y, 50, 50);
    };
};

new p5(sketch, containerElement);