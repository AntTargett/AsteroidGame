/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

var SafeObserver = (function () {
    function SafeObserver(destination) {
        this.isUnsubscribed = false;
        this.destination = destination;
        if (destination.unsub) {
            this.unsub = destination.unsub;
        }
    }
    SafeObserver.prototype.next = function (value) {
        if (!this.isUnsubscribed) {
            this.destination.next(value);
        }
    };
    SafeObserver.prototype.complete = function () {
        if (!this.isUnsubscribed) {
            this.destination.complete();
            this.unsubscribe();
        }
    };
    SafeObserver.prototype.unsubscribe = function () {
        if (!this.isUnsubscribed) {
            this.isUnsubscribed = true;
            if (this.unsub)
                this.unsub();
        }
    };
    return SafeObserver;
}());
var Observable = (function () {
    function Observable(_subscribe) {
        this._subscribe = _subscribe;
    }
    Observable.prototype.subscribe = function (next, complete) {
        var safeObserver = new SafeObserver({
            next: next,
            complete: complete ? complete : function () { return console.log('complete'); }
        });
        safeObserver.unsub = this._subscribe(safeObserver);
        return safeObserver.unsubscribe.bind(safeObserver);
    };
    Observable.fromEvent = function (el, name) {
        return new Observable(function (observer) {
            var listener = (function (e) { return observer.next(e); });
            el.addEventListener(name, listener);
            return function () { return el.removeEventListener(name, listener); };
        });
    };
    Observable.fromArray = function (arr) {
        return new Observable(function (observer) {
            arr.forEach(function (el) { return observer.next(el); });
            observer.complete();
            return function () { };
        });
    };
    Observable.interval = function (milliseconds) {
        return new Observable(function (observer) {
            var elapsed = 0;
            var handle = setInterval(function () { return observer.next(elapsed += milliseconds); }, milliseconds);
            return function () { return clearInterval(handle); };
        });
    };
    Observable.prototype.map = function (transform) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.subscribe(function (e) { return observer.next(transform(e)); }, function () { return observer.complete(); });
        });
    };
    Observable.prototype.forEach = function (f) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.subscribe(function (e) {
                f(e);
                return observer.next(e);
            }, function () { return observer.complete(); });
        });
    };
    Observable.prototype.filter = function (condition) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.subscribe(function (e) {
                if (condition(e))
                    observer.next(e);
            }, function () { return observer.complete(); });
        });
    };
    Observable.prototype.takeUntil = function (o) {
        var _this = this;
        return new Observable(function (observer) {
            var oUnsub = o.subscribe(function (_) {
                observer.complete();
                oUnsub();
            });
            return _this.subscribe(function (e) { return observer.next(e); }, function () {
                observer.complete();
                oUnsub();
            });
        });
    };
    Observable.prototype.flatMap = function (streamCreator) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.subscribe(function (t) { return streamCreator(t).subscribe(function (o) { return observer.next(o); }); }, function () { return observer.complete(); });
        });
    };
    Observable.prototype.scan = function (initialVal, fun) {
        var _this = this;
        return new Observable(function (observer) {
            var accumulator = initialVal;
            return _this.subscribe(function (v) {
                accumulator = fun(accumulator, v);
                observer.next(accumulator);
            }, function () { return observer.complete(); });
        });
    };
    return Observable;
}());
//# sourceMappingURL=observable.js.map

var Elem = (function () {
    function Elem(svg, tag, parent) {
        if (parent === void 0) { parent = svg; }
        this.elem = document.createElementNS(svg.namespaceURI, tag);
        parent.appendChild(this.elem);
    }
    Elem.prototype.attr = function (name, value) {
        if (typeof value === 'undefined') {
            return this.elem.getAttribute(name);
        }
        this.elem.setAttribute(name, value.toString());
        return this;
    };
    Elem.prototype.observe = function (event) {
        return Observable.fromEvent(this.elem, event);
    };
    return Elem;
}());
//# sourceMappingURL=svgelement.js.map

