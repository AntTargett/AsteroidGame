"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
function asteroids() {
    const svg = document.getElementById("canvas");
    let bullets = [];
    let asteroids = [];
    const movementObject = {};
    const sounds = {
        shootSound: document.createElement("audio"),
        backgroundSound: document.createElement("audio"),
        shipExplosionSound: document.createElement("audio"),
        asteroidExplosionSound: document.createElement("audio"),
        smallAsteroidExplosion: document.createElement("audio")
    };
    setSoundInitialSettings(sounds);
    const scoreElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 20);
    const levelElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 80);
    const lifeElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 50);
    const highScoreElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", svg.clientWidth - 150)
        .attr("y", 20);
    let gameOverElem = new Elem(svg, "text");
    let resetInstructionsElem = new Elem(svg, "text");
    let helperInstructions = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", svg.clientWidth / 2 - 400)
        .attr("y", svg.clientHeight / 2 + 200);
    const g = new Elem(svg, "g").attr("transform", "translate(300 300) rotate(0)");
    const shipElement = new Elem(svg, "polygon", g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("shape", "triangle")
        .attr("vx1", "-15")
        .attr("vy1", "20")
        .attr("vx2", "15")
        .attr("vy2", "20")
        .attr("vx3", "0")
        .attr("vy3", "-20")
        .attr("style", "fill:white;stroke:black;stroke-width:1");
    const gameObject = {
        level: 0,
        gameSpeed: 25,
        muted: false,
        score: 0
    };
    const ship = {
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
    const gameInstructionsText = "Use W, A, D or Arrow Keys. Also can use Mouse to aim/shoot. Space to Shoot. M to mute and unmute";
    const resetInsturctions = "Press R to restart the game";
    updateTextElem(createDisplayText("Level", gameObject.level), levelElem);
    updateTextElem(createShipLivesText(ship.lives), lifeElem);
    updateTextElem(createDisplayText("Score", gameObject.score), scoreElem);
    updateTextElem(createDisplayText("Highscore", getAndSetHighscoreNumber(gameObject.score)), highScoreElem);
    updateHighScoreLocation(highScoreElem, svg);
    updateTextElem(gameInstructionsText, helperInstructions);
    const keydownObservable = Observable.fromEvent(document, "keydown");
    const keyupObservable = Observable.fromEvent(document, "keyup");
    const resetGame = () => {
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
    const handleShipCollision = (ship) => {
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
    const mainObservable = Observable.interval(gameObject.gameSpeed);
    const mouseDown = Observable.fromEvent(document, "mousedown").map(({ clientX, clientY }) => ({ x: clientX, y: clientY }));
    const mouseMove = Observable.fromEvent(document, "mousemove").map(({ clientX, clientY }) => ({ x: clientX, y: clientY }));
    const delayedBulletObservable = Observable.interval(gameObject.gameSpeed * 10);
    const hitObservable = Observable.interval(1000);
    hitObservable.subscribe(e => {
        if (ship.shipCollisionRecently) {
            ship.element.attr("style", "fill:white;stroke:black;stroke-width:1");
            ship.shipCollisionRecently = false;
        }
    });
    const cleanArrayObservable = Observable.interval(4000);
    mainObservable.subscribe(e => {
        if (isDead(ship) && !gameOverElem.elem.innerHTML) {
            handleGameOver();
        }
    });
    delayedBulletObservable
        .filter(() => !isDead(ship))
        .subscribe(e => {
        if (movementObject[" "]) {
            bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
        }
    });
    cleanArrayObservable.subscribe(e => {
        cleanArrays(bullets, asteroids);
    });
    mainObservable
        .filter(() => !isDead(ship))
        .subscribe(e => {
        handleLevels(asteroids, gameObject);
        performShipActions(movementObject, ship, svg);
        if (sounds.backgroundSound.paused &&
            sounds.backgroundSound.readyState >= 1) {
            playSound(sounds.backgroundSound);
        }
    });
    keydownObservable
        .filter(() => !isDead(ship))
        .subscribe(e => {
        if (e.key === " " && !movementObject[e.key]) {
            bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
        }
    });
    mainObservable
        .filter(() => !isDead(ship))
        .subscribe(x => {
        bullets.forEach(bullet => {
            moveElem(bullet, 10, svg);
            handleBulletLogic(bullet, asteroids, svg);
        });
        asteroids.forEach(asteroid => {
            moveElem(asteroid, parseInt(asteroid.attr("speed")), svg);
            const isActive = asteroid.attr("isActive");
            if (isActive === "true" && !isDead(ship)) {
                const hasCollision = rectCircleCollision(ship, asteroid);
                if (hasCollision) {
                    if (!collisionRecently(ship)) {
                        handleShipCollision(ship);
                    }
                }
            }
        });
    });
    keydownObservable.subscribe(e => {
        movementObject[e.key] = true;
        updateTextElem("", helperInstructions);
        const muted = gameObject.muted;
        if (e.key === "m" && !muted) {
            gameObject.muted = true;
            muteSounds(sounds);
        }
        else if (e.key === "m" && muted) {
            gameObject.muted = false;
            unmuteSounds(sounds);
        }
        else if (e.key === "r") {
            resetGame();
        }
    });
    keyupObservable.subscribe(e => {
        movementObject[e.key] = false;
    });
    mouseDown
        .filter(() => !isDead(ship))
        .subscribe(x => {
        bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
    });
    mouseMove.subscribe(x => {
        const actualX = x.x - ship.x;
        const actualY = ship.y - x.y;
        const calculatedAngle = toDegrees(Math.atan(actualX / actualY));
        const newAngle = actualY <= 0 ? 180 + calculatedAngle : calculatedAngle;
        updateShipAngle(ship, newAngle);
    });
    const bulletAsteroidCollision = (bullet, asteroid, game, canvas) => {
        const newScore = game.score + 100;
        game.score = newScore;
        updateTextElem(createDisplayText("Score", newScore), scoreElem);
        updateTextElem(createDisplayText("Highscore", getAndSetHighscoreNumber(newScore)), highScoreElem);
        updateHighScoreLocation(highScoreElem, canvas);
        const asteroidNumber = parseInt(asteroid.attr("asteroidNumber"));
        emitAsteroidSoundEffect(asteroidNumber, sounds);
        asteroidExplosionAnimation(asteroid);
        if (asteroidNumber < 3) {
            const currentX = parseInt(asteroid.attr("x"));
            const currentY = parseInt(asteroid.attr("y"));
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
    const handleBulletLogic = (bullet, asteroids, canvas) => {
        const currTimer = parseInt(bullet.attr("timer")) - 1;
        const bulletActive = bullet.attr("isActive");
        if (currTimer <= 0 || bulletActive === "false") {
            setInactive(bullet);
        }
        bullet.attr("timer", currTimer);
        asteroids.forEach((asteroid) => {
            const isActive = asteroid.attr("isActive");
            if (isActive !== "false" && bulletActive !== "false") {
                const hasCollision = circleCollision(bullet, asteroid);
                if (hasCollision) {
                    bulletAsteroidCollision(bullet, asteroid, gameObject, canvas);
                }
            }
        });
    };
    const handleGameOver = () => {
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
    const handleLevels = (currentAsteroids, gameObject) => {
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
    const resetArrays = (currentBullets, currentAsteroids) => {
        currentBullets.forEach(bullet => {
            setInactive(bullet);
        });
        bullets = [];
        asteroids.forEach(asteroid => {
            setInactive(asteroid);
        });
        asteroids = [];
    };
    const cleanArrays = (currentBullets, currentAsteroids) => {
        bullets = currentBullets.filter(bullet => {
            const isActive = bullet.attr("isActive");
            if (isActive === "false") {
                setInactive(bullet);
                return false;
            }
            return true;
        });
        asteroids = currentAsteroids.filter(asteroid => {
            const isActive = asteroid.attr("isActive");
            if (isActive === "false") {
                setInactive(asteroid);
                return false;
            }
            return true;
        });
    };
}
const updateHighScoreLocation = (highScoreElem, svg) => {
    highScoreElem.attr("x", svg.clientWidth - highScoreElem.elem.getBBox().width);
};
const performShipActions = (movementActionObject, ship, svgCanvas) => {
    for (var key in movementActionObject) {
        if (movementActionObject.hasOwnProperty(key) &&
            movementActionObject[key]) {
            const element = key;
            if (element === "d" ||
                element === "a" ||
                element === "ArrowLeft" ||
                element === "ArrowRight") {
                const direction = element === "d" || element === "ArrowRight" ? 1 : -1;
                updateShipAngle(ship, ship.angle + direction * 10);
            }
            else if (element === "w" || element === "ArrowUp") {
                const angleInRadions = toRadions(ship.angle);
                const calculationX = ship.x + 10 * Math.sin(angleInRadions);
                const calculationY = ship.y - 10 * Math.cos(angleInRadions);
                updateShipPosition(ship, wrap(calculationX, "x", svgCanvas), wrap(calculationY, "y", svgCanvas));
            }
        }
    }
};
const collisionRecently = (ship) => {
    return ship.shipCollisionRecently;
};
const muteSounds = (sounds) => {
    Object.values(sounds).forEach((sound) => {
        sound.muted = true;
    });
};
const unmuteSounds = (sounds) => {
    Object.values(sounds).forEach((sound) => {
        sound.muted = false;
    });
};
const rectCircleCollision = (rect, circle) => {
    const circleX = parseInt(circle.attr("x"));
    const circleY = parseInt(circle.attr("y"));
    const circleR = parseInt(circle.attr("r"));
    const circleDistanceX = Math.abs(circleX - rect.x);
    const cirleDistanceY = Math.abs(circleY - rect.y);
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
    const cornerDistance_sq = (circleDistanceX - rect.width / 2) ^
        (2 + (cirleDistanceY - rect.height / 2)) ^
        2;
    return cornerDistance_sq <= (circleR ^ 2);
};
function circleCollision(elem1, elem2) {
    const circle1R = parseInt(elem1.attr("r"));
    const circle1X = parseInt(elem1.attr("x"));
    const circle1y = parseInt(elem1.attr("y"));
    const circle2Y = parseInt(elem2.attr("y"));
    const circle2X = parseInt(elem2.attr("x"));
    const circle2R = parseInt(elem2.attr("r"));
    const rTotal = (circle1R ? circle1R : 0) + circle2R;
    const x = circle1X - circle2X;
    const y = circle1y - circle2Y;
    const distance = Math.sqrt(x * x + y * y);
    if (rTotal > distance) {
        return true;
    }
    else {
        return false;
    }
}
function movement(x, y) {
    return `translate(${x}, ${y})`;
}
function toRadions(angle) {
    return angle * (Math.PI / 180);
}
function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
function rotation(value) {
    return `rotate (${value})`;
}
function isDead(ship) {
    return ship.lives <= 0;
}
const wrap = (value, type, canvas) => {
    const boundary = type === "x" ? canvas.clientWidth : canvas.clientHeight;
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
const moveElem = (elemItem, speed, canvas) => {
    const angle = parseInt(elemItem.attr("angle"));
    const angleInRadions = toRadions(angle);
    const origY = parseInt(elemItem.attr("y"));
    const origX = parseInt(elemItem.attr("x"));
    const calculatedX = wrap(origX + speed * Math.sin(angleInRadions), "x", canvas);
    const calculatedY = wrap(origY - speed * Math.cos(angleInRadions), "y", canvas);
    elemItem
        .attr("x", calculatedX)
        .attr("y", calculatedY)
        .attr("transform", movement(calculatedX, calculatedY) + rotation(angle));
};
const emitAsteroidSoundEffect = (asteroidNumber, sounds) => {
    if (asteroidNumber === 1) {
        sounds.asteroidExplosionSound.currentTime = 0;
        sounds.asteroidExplosionSound.play();
    }
    else {
        sounds.smallAsteroidExplosion.currentTime = 0;
        sounds.smallAsteroidExplosion.play();
    }
};
const createShipLivesText = (lives) => {
    const life = " ❤️ ";
    return `Life: ${life.repeat(lives)} `;
};
const createDisplayText = (startingText, displayValue) => {
    return `${startingText}: ${displayValue} `;
};
const getAndSetHighscoreNumber = (currentScore) => {
    const currentHighscoreFromStorage = localStorage.getItem("highscore");
    const highscoreNumber = currentHighscoreFromStorage
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
const updateTextElem = (text, textElem) => {
    textElem.elem.innerHTML = text;
};
const setInactive = (element) => {
    element.attr("isActive", "false");
    element.elem.remove();
};
const playSound = (sound, time) => {
    if (time !== undefined) {
        sound.currentTime = time;
    }
    sound.play();
};
const createAsteroids = (_a) => {
    var { newAsteroidArray, numberOfAsteroids } = _a, rest = __rest(_a, ["newAsteroidArray", "numberOfAsteroids"]);
    return numberOfAsteroids > 1
        ? createAsteroids(Object.assign({ newAsteroidArray: newAsteroidArray.concat(createAsteroid(rest)), numberOfAsteroids: numberOfAsteroids - 1 }, rest))
        : newAsteroidArray.concat(createAsteroid(rest));
};
const asteroidExplosionAnimation = (asteroid, explosionPieces = 5) => { };
function createAsteroid({ x, y, gameLevel, asteroidNumber }) {
    const canvas = document.getElementById("canvas");
    if (!canvas)
        throw "Couldn't get canvas element!";
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const asteroidX = x ? x : canvasWidth * Math.random();
    const asteroidY = y ? y : canvasHeight * Math.random();
    const speed = 5 * Math.random() * gameLevel;
    const angle = 360 * Math.random();
    const diameter = 100 / asteroidNumber;
    const asteroid = new Elem(canvas, "circle")
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
const createBullet = (shipX, shipY, shipAngle, svgCanvas, sounds) => {
    const bulletStartX = shipX;
    const bulletStatY = shipY;
    const bulletAngle = shipAngle;
    playSound(sounds.shootSound, 0);
    const bullet = new Elem(svgCanvas, "circle")
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
const setSoundInitialSettings = (sounds) => {
    sounds.backgroundSound.src = "assets/backgroundSound.wav";
    sounds.backgroundSound.loop = true;
    sounds.backgroundSound.volume = 0.4;
    sounds.shootSound.src = "assets/shoot.wav";
    sounds.shipExplosionSound.src = "assets/explosion.wav";
    sounds.asteroidExplosionSound.src = "assets/asteroidExplosion.wav";
    sounds.smallAsteroidExplosion.src = "assets/smallerExplosion.wav";
};
const updateShipPosition = (ship, x, y) => {
    ship.x = x;
    ship.y = y;
    ship.gElem.attr("transform", `${movement(x, y)} ${rotation(ship.angle)}`);
};
const updateShipAngle = (ship, newAngle) => {
    ship.angle = newAngle;
    ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
};
const shakingElements = [];
const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const shake = function (element, magnitude = 16, angular = false) {
    let tiltAngle = 1;
    let counter = 1;
    let numberOfShakes = 15;
    let startX = 0, startY = 0, startAngle = 0;
    const magnitudeUnit = magnitude / numberOfShakes;
    if (shakingElements.indexOf(element) === -1) {
        shakingElements.push(element);
        if (angular) {
            angularShake();
        }
        else {
            upAndDownShake();
        }
    }
    function upAndDownShake() {
        if (counter < numberOfShakes) {
            element.style.transform =
                "translate(" + startX + "px, " + startY + "px)";
            magnitude -= magnitudeUnit;
            var randomX = randomInt(-magnitude, magnitude);
            var randomY = randomInt(-magnitude, magnitude);
            element.style.transform =
                "translate(" + randomX + "px, " + randomY + "px)";
            counter += 1;
            requestAnimationFrame(upAndDownShake);
        }
        if (counter >= numberOfShakes) {
            element.style.transform =
                "translate(" + startX + ", " + startY + ")";
            shakingElements.splice(shakingElements.indexOf(element), 1);
        }
    }
    function angularShake() {
        if (counter < numberOfShakes) {
            console.log(tiltAngle);
            element.style.transform = "rotate(" + startAngle + "deg)";
            magnitude -= magnitudeUnit;
            var angle = Number(magnitude * tiltAngle).toFixed(2);
            console.log(angle);
            element.style.transform = "rotate(" + angle + "deg)";
            counter += 1;
            tiltAngle *= -1;
            requestAnimationFrame(angularShake);
        }
        if (counter >= numberOfShakes) {
            element.style.transform = "rotate(" + startAngle + "deg)";
            shakingElements.splice(shakingElements.indexOf(element), 1);
        }
    }
};
if (typeof window != "undefined") {
    window.onload = () => {
        asteroids();
    };
}
//# sourceMappingURL=asteroids.js.map