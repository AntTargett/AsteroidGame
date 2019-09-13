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
var circleTriangleCollision = function (elem1, elem2) {
    return false;
};
// Pure function, returns whether or not a triangle and circle have collided
var checkVertexCircle = function (triangle, circle) {
    var vx1 = parseInt(triangle.attr("vx1"));
    var v2x = parseInt(triangle.attr("vx2"));
    var v3x = parseInt(triangle.attr("vx3"));
    var v3y = parseInt(triangle.attr("vy3"));
    var v1y = parseInt(triangle.attr("vy1"));
    var v2y = parseInt(triangle.attr("vy2"));
    var centrex = parseInt(circle.attr("x"));
    var centrey = parseInt(circle.attr("y"));
    var radius = parseInt(circle.attr("r"));
    var c1x = vx1 - centrex;
    var c1y = v1y - centrey;
    if (Math.sqrt(c1x * c1x + c1y * c1y) <= radius) {
        return true;
    }
    var c2x = v2x - centrex;
    var c2y = v2y - centrey;
    if (Math.sqrt(c2x * c2x + c2y * c2y) <= radius) {
        return true;
    }
    var c3x = v3x - centrex;
    var c3y = v3y - centrey;
    if (Math.sqrt(c3x * c3x + c3y * c3y) <= radius) {
        return true;
    }
    return false;
};
// Pure function, returns whether or not a triangle and circle have collided
var rectCircleCollision = function (rect, circle) {
    // const checkVertex = checkVertexCircle(rect, circle)
    // if (checkVertex) {
    //     console.log("COLLISION WITH SHIP CHECK VERTEX")
    //     return true
    // }
    // const vx1 = parseInt(rect.attr("vx1"))
    // const vx2 = parseInt(rect.attr("vx2"))
    // const vx3 = parseInt(rect.attr("vx3"))
    // const vy1 = parseInt(rect.attr("vy1"))
    // const vy2 = parseInt(rect.attr("vy2"))
    // const vy3 = parseInt(rect.attr("vy3"))
    // const c1x = parseInt(circle.attr("x")) - vx1
    // const c1y = parseInt(circle.attr("y")) - vy1
    // const e1x = vx2 - vx1
    // const e1y = vy2 - vy1
    // const kVal = c1x * e1x + c1y * e1y
    // if (kVal > 0) {
    //     const length = Math.sqrt(e1x * e1x + e1y * e1y)
    //     const newK = kVal / length
    //     if (newK < length) {
    //         if (Math.sqrt(c1x * c1x + c1y * c1y - newK * newK)) {
    //             console.log("COLLISION WITH SHIP HERE")
    //             return true
    //         }
    //     }
    // }
    // return false
    var circleX = parseInt(circle.attr("x"));
    var circleY = parseInt(circle.attr("y"));
    var circleR = parseInt(circle.attr("r"));
    var circleDistanceX = Math.abs(circleX - rect.x);
    var cirleDistanceY = Math.abs(circleY - rect.y);
    if (circleDistanceX > rect.width / 2 + circleR) {
        return false;
    }
    if (cirleDistanceY > rect.height / 2 + circleR) {
        return false;
    }
    if (circleDistanceX <= rect.width / 2) {
        console.log("COLLISOPN1");
        return true;
    }
    if (cirleDistanceY <= rect.height / 2) {
        console.log("COLLISOPN2");
        return true;
    }
    var cornerDistance_sq = (circleDistanceX - rect.width / 2) ^
        (2 + (cirleDistanceY - rect.height / 2)) ^
        2;
    console.log("COLLISOPN", cornerDistance_sq <= (circleR ^ 2));
    return cornerDistance_sq <= (circleR ^ 2);
};
//  Pure function that calculates circler collision
function circleCollision(elem1, elem2) {
    // Varables for element 1
    var circle1R = parseInt(elem1.attr("r"));
    var circle1X = parseInt(elem1.attr("x"));
    var circle1y = parseInt(elem1.attr("y"));
    // Variables for element 2
    var circle2Y = parseInt(elem2.attr("y"));
    var circle2X = parseInt(elem2.attr("x"));
    var circle2R = parseInt(elem2.attr("r"));
    var rTotal = (circle1R ? circle1R : 0) + circle2R;
    var x = circle1X - circle2X;
    var y = circle1y - circle2Y;
    var distance = Math.sqrt(x * x + y * y);
    if (rTotal > distance) {
        console.log("R TOTAL", rTotal, "Dist", distance, "Collision", rTotal > distance);
        return true;
    }
    else {
        return false;
    }
}
//Impure function. Mutes all sounds
var muteSounds = function (sounds) {
    Object.values(sounds).forEach(function (sound) {
        sound.muted = true;
    });
};
//Impure function. Unmutes all sounds
var unmuteSounds = function (sounds) {
    Object.values(sounds).forEach(function (sound) {
        sound.muted = false;
    });
};
var gameSpeed = 25;
// Pure function
function movement(x, y) {
    return "translate(" + x + " " + y + ")";
}
// Pure function
function toRadions(angle) {
    return angle * (Math.PI / 180);
}
// Pure function
function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
// Pure function
function rotation(value) {
    return "rotate (" + value + ")";
}
// Pure function
function isDead(ship) {
    return ship.lives <= 0;
}
// Pure function that returns the correct x or y value if it is outside of the boundary
var wrap = function (value, type, canvas) {
    var boundary = type === "x" ? canvas.clientWidth : canvas.clientHeight;
    if (value > boundary) {
        return 0;
    }
    else if (value < 0) {
        return boundary;
    }
    else {
        return value;
    }
};
// Impure function. Updates elemItem location using movement logic
var moveElem = function (elemItem, speed, canvas) {
    var angle = parseInt(elemItem.attr("angle"));
    var angleInRadions = toRadions(angle);
    var origY = parseInt(elemItem.attr("y"));
    var origX = parseInt(elemItem.attr("x"));
    var calculatedX = wrap(origX + speed * Math.sin(angleInRadions), "x", canvas);
    var calculatedY = wrap(origY - speed * Math.cos(angleInRadions), "y", canvas);
    elemItem
        .attr("x", calculatedX)
        .attr("y", calculatedY)
        .attr("transform", movement(calculatedX, calculatedY) + rotation(angle));
};
var emitAsteroidSoundEffect = function (asteroidNumber, sounds) {
    if (asteroidNumber === 1) {
        sounds.asteroidExplosionSound.currentTime = 0;
        sounds.asteroidExplosionSound.play();
    }
    else {
        sounds.smallAsteroidExplosion.currentTime = 0;
        sounds.smallAsteroidExplosion.play();
    }
};
var getShipLivesText = function (lives) {
    var life = " ❤️ ";
    return "Life: " + life.repeat(lives) + " ";
};
var getHighscoreString = function (highscore) {
    return "Highscore: " + highscore + " ";
};
var getAndSetHighscoreNumber = function (currentScore) {
    var currentHighscoreFromStorage = localStorage.getItem("highscore");
    var highscoreNumber = currentHighscoreFromStorage
        ? parseInt(currentHighscoreFromStorage)
        : 0;
    if (currentScore > highscoreNumber) {
        localStorage.setItem("highscore", currentScore.toString());
        return currentScore;
    }
    else {
        return highscoreNumber;
    }
};
// Updates score text
var updateTextElem = function (text, textElem) {
    textElem.elem.innerHTML = text;
};
var getScoreText = function (newScore) {
    return "Score: " + newScore;
};
function asteroids() {
    // Getting canvas (Really an svg)
    var svg = document.getElementById("canvas");
    // Bullets and asteroid arrays are declared as lets so they can be redefined. This is required to reeduce number of bullets and asteroids
    var bullets = [];
    var asteroids = [];
    // Sounds object that holds all the sound references
    var sounds = {
        shootSound: document.createElement("audio"),
        backgroundSound: document.createElement("audio"),
        shipExplosionSound: document.createElement("audio"),
        asteroidExplosionSound: document.createElement("audio"),
        smallAsteroidExplosion: document.createElement("audio")
    };
    // Setting sounds
    sounds.backgroundSound.src = "assets/backgroundSound.wav";
    sounds.backgroundSound.loop = true;
    sounds.backgroundSound.volume = 0.4;
    sounds.backgroundSound.play();
    sounds.shootSound.src = "assets/shoot.wav";
    sounds.shipExplosionSound.src = "assets/explosion.wav";
    sounds.asteroidExplosionSound.src = "assets/asteroidExplosion.wav";
    sounds.smallAsteroidExplosion.src = "assets/smallerExplosion.wav";
    var scoreElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 20);
    var levelElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 80);
    var lifeElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 50);
    var highScoreElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", svg.clientWidth - 150)
        .attr("y", 20);
    // make a group for the spaceship and a transform to move it and rotate it
    // to animate the spaceship you will update the transform property
    var g = new Elem(svg, "g").attr("transform", "translate(300 300) rotate(170)");
    // create a polygon shape for the space ship as a child of the transform group
    var element = new Elem(svg, "polygon", g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("shape", "triangle")
        .attr("vx1", "-15")
        .attr("vy1", "20")
        .attr("vx2", "15")
        .attr("vy2", "20")
        .attr("vx3", "0")
        .attr("vy3", "-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1");
    // Muted is required to be a let as it needs to be mutated
    var gameObject = {
        level: 1,
        gameSpeed: 25,
        muted: false,
        score: 0
    };
    // Ship object to store information that will need to be updated throughout the game
    var ship = {
        element: element,
        gElem: g,
        width: 30,
        height: 30,
        x: 300,
        y: 300,
        angle: 0,
        dead: false,
        acceleration: 0.1,
        vel: { x: 0, y: 0 },
        lives: 3
    };
    updateTextElem("Level: 1", levelElem);
    updateTextElem(getShipLivesText(ship.lives), lifeElem);
    updateTextElem(getScoreText(gameObject.score), scoreElem);
    updateTextElem(getHighscoreString(getAndSetHighscoreNumber(gameObject.score)), highScoreElem);
    // const shipObservable = ship.observe()
    var keydownObservable = Observable.fromEvent(document, "keydown");
    var keyupObservable = Observable.fromEvent(document, "keyup");
    // Creates a bullet witht the current direction of the ship
    function shootBullet(shipX, shipY, shipAngle) {
        var bulletStartX = shipX;
        var bulletStatY = shipY;
        var bulletAngle = shipAngle;
        sounds.shootSound.currentTime = 0;
        sounds.shootSound.play();
        bullets = bullets.concat(new Elem(svg, "circle")
            .attr("id", "bullet")
            .attr("shape", "circle")
            .attr("isActive", "true")
            .attr("timer", 50)
            .attr("x", bulletStartX)
            .attr("y", bulletStatY)
            .attr("angle", bulletAngle)
            .attr("r", "3")
            .attr("fill", "#FFFFFF")
            .attr("transform", movement(bulletStartX, bulletStatY) + rotation(bulletAngle)));
    }
    function createAsteroid(_a) {
        var x = _a.x, y = _a.y, color = _a.color, asteroidNumber = _a.asteroidNumber;
        var canvas = document.getElementById("canvas");
        if (!canvas)
            throw "Couldn't get canvas element!";
        var canvasWidth = svg.clientWidth;
        var canvasHeight = svg.clientHeight;
        // xmlns="http://www.w3.org/2000/svg"
        // xmlns:xlink="http://www.w3.org/1999/xlink"
        // id="test1"
        // height="200px"
        // width="200px">
        //     <image
        //     id="testimg1"
        //     src="./assets/m.svg"
        //     width="100"
        //     height="100"
        //     x="0"
        //     y="0"/>
        // </svg>
        var asteroidX = x ? x : canvasWidth * Math.random();
        var asteroidY = y ? y : canvasHeight * Math.random();
        var speed = 5 * Math.random();
        var angle = 360 * Math.random();
        var diameter = 100 / asteroidNumber;
        var asteroid = new Elem(canvas, "circle")
            .attr("x", asteroidX.toString())
            .attr("y", asteroidY.toString())
            .attr("isActive", "true")
            .attr("asteroidNumber", asteroidNumber)
            .attr("shape", "circle")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("angle", angle)
            .attr("speed", speed <= 1 ? 2 : speed)
            .attr("r", diameter / 2)
            .attr("fill", "#FFFFF");
        // const test = new Elem(canvas, "image")
        //     .attr("x", asteroidX.toString())
        //     .attr("y", asteroidY.toString())
        //     .attr("href", "assets/m.svg")
        //     .attr("isActive", "true")
        //     .attr("width", 100)
        //     .attr("height", 100)
        //     .attr("shape", "circle")
        //     .attr("speed", speed >= 1 ? speed : 2)
        //     // .attr("speed", 0)
        //     .attr("angle", angle)
        //     .attr("r", "45")
        //asteroid.elem.appendChild(test)
        asteroids = asteroids.concat(asteroid);
        // asteroids.push(test)
    }
    var updateCurrentVelocity = function () { };
    var updatePos = function (prevShip) {
        return {
            x: prevShip.x + (prevShip.vel.x * gameSpeed) / 1000,
            y: prevShip.y + (prevShip.vel.y * gameSpeed) / 1000
        };
    };
    // Handles ship actions such as movement.
    var performShipActions = function (movementActionObject) {
        for (var key in movementActionObject) {
            if (movementActionObject.hasOwnProperty(key) &&
                movementActionObject[key]) {
                var element_1 = key;
                if (element_1 === "d" || element_1 === "a") {
                    var direction = element_1 === "d" ? 1 : -1;
                    ship.angle = ship.angle + direction * 10;
                    ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
                }
                else if (element_1 === "w") {
                    var angleInRadions = toRadions(ship.angle);
                    var calculationX = ship.x + 10 * Math.sin(angleInRadions);
                    var calculationY = ship.y - 10 * Math.cos(angleInRadions);
                    ship.x = wrap(calculationX, "x", svg);
                    ship.y = wrap(calculationY, "y", svg);
                    var newPositions = updatePos(ship);
                    //console.log(newPositions)
                    ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
                }
            }
        }
    };
    var movementObject = {};
    var checkShipCollision = function (ship, currAsteroid) {
        var hasCollision = rectCircleCollision(ship, currAsteroid);
        if (hasCollision) {
            // sounds.shipExplosionSound.currentTime = 0
            sounds.shipExplosionSound.play();
            ship.lives = ship.lives - 1;
            if (ship.lives >= 0) {
                updateTextElem(getShipLivesText(ship.lives), lifeElem);
            }
            if (ship.lives <= 0) {
                ship.element.elem.remove();
            }
        }
    };
    var mainObservable = Observable.interval(gameSpeed);
    // Observable to shoot bullets. Slower
    var delayedBulletObservable = Observable.interval(gameSpeed * 5);
    delayedBulletObservable.subscribe(function (e) {
        if (movementObject[" "]) {
            shootBullet(ship.x, ship.y, ship.angle);
        }
    });
    // Observable to shoot bullets. Slower
    var cleanArrayObservable = Observable.interval(1000);
    cleanArrayObservable.subscribe(function (e) {
        cleanArrays(bullets, asteroids);
    });
    mainObservable
        // .takeUntil(mainObservable.filter(() => isDead(ship)))
        .subscribe(function (e) {
        handleLevels(asteroids, gameObject);
        performShipActions(movementObject);
    });
    var bulletAsteroidCollision = function (bullet, asteroid, game) {
        var newScore = game.score + 100;
        game.score = newScore;
        updateTextElem(getScoreText(newScore), scoreElem);
        updateTextElem(getHighscoreString(getAndSetHighscoreNumber(newScore)), highScoreElem);
        var asteroidNumber = parseInt(asteroid.attr("asteroidNumber"));
        emitAsteroidSoundEffect(asteroidNumber, sounds);
        if (asteroidNumber === 1) {
            sounds.asteroidExplosionSound.currentTime = 0;
            sounds.asteroidExplosionSound.play();
        }
        else {
            sounds.smallAsteroidExplosion.currentTime = 0;
            sounds.smallAsteroidExplosion.play();
        }
        if (asteroidNumber < 3) {
            var currentX = parseInt(asteroid.attr("x"));
            var currentY = parseInt(asteroid.attr("y"));
            for (var i = 0; i <= asteroidNumber * 2; i++) {
                createAsteroid({
                    x: currentX,
                    y: currentY,
                    color: "blue",
                    asteroidNumber: asteroidNumber + 1
                });
            }
        }
        asteroid.attr("isActive", "false");
        bullet.attr("isActive", "false");
        bullet.elem.remove();
        asteroid.elem.remove();
    };
    var handleBulletLogic = function (bullets, asteroids) {
        return bullets.filter(function (bullet) {
            var currTimer = parseInt(bullet.attr("timer")) - 1;
            var bulletActive = bullet.attr("isActive");
            if (currTimer <= 0 || bulletActive === "false") {
                // Remove bullet from canvas and return false to filter from array
                bullet.elem.remove();
                return false;
            }
            // impure function to move bullet.
            moveElem(bullet, 10, svg);
            bullet.attr("timer", currTimer);
            asteroids.forEach(function (asteroid) {
                var isActive = asteroid.attr("isActive");
                if (isActive !== "false" && bulletActive !== "false") {
                    // Checks for collision between current bullet and asteroid.
                    // Pure function
                    var hasCollision = circleCollision(bullet, asteroid);
                    // If there is a collision, updated score, remove bullet and asteroid. Set both to false.
                    if (hasCollision) {
                        bulletAsteroidCollision(bullet, asteroid, gameObject);
                    }
                }
            });
            return true;
        });
    };
    // Handles bullet movement
    mainObservable
        // .takeUntil(bulletObservable.filter(() => isDead(ship)))
        .subscribe(function (x) {
        // Goes through each bullet and performs logic to move it
        bullets = handleBulletLogic(bullets, asteroids);
        asteroids.forEach(function (asteroid) {
            moveElem(asteroid, parseInt(asteroid.attr("speed")), svg);
            var isActive = asteroid.attr("isActive");
            if (isActive === "true") {
                checkShipCollision(ship, asteroid);
            }
        });
    });
    // Adds keydowns to the movementObject
    keydownObservable.subscribe(function (e) {
        movementObject[e.key] = true;
        var muted = gameObject.muted;
        if (e.key === "m" && !muted) {
            gameObject.muted = true;
            console.log("MUTE");
            muteSounds(sounds);
        }
        else if (e.key === "m" && muted) {
            gameObject.muted = false;
            console.log("UNMUTE");
            unmuteSounds(sounds);
        }
    });
    // Makes keys false in the movementObject
    keyupObservable.subscribe(function (e) {
        movementObject[e.key] = false;
    });
    var cleanArrays = function (currentBullets, currentAsteroids) {
        bullets = currentBullets.filter(function (bullet) {
            var isActive = bullet.attr("isActive");
            console.log("FILTER", isActive === "false");
            return isActive !== "false";
        });
        asteroids = asteroids.filter(function (asteroid) {
            var isActive = asteroid.attr("isActive");
            return isActive !== "false";
        });
    };
    var mouseDown = Observable.fromEvent(document, "mousedown").map(function (_a) {
        var clientX = _a.clientX, clientY = _a.clientY;
        return ({ x: clientX, y: clientY });
    });
    mouseDown.subscribe(function (x) {
        shootBullet(ship.x, ship.y, ship.angle);
    });
    var mouseMove = Observable.fromEvent(document, "mousemove").map(function (_a) {
        var clientX = _a.clientX, clientY = _a.clientY;
        return ({ x: clientX, y: clientY });
    });
    // Handles the ship handle the mouse
    mouseMove.subscribe(function (x) {
        var actualX = x.x - ship.x;
        var actualY = ship.y - x.y;
        var newAngle = toDegrees(Math.atan(actualX / actualY));
        ship.angle = actualY <= 0 ? 180 + newAngle : newAngle;
        //createAsteroid(x.x, x.y, "blue")
        ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
    });
    var handleLevels = function (currentAsteroids, gameObject) {
        if (currentAsteroids.length === 0) {
            gameObject.level += 1;
            gameObject.gameSpeed = gameObject.gameSpeed * 2;
            for (var i = 0; i < gameObject.level * 2; i++) {
                createAsteroid({ x: 1, y: 2, color: "blue", asteroidNumber: 1 });
            }
        }
    };
}
// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != "undefined") {
    window.onload = function () {
        asteroids();
    };
}
// Inside this function you will use the classes and functions
// defined in svgelement.ts and observable.ts
// to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
// Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.
// You will be marked on your functional programming style
// as well as the functionality that you implement.
// Document your code!
// Explain which ideas you have used ideas from the lectures to
// create reusable, generic functions.