var getInitialState = function (sounds) {
    var isMuted = localStorage.getItem("muted");
    var gameObject = { level: 0, gameSpeed: 25, muted: false, score: 0 };
    if (isMuted === "true") {
        muteSounds(sounds);
        return __assign({}, gameObject, { muted: true });
    }
    else {
        return gameObject;
    }
};
var asteroids = function () {
    var svg = document.getElementById("canvas");
    var bullets = [];
    var asteroids = [];
    var movementObject = {};
    var sounds = {
        shootSound: document.createElement("audio"),
        backgroundSound: document.createElement("audio"),
        shipExplosionSound: document.createElement("audio"),
        asteroidExplosionSound: document.createElement("audio"),
        smallAsteroidExplosion: document.createElement("audio")
    };
    setSoundInitialSettings(sounds);
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
    var gameOverElem = new Elem(svg, "text");
    var resetInstructionsElem = new Elem(svg, "text");
    var helperInstructions = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", svg.clientWidth / 2 - 400)
        .attr("y", svg.clientHeight / 2 + 200);
    var g = new Elem(svg, "g").attr("transform", "translate(300 300) rotate(0)");
    var shipElement = new Elem(svg, "polygon", g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("shape", "triangle")
        .attr("vx1", "-15")
        .attr("vy1", "20")
        .attr("vx2", "15")
        .attr("vy2", "20")
        .attr("vx3", "0")
        .attr("vy3", "-20")
        .attr("style", "fill:white;stroke:black;stroke-width:1");
    var gameObject = getInitialState(sounds);
    var ship = {
        element: shipElement,
        gElem: g,
        width: 30,
        height: 30,
        x: 300,
        y: 300,
        angle: 0,
        dead: false,
        acceleration: 0.1,
        vel: { x: 0, y: 0 },
        lives: 3,
        shipCollisionRecently: true
    };
    var gameInstructionsText = "Use W, A, D or Arrow Keys. Also can use Mouse to aim/shoot. Space to Shoot. M to mute and unmute";
    var resetInsturctions = "Press R to restart the game";
    updateTextElem(createDisplayText("Level", gameObject.level), levelElem);
    updateTextElem(createShipLivesText(ship.lives), lifeElem);
    updateTextElem(createDisplayText("Score", gameObject.score), scoreElem);
    updateTextElem(createDisplayText("Highscore", getAndSetHighscoreNumber(gameObject.score)), highScoreElem);
    updateHighScoreLocation(highScoreElem, svg);
    updateTextElem(gameInstructionsText, helperInstructions);
    var keydownObservable = Observable.fromEvent(document, "keydown");
    var keyupObservable = Observable.fromEvent(document, "keyup");
    var resetGame = function () {
        gameObject.level = 0;
        gameObject.score = 0;
        ship.x = 300;
        ship.y = 300;
        ship.angle = 0;
        ship.dead = false;
        ship.acceleration = 0.1;
        ship.vel = { x: 0, y: 0 };
        ship.lives = 3;
        ship.shipCollisionRecently = true;
        ship.element.attr("isActive", "true");
        updateShipPosition(ship, 300, 300);
        updateShipAngle(ship, 0);
        updateTextElem(createDisplayText("Score", 0), scoreElem);
        updateTextElem(createShipLivesText(3), lifeElem);
        updateTextElem(createDisplayText("Level", 0), levelElem);
        updateTextElem("", gameOverElem);
        updateTextElem(gameInstructionsText, helperInstructions);
        updateTextElem("", resetInstructionsElem);
        resetArrays(bullets, asteroids);
    };
    var handleShipCollision = function (ship) {
        playSound(sounds.shipExplosionSound);
        shake(svg);
        ship.lives = ship.lives - 1;
        ship.shipCollisionRecently = true;
        ship.element.attr("style", "fill:red;stroke:black;stroke-width:1");
        if (ship.lives >= 0) {
            updateTextElem(createShipLivesText(ship.lives), lifeElem);
        }
        if (ship.lives <= 0) {
            ship.dead = true;
            ship.element.attr("isActive", "false");
        }
    };
    var mainObservable = Observable.interval(gameObject.gameSpeed);
    var mouseDown = Observable.fromEvent(document, "mousedown").map(function (_a) {
        var clientX = _a.clientX, clientY = _a.clientY;
        return ({ x: clientX, y: clientY });
    });
    var mouseMove = Observable.fromEvent(document, "mousemove").map(function (_a) {
        var clientX = _a.clientX, clientY = _a.clientY;
        return ({ x: clientX, y: clientY });
    });
    var delayedBulletObservable = Observable.interval(gameObject.gameSpeed * 10);
    var hitObservable = Observable.interval(1000);
    hitObservable.subscribe(function (e) {
        if (ship.shipCollisionRecently) {
            ship.element.attr("style", "fill:white;stroke:black;stroke-width:1");
            ship.shipCollisionRecently = false;
        }
    });
    var cleanArrayObservable = Observable.interval(4000);
    mainObservable.subscribe(function (e) {
        if (isDead(ship) && !gameOverElem.elem.innerHTML) {
            handleGameOver();
        }
    });
    delayedBulletObservable
        .filter(function () { return !isDead(ship); })
        .subscribe(function (e) {
        if (movementObject[" "]) {
            bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
        }
    });
    cleanArrayObservable.subscribe(function (e) {
        cleanArrays(bullets, asteroids);
    });
    mainObservable
        .filter(function () { return !isDead(ship); })
        .subscribe(function (e) {
        handleLevels(asteroids, gameObject);
        performShipActions(movementObject, ship, svg);
        if (sounds.backgroundSound.paused &&
            sounds.backgroundSound.readyState >= 1) {
            playSound(sounds.backgroundSound);
        }
    });
    keydownObservable
        .filter(function () { return !isDead(ship); })
        .subscribe(function (e) {
        if (e.key === " " && !movementObject[e.key]) {
            bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
        }
    });
    mainObservable
        .filter(function () { return !isDead(ship); })
        .subscribe(function (x) {
        bullets.forEach(function (bullet) {
            moveElem(bullet, 10, svg);
            handleBulletLogic(bullet, asteroids, svg);
        });
        asteroids.forEach(function (asteroid) {
            moveElem(asteroid, parseInt(asteroid.attr("speed")), svg);
            var isActive = asteroid.attr("isActive");
            if (isActive === "true" && !isDead(ship)) {
                var hasCollision = rectCircleCollision(ship, asteroid);
                if (hasCollision) {
                    if (!collisionRecently(ship)) {
                        handleShipCollision(ship);
                    }
                }
            }
        });
    });
    keydownObservable.subscribe(function (e) {
        movementObject[e.key] = true;
        updateTextElem("", helperInstructions);
        var muted = gameObject.muted;
        if (e.key === "m" && !muted) {
            gameObject.muted = true;
            localStorage.setItem("muted", "true");
            muteSounds(sounds);
        }
        else if (e.key === "m" && muted) {
            localStorage.setItem("muted", "false");
            gameObject.muted = false;
            unmuteSounds(sounds);
        }
        else if (e.key === "r") {
            resetGame();
        }
    });
    keyupObservable.subscribe(function (e) {
        movementObject[e.key] = false;
    });
    mouseDown
        .filter(function () { return !isDead(ship); })
        .subscribe(function (x) {
        bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
    });
    mouseMove.subscribe(function (x) {
        var actualX = x.x - ship.x;
        var actualY = ship.y - x.y;
        var calculatedAngle = toDegrees(Math.atan(actualX / actualY));
        var newAngle = actualY <= 0 ? 180 + calculatedAngle : calculatedAngle;
        updateShipAngle(ship, newAngle);
    });
    var bulletAsteroidCollision = function (bullet, asteroid, game, canvas) {
        var newScore = game.score + 100;
        game.score = newScore;
        updateTextElem(createDisplayText("Score", newScore), scoreElem);
        updateTextElem(createDisplayText("Highscore", getAndSetHighscoreNumber(newScore)), highScoreElem);
        updateHighScoreLocation(highScoreElem, canvas);
        var asteroidNumber = parseInt(asteroid.attr("asteroidNumber"));
        emitAsteroidSoundEffect(asteroidNumber, sounds);
        if (asteroidNumber < 3) {
            var currentX = parseInt(asteroid.attr("x"));
            var currentY = parseInt(asteroid.attr("y"));
            asteroids = createAsteroids({
                newAsteroidArray: asteroids,
                numberOfAsteroids: asteroidNumber * 2,
                x: currentX,
                y: currentY,
                gameLevel: gameObject.level,
                asteroidNumber: asteroidNumber + 1
            });
        }
        setInactive(asteroid);
        setInactive(bullet);
    };
    var handleBulletLogic = function (bullet, asteroids, canvas) {
        var currTimer = parseInt(bullet.attr("timer")) - 1;
        var bulletActive = bullet.attr("isActive");
        if (currTimer <= 0 || bulletActive === "false") {
            setInactive(bullet);
        }
        bullet.attr("timer", currTimer);
        asteroids.forEach(function (asteroid) {
            var isActive = asteroid.attr("isActive");
            if (isActive !== "false" && bulletActive !== "false") {
                var hasCollision = circleCollision(bullet, asteroid);
                if (hasCollision) {
                    bulletAsteroidCollision(bullet, asteroid, gameObject, canvas);
                }
            }
        });
    };
    var handleGameOver = function () {
        resetInstructionsElem.elem.remove();
        gameOverElem.elem.remove();
        gameOverElem = new Elem(svg, "text")
            .attr("font-size", "100")
            .attr("fill", "red")
            .attr("x", svg.clientWidth / 2 - 300)
            .attr("y", svg.clientHeight / 2);
        resetInstructionsElem = new Elem(svg, "text")
            .attr("font-size", "20")
            .attr("fill", "white")
            .attr("x", svg.clientWidth / 2 - 100)
            .attr("y", svg.clientHeight / 2 + 50);
        updateTextElem("GAME OVER", gameOverElem);
        updateTextElem(resetInsturctions, resetInstructionsElem);
    };
    var handleLevels = function (currentAsteroids, gameObject) {
        if (currentAsteroids.length === 0) {
            gameObject.level += 1;
            ship.shipCollisionRecently = true;
            updateTextElem(createDisplayText("Level", gameObject.level), levelElem);
            asteroids = createAsteroids({
                newAsteroidArray: asteroids,
                numberOfAsteroids: gameObject.level * 2,
                gameLevel: gameObject.level,
                asteroidNumber: 1
            });
        }
    };
    var resetArrays = function (currentBullets, currentAsteroids) {
        currentBullets.forEach(function (bullet) {
            setInactive(bullet);
        });
        bullets = [];
        asteroids.forEach(function (asteroid) {
            setInactive(asteroid);
        });
        asteroids = [];
    };
    var cleanArrays = function (currentBullets, currentAsteroids) {
        bullets = currentBullets.filter(function (bullet) {
            var isActive = bullet.attr("isActive");
            if (isActive === "false") {
                setInactive(bullet);
                return false;
            }
            return true;
        });
        asteroids = currentAsteroids.filter(function (asteroid) {
            var isActive = asteroid.attr("isActive");
            if (isActive === "false") {
                setInactive(asteroid);
                return false;
            }
            return true;
        });
    };
};
var updateHighScoreLocation = function (highScoreElem, svg) {
    highScoreElem.attr("x", svg.clientWidth - highScoreElem.elem.getBBox().width);
};
var performShipActions = function (movementActionObject, ship, svgCanvas) {
    for (var key in movementActionObject) {
        if (movementActionObject.hasOwnProperty(key) &&
            movementActionObject[key]) {
            var element = key;
            if (element === "d" ||
                element === "a" ||
                element === "ArrowLeft" ||
                element === "ArrowRight") {
                var direction = element === "d" || element === "ArrowRight" ? 1 : -1;
                updateShipAngle(ship, ship.angle + direction * 10);
            }
            else if (element === "w" || element === "ArrowUp") {
                var angleInRadions = toRadions(ship.angle);
                var calculationX = ship.x + 10 * Math.sin(angleInRadions);
                var calculationY = ship.y - 10 * Math.cos(angleInRadions);
                updateShipPosition(ship, wrap(calculationX, "x", svgCanvas), wrap(calculationY, "y", svgCanvas));
            }
        }
    }
};
var collisionRecently = function (ship) {
    return ship.shipCollisionRecently;
};
var muteSounds = function (sounds) {
    Object.values(sounds).forEach(function (sound) {
        sound.muted = true;
    });
};
var unmuteSounds = function (sounds) {
    Object.values(sounds).forEach(function (sound) {
        sound.muted = false;
    });
};
var rectCircleCollision = function (rect, circle) {
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
        return true;
    }
    if (cirleDistanceY <= rect.height / 2) {
        return true;
    }
    var cornerDistance_sq = (circleDistanceX - rect.width / 2) ^
        (2 + (cirleDistanceY - rect.height / 2)) ^
        2;
    return cornerDistance_sq <= (circleR ^ 2);
};
function circleCollision(elem1, elem2) {
    var circle1R = parseInt(elem1.attr("r"));
    var circle1X = parseInt(elem1.attr("x"));
    var circle1y = parseInt(elem1.attr("y"));
    var circle2Y = parseInt(elem2.attr("y"));
    var circle2X = parseInt(elem2.attr("x"));
    var circle2R = parseInt(elem2.attr("r"));
    var rTotal = (circle1R ? circle1R : 0) + circle2R;
    var x = circle1X - circle2X;
    var y = circle1y - circle2Y;
    var distance = Math.sqrt(x * x + y * y);
    if (rTotal > distance) {
        return true;
    }
    else {
        return false;
    }
}
function movement(x, y) {
    return "translate(" + x + ", " + y + ")";
}
function toRadions(angle) {
    return angle * (Math.PI / 180);
}
function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
function rotation(value) {
    return "rotate (" + value + ")";
}
function isDead(ship) {
    return ship.lives <= 0;
}
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
var createShipLivesText = function (lives) {
    var life = " ❤️ ";
    return "Life: " + life.repeat(lives) + " ";
};
var createDisplayText = function (startingText, displayValue) {
    return startingText + ": " + displayValue + " ";
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
var updateTextElem = function (text, textElem) {
    textElem.elem.innerHTML = text;
};
var setInactive = function (element) {
    element.attr("isActive", "false");
    element.elem.remove();
};
var playSound = function (sound, time) {
    if (time !== undefined) {
        sound.currentTime = time;
    }
    sound.play();
};
var createAsteroids = function (_a) {
    var newAsteroidArray = _a.newAsteroidArray, numberOfAsteroids = _a.numberOfAsteroids, rest = __rest(_a, ["newAsteroidArray", "numberOfAsteroids"]);
    return numberOfAsteroids > 1
        ? createAsteroids(__assign({ newAsteroidArray: newAsteroidArray.concat(createAsteroid(rest)), numberOfAsteroids: numberOfAsteroids - 1 }, rest))
        : newAsteroidArray.concat(createAsteroid(rest));
};
function createAsteroid(_a) {
    var x = _a.x, y = _a.y, gameLevel = _a.gameLevel, asteroidNumber = _a.asteroidNumber;
    var canvas = document.getElementById("canvas");
    if (!canvas)
        throw "Couldn't get canvas element!";
    var canvasWidth = canvas.clientWidth;
    var canvasHeight = canvas.clientHeight;
    var asteroidX = x ? x : canvasWidth * Math.random();
    var asteroidY = y ? y : canvasHeight * Math.random();
    var speed = 5 * Math.random() * gameLevel;
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
    return asteroid;
}
var createBullet = function (shipX, shipY, shipAngle, svgCanvas, sounds) {
    var bulletStartX = shipX;
    var bulletStatY = shipY;
    var bulletAngle = shipAngle;
    playSound(sounds.shootSound, 0);
    var bullet = new Elem(svgCanvas, "circle")
        .attr("id", "bullet")
        .attr("shape", "circle")
        .attr("isActive", "true")
        .attr("timer", 50)
        .attr("x", bulletStartX)
        .attr("y", bulletStatY)
        .attr("angle", bulletAngle)
        .attr("r", "5")
        .attr("fill", "#ffeb3b")
        .attr("transform", movement(bulletStartX, bulletStatY) + rotation(bulletAngle));
    return bullet;
};
var setSoundInitialSettings = function (sounds) {
    sounds.backgroundSound.src = "assets/backgroundSound.wav";
    sounds.backgroundSound.loop = true;
    sounds.backgroundSound.volume = 0.4;
    sounds.shootSound.src = "assets/shoot.wav";
    sounds.shipExplosionSound.src = "assets/explosion.wav";
    sounds.asteroidExplosionSound.src = "assets/asteroidExplosion.wav";
    sounds.smallAsteroidExplosion.src = "assets/smallerExplosion.wav";
};
var updateShipPosition = function (ship, x, y) {
    ship.x = x;
    ship.y = y;
    ship.gElem.attr("transform", movement(x, y) + " " + rotation(ship.angle));
};
var updateShipAngle = function (ship, newAngle) {
    ship.angle = newAngle;
    ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
};
var shakingElements = [];
var randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
var upAndDownShake = function (shakeObject) {
    var startX = shakeObject.startX, startY = shakeObject.startY, magnitude = shakeObject.magnitude, magnitudeUnit = shakeObject.magnitudeUnit, numberOfShakes = shakeObject.numberOfShakes, element = shakeObject.element, counter = shakeObject.counter;
    var currentMagnitude = magnitude;
    element.style.transform = "translate(" + startX + "px, " + startY + "px)";
    var newMagnitude = currentMagnitude - magnitudeUnit;
    var randomX = randomInt(-newMagnitude, newMagnitude);
    var randomY = randomInt(-newMagnitude, newMagnitude);
    element.style.transform = "translate(" + randomX + "px, " + randomY + "px)";
    requestAnimationFrame(function () {
        return upAndDownShake(__assign({}, shakeObject, { magnitude: newMagnitude, counter: counter + 1 }));
    });
    if (counter >= numberOfShakes) {
        element.style.transform =
            "translate(" + startX + "px, " + startY + "px)";
        shakingElements.splice(shakingElements.indexOf(element), 1);
    }
};
var angularShake = function (shakeObject) {
    var element = shakeObject.element, startAngle = shakeObject.startAngle, magnitudeUnit = shakeObject.magnitudeUnit, numberOfShakes = shakeObject.numberOfShakes, magnitude = shakeObject.magnitude, counter = shakeObject.counter, tiltAngle = shakeObject.tiltAngle;
    element.style.transform = "rotate(" + startAngle + "deg)";
    var newMagnitude = magnitude - magnitudeUnit;
    var angle = Number(magnitude * tiltAngle).toFixed(2);
    console.log(angle);
    element.style.transform = "rotate(" + angle + "deg)";
    var newTiltAngle = tiltAngle * -1;
    requestAnimationFrame(function () {
        return angularShake(__assign({}, shakeObject, { tiltAngle: newTiltAngle, magnitude: newMagnitude, counter: counter + 1 }));
    });
    if (counter >= numberOfShakes) {
        element.style.transform = "rotate(" + startAngle + "deg)";
        shakingElements.splice(shakingElements.indexOf(element), 1);
    }
};
var shake = function (element, magnitude, angular) {
    if (magnitude === void 0) { magnitude = 16; }
    if (angular === void 0) { angular = false; }
    var tiltAngle = 1;
    var numberOfShakes = 15;
    var startX = 0, startY = 0, startAngle = 0;
    var magnitudeUnit = magnitude / numberOfShakes;
    if (shakingElements.indexOf(element) === -1) {
        shakingElements.push(element);
        if (angular) {
            angularShake({
                counter: 1,
                magnitude: magnitude,
                element: element,
                tiltAngle: tiltAngle,
                startAngle: startAngle,
                magnitudeUnit: magnitudeUnit,
                numberOfShakes: numberOfShakes
            });
        }
        else {
            upAndDownShake({
                counter: 1,
                magnitude: magnitude,
                element: element,
                startX: startX,
                startY: startY,
                magnitudeUnit: magnitudeUnit,
                numberOfShakes: numberOfShakes
            });
        }
    }
};
if (typeof window != "undefined") {
    window.onload = function () {
        asteroids();
    };
}
//# sourceMappingURL=asteroids.js.map
