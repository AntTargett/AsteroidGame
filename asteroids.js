// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var intervalRocket = 0.5 * 1000; // milliseconds
// let ship = { x:1,y:1 }
// el.attr('style', transform: translate(${ship.x}px, ${ship.y}px))
// ship.x++;ship.y++
// el.attr('style', transform: translate(${ship.x}px, ${ship.y}px))
// let ship = { x:1,y:1 }
// el.attr('style', \`transform: translate(${ship.x}px, ${ship.y}px)\`)
// ship.x++;ship.y++
// el.attr('style', \`transform: translate(${ship.x}px, ${ship.y}px)\`)
// turnRate = degrees/ms (ie. give it (degrees/s) / 1000)
var updateAngle = function (turnRate) { return function (timeDelta, keysPressed) { return function (prevShip) {
    var a = 65;
    var d = 68;
    var directionKeysPressed = keysPressed & (a | d);
    var direction = directionKeysPressed === a ? -1 : directionKeysPressed === d ? 1 : 0;
    return __assign({}, prevShip, { angle: prevShip.angle + (turnRate / 180) * Math.PI * direction * timeDelta });
}; }; };
function createAsteroid(x, y, colour) {
    var canvas = document.getElementById("canvas");
    if (!canvas)
        throw "Couldn't get canvas element!";
    var dot = new Elem(canvas, "circle")
        .attr("transform", "translate(300 300) rotate(170)")
        .attr("x", (150 + 150 * x).toString())
        .attr("y", (150 + 150 * y).toString())
        .attr("r", "10")
        .attr("fill", "#008000");
}
var gameSpeed = 25;
function movement(x, y) {
    return "translate(" + x + " " + y + ")";
}
function toRadions(angle) {
    return angle * (Math.PI / 180);
}
function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
function asteroids() {
    var bullets = [];
    var asteroids = [];
    // Inside this function you will use the classes and functions
    // defined in svgelement.ts and observable.ts
    // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
    // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!
    // Explain which ideas you have used ideas from the lectures to
    // create reusable, generic functions.
    var svg = document.getElementById("canvas");
    function rotation(value) {
        return "rotate (" + value + ")";
    }
    // make a group for the spaceship and a transform to move it and rotate it
    // to animate the spaceship you will update the transform property
    var g = new Elem(svg, "g").attr("transform", "translate(300 300) rotate(170)");
    // create a polygon shape for the space ship as a child of the transform group
    var element = new Elem(svg, "polygon", g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1");
    // Ship object
    var ship = { element: element, gElem: g, x: 300, y: 300, angle: 0 };
    // const shipObservable = ship.observe()
    var keydownObservable = Observable.fromEvent(document, "keydown");
    var keyupObservable = Observable.fromEvent(document, "keyup");
    var bulletObservable = Observable.interval(25);
    var something = bulletObservable
        .takeUntil(bulletObservable.filter(function () { return false; }))
        .subscribe(function (x) {
        console.log("HALP");
        bullets.forEach(function (bullet) {
            var angle = parseInt(bullet.attr("angle"));
            var angleInRadions = toRadions(angle);
            var y = parseInt(bullet.attr("y"));
            var x = parseInt(bullet.attr("x"));
            var calculationX = x + 20 * Math.sin(angleInRadions);
            var calculationY = y - 20 * Math.cos(angleInRadions);
            bullet
                .attr("x", calculationX)
                .attr("y", calculationY)
                .attr("transform", movement(calculationX, calculationY) + rotation(angle));
        });
    });
    function performShipActions(movementActionObject) {
        for (var key in movementActionObject) {
            if (movementActionObject.hasOwnProperty(key) &&
                movementActionObject[key]) {
                var element_1 = key;
                console.log(key + " -> " + movementActionObject[key]);
                console.log("SHOULD DO SOMETHING", element_1);
                if (element_1 === "d" || element_1 === "a") {
                    var direction = element_1 === "d" ? 1 : -1;
                    ship.angle = ship.angle + direction * 10;
                    ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
                }
                else if (element_1 === "w") {
                    console.log(element_1);
                    console.log("SHIP VAL", ship.x);
                    var angleInRadions = toRadions(ship.angle);
                    var calculationX = 10 * Math.sin(angleInRadions);
                    var calculationY = 10 * Math.cos(angleInRadions);
                    console.log("CALCULATING", calculationX, calculationY, angleInRadions);
                    console.log("Attribute x", ship.element.attr("x"));
                    ship.x = ship.x + calculationX;
                    ship.y = ship.y + -calculationY;
                    ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
                }
                else if (element_1 === " ") {
                    console.log("BANG BANG SHOOT GUN", ship.x, ship.y);
                    var bulletStartX = ship.x;
                    var bulletStatY = ship.y;
                    var bulletAngle = ship.angle;
                    bullets.push(new Elem(svg, "circle")
                        .attr("x", bulletStartX)
                        .attr("y", bulletStatY)
                        .attr("angle", bulletAngle)
                        .attr("r", "3")
                        .attr("fill", "#FFFFFF")
                        .attr("transform", movement(ship.x, ship.y) + rotation(ship.angle)));
                }
            }
        }
    }
    var movementObject = {};
    var intervalObservable = Observable.interval(gameSpeed);
    intervalObservable.subscribe(function (e) {
        performShipActions(movementObject);
    });
    var asteroidObservable = Observable.interval(gameSpeed);
    // Adds keydowns to the movementObject
    keydownObservable.subscribe(function (e) {
        movementObject[e.key] = true;
    });
    // Makes keys false in the movementObject
    keyupObservable.subscribe(function (e) {
        movementObject[e.key] = false;
    });
    var mouseDown = Observable.fromEvent(document, "mousedown").map(function (_a) {
        var clientX = _a.clientX, clientY = _a.clientY;
        return ({ x: clientX, y: clientY });
    });
    mouseDown
        .filter(function (e) {
        {
            console.log(e);
        }
        return true;
    })
        .subscribe(function (x) {
        console.log(x);
        console.log("CALCULATING ANGLE");
        var actualX = x.x - ship.x;
        var actualY = ship.y - x.y;
        ship.angle = toDegrees(Math.atan(actualY / actualX));
        console.log(ship.angle);
        createAsteroid(x.x, x.y, "blue");
        ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
    });
}
function getRotation() {
    // ctx.translate(this.x, this.y);
    // ctx.rotate(this.angle);
}
// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != "undefined")
    window.onload = function () {
        asteroids();
    };
