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
// Main game is called to start the game
function asteroids() {
    // Getting canvas (Really an svg)
    var svg = document.getElementById("canvas");
    // Bullets and asteroid arrays are declared as lets so they can be redefined. This is required to reduce number of bullets and asteroids
    var bullets = [];
    var asteroids = [];
    // Stores movement values for the ship. Used to be able to hold down keys
    var movementObject = {};
    // Sounds object that holds all the sound references
    var sounds = {
        shootSound: document.createElement("audio"),
        backgroundSound: document.createElement("audio"),
        shipExplosionSound: document.createElement("audio"),
        asteroidExplosionSound: document.createElement("audio"),
        smallAsteroidExplosion: document.createElement("audio")
    };
    //Impure function to set sounds sources and volue, etc
    setSoundInitialSettings(sounds);
    // Elements to display text on the SVG.
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
    // make a group for the spaceship and a transform to move it and rotate it
    // to animate the spaceship you will update the transform property
    var g = new Elem(svg, "g").attr("transform", "translate(300 300) rotate(0)");
    // create a polygon shape for the space ship as a child of the transform group
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
    // Game object containing global varables for key attributes of the game, which arent required for the ship
    // Such as level, game speed, whether the game is muted and the current score. Highscore is stored locally in the browser
    var gameObject = {
        level: 0,
        gameSpeed: 25,
        muted: false,
        score: 0
    };
    // Ship object to store information that will need to be updated throughout the game
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
    // Text for game instructions
    var gameInstructionsText = "Use W, A, D or Arrow Keys. Also can use Mouse to aim/shoot. Space to Shoot. M to mute and unmute";
    // Text for resetInstructions
    var resetInsturctions = "Press R to restart the game";
    // Functions to update the Text elements at the start of the game
    updateTextElem(createDisplayText("Level", gameObject.level), levelElem);
    updateTextElem(createShipLivesText(ship.lives), lifeElem);
    updateTextElem(createDisplayText("Score", gameObject.score), scoreElem);
    updateTextElem(createDisplayText("Highscore", getAndSetHighscoreNumber(gameObject.score)), highScoreElem);
    updateTextElem(gameInstructionsText, helperInstructions);
    // Keydown observable
    var keydownObservable = Observable.fromEvent(document, "keydown");
    // Keyupobservable
    var keyupObservable = Observable.fromEvent(document, "keyup");
    // Function to reset game state. Impure. Called in a subscribe
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
        ship.lives = ship.lives - 1;
        ship.shipCollisionRecently = true;
        if (ship.lives >= 0) {
            updateTextElem(createShipLivesText(ship.lives), lifeElem);
        }
        if (ship.lives <= 0) {
            ship.dead = true;
            ship.element.attr("isActive", "false");
        }
    };
    // Main observable for move actions for asteroids, ship and bullets.
    var mainObservable = Observable.interval(gameObject.gameSpeed);
    // Observable for mousedown events. Used for being able to shoot with mouse click
    var mouseDown = Observable.fromEvent(document, "mousedown").map(function (_a) {
        var clientX = _a.clientX, clientY = _a.clientY;
        return ({ x: clientX, y: clientY });
    });
    // Mouse move used to track movement of mouse and point the ship in the correct direction
    var mouseMove = Observable.fromEvent(document, "mousemove").map(function (_a) {
        var clientX = _a.clientX, clientY = _a.clientY;
        return ({ x: clientX, y: clientY });
    });
    // Observable to shoot bullets. Slower than main observable. Aim is to reduce consecutive bullet shooting
    var delayedBulletObservable = Observable.interval(gameObject.gameSpeed * 10);
    // Hit observable is set to 1 second intervals to handle updating shipcollisionrecently. Aim is to give the ship some invulnerability time
    var hitObservable = Observable.interval(1000);
    hitObservable.subscribe(function (e) {
        if (ship.shipCollisionRecently) {
            ship.shipCollisionRecently = false;
        }
    });
    // Observable to clean arrays every 4 seconds. Gives time between levels. Also makes it so I am not iterating through giant levels if a player
    // plays for some time
    var cleanArrayObservable = Observable.interval(4000);
    mainObservable.subscribe(function (e) {
        if (isDead(ship) && !gameOverElem.elem.innerHTML) {
            handleGameOver();
        }
    });
    // Filters if ship is dead
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
    // Subscribes to the main observable to handle levels and performShipActions.
    mainObservable
        .filter(function () { return !isDead(ship); })
        .subscribe(function (e) {
        handleLevels(asteroids, gameObject);
        performShipActions(movementObject, ship, svg);
        // To handle playing background sound after refreshing
        if (sounds.backgroundSound.paused &&
            sounds.backgroundSound.readyState >= 1) {
            playSound(sounds.backgroundSound);
        }
    });
    // Adds keydowns to the movementObject. Actions that wont be prevented by ship dying
    keydownObservable
        .filter(function () { return !isDead(ship); })
        .subscribe(function (e) {
        if (e.key === " " && !movementObject[e.key]) {
            bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
        }
    });
    // Handles bullet movement
    mainObservable
        .filter(function () { return !isDead(ship); })
        .subscribe(function (x) {
        // Goes through each bullet and performs logic to move it
        bullets.forEach(function (bullet) {
            //Impure function to move bullet element
            moveElem(bullet, 10, svg);
            // Impure function to handle checking collisions with asteroids and bullet timer
            handleBulletLogic(bullet, asteroids);
        });
        asteroids.forEach(function (asteroid) {
            // Function that updates the asteroid. Impure function is called (Has sideeffects)
            moveElem(asteroid, parseInt(asteroid.attr("speed")), svg);
            var isActive = asteroid.attr("isActive");
            if (isActive === "true" && !isDead(ship)) {
                // Pure function.
                var hasCollision = rectCircleCollision(ship, asteroid);
                if (hasCollision) {
                    if (!collisionRecently(ship)) {
                        // Function that updates the asteroid. Impure function is called (Has sideeffects)
                        handleShipCollision(ship);
                    }
                }
            }
        });
    });
    // Adds keydowns to the movementObject. This is seperate from the other subscribe as Actions that wont be prevented by ship dying
    keydownObservable.subscribe(function (e) {
        movementObject[e.key] = true;
        updateTextElem("", helperInstructions);
        var muted = gameObject.muted;
        // m key for muting
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
    // Makes keys false in the movementObject so that they will no longer be called.
    keyupObservable.subscribe(function (e) {
        movementObject[e.key] = false;
    });
    // mousedown subscribe to shoot bullets
    mouseDown
        .filter(function () { return !isDead(ship); })
        .subscribe(function (x) {
        // instead of mutating bullets it creates a new bullet array
        bullets = bullets.concat(createBullet(ship.x, ship.y, ship.angle, svg, sounds));
    });
    // Subscribe to update mouse angle based on cursor position.
    mouseMove.subscribe(function (x) {
        var actualX = x.x - ship.x;
        var actualY = ship.y - x.y;
        var calculatedAngle = toDegrees(Math.atan(actualX / actualY));
        var newAngle = actualY <= 0 ? 180 + calculatedAngle : calculatedAngle;
        // Impure function to update ship angle
        updateShipAngle(ship, newAngle);
    });
    // Function calls other impure functions to update the score, highscore elements, etc
    // The function itself is not impure.
    var bulletAsteroidCollision = function (bullet, asteroid, game) {
        var newScore = game.score + 100;
        // Mutates game score to be the new Score
        game.score = newScore;
        // Updates the text elements to display the new score
        updateTextElem(createDisplayText("Score", newScore), scoreElem);
        updateTextElem(createDisplayText("Highscore", getAndSetHighscoreNumber(newScore)), highScoreElem);
        // Gets the asteroid number
        var asteroidNumber = parseInt(asteroid.attr("asteroidNumber"));
        // Emits sound based on asteroid number (Type)
        emitAsteroidSoundEffect(asteroidNumber, sounds);
        // If less than three it will spawn new smaller asteroids
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
        // Sets asteroid and bullet to inactive and removes from canvas
        setInactive(asteroid);
        setInactive(bullet);
    };
    // Impure function. Iterates through all the asteroids and checks for collision with bullet.
    // If there is a collision, marks both as inactive and calls bulletAsteroidCollision
    var handleBulletLogic = function (bullet, asteroids) {
        var currTimer = parseInt(bullet.attr("timer")) - 1;
        var bulletActive = bullet.attr("isActive");
        if (currTimer <= 0 || bulletActive === "false") {
            // Remove bullet from canvas and return false to filter from array. Impure function call
            setInactive(bullet);
        }
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
    };
    // Impure function to display game over text.
    var handleGameOver = function () {
        // Removes and recreates the svg to make it so it is the topmost element
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
    // Function that handles when the level should be updated. Condition is when asteroids array is empty. i.e all been destryoed by player
    var handleLevels = function (currentAsteroids, gameObject) {
        if (currentAsteroids.length === 0) {
            gameObject.level += 1;
            // So the player has a second of invul after asteroids spawn
            ship.shipCollisionRecently = true;
            // Updates level display
            updateTextElem(createDisplayText("Level", gameObject.level), levelElem);
            // Creates asteroids based on game level * 2.
            asteroids = createAsteroids({
                newAsteroidArray: asteroids,
                numberOfAsteroids: gameObject.level * 2,
                gameLevel: gameObject.level,
                asteroidNumber: 1
            });
        }
    };
    // Function to reset arrays, goes through each bullet and asteroid and marks inactive (removes and cleans up)
    // Then sets arrays to empty. Used to help reset game after death
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
    // Clean up arrays called every 4 seconds from a subscribe to clean up elements no longer needed.
    // i.e when the isActive for bullet and asteroid is set to false
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
}
// Handles ship actions for movement.
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
                // Calculates angle based on position. Used trigonometry
                var angleInRadions = toRadions(ship.angle);
                var calculationX = ship.x + 10 * Math.sin(angleInRadions);
                var calculationY = ship.y - 10 * Math.cos(angleInRadions);
                // Impure function to update ship x and y values. wrap needs to wrap and x and y values to make sure they are correct
                updateShipPosition(ship, wrap(calculationX, "x", svgCanvas), wrap(calculationY, "y", svgCanvas));
            }
        }
    }
};
// Pure Function to return if the ship has collided recently
var collisionRecently = function (ship) {
    return ship.shipCollisionRecently;
};
//Impure function. Mutes all sounds
// Updates values in sound object
var muteSounds = function (sounds) {
    Object.values(sounds).forEach(function (sound) {
        sound.muted = true;
    });
};
//Impure function. Unmutes all sounds
// Updates values in sound object
var unmuteSounds = function (sounds) {
    Object.values(sounds).forEach(function (sound) {
        sound.muted = false;
    });
};
// Pure function, returns whether or not a triangle and circle have collided https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle For some of the maths required
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
//  Pure function that calculates circler collision. Used https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection to work out maths required
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
        return true;
    }
    else {
        return false;
    }
}
// Pure function to generate translate string
function movement(x, y) {
    return "translate(" + x + ", " + y + ")";
}
// Pure function to convert to radions for trig
function toRadions(angle) {
    return angle * (Math.PI / 180);
}
// Pure function to convert to degrees for trig
function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
// Pure function to generate rotate string
function rotation(value) {
    return "rotate (" + value + ")";
}
// Pure function to get boolean value for if the ship is dead
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
// Impure function. Mutates elemItem location using movement logic. Uses trigonometry
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
// Takes in a asteroid number and calls the play function for the correct asteroid sound
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
// Pure function to get Life text
var createShipLivesText = function (lives) {
    var life = " ❤️ ";
    return "Life: " + life.repeat(lives) + " ";
};
// Pure function to get both highscore text, score text and level text. Reusable
var createDisplayText = function (startingText, displayValue) {
    return startingText + ": " + displayValue + " ";
};
// Impure. Gets the highscore from the localstorage. If the currentscore is greater than the highscore it sets the highscore to the current score
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
// Updates score text. Impure.
var updateTextElem = function (text, textElem) {
    textElem.elem.innerHTML = text;
};
//Impure. Sets an element to inactive by removing it and marking it as isActive false
var setInactive = function (element) {
    element.attr("isActive", "false");
    element.elem.remove();
};
// Takes any sound and calls the play function
var playSound = function (sound, time) {
    if (time !== undefined) {
        sound.currentTime = time;
    }
    sound.play();
};
// PURE Recursive pure function to create an array of asteroids
var createAsteroids = function (_a) {
    var newAsteroidArray = _a.newAsteroidArray, numberOfAsteroids = _a.numberOfAsteroids, rest = __rest(_a, ["newAsteroidArray", "numberOfAsteroids"]);
    return numberOfAsteroids > 1
        ? createAsteroids(__assign({ newAsteroidArray: newAsteroidArray.concat(createAsteroid(rest)), numberOfAsteroids: numberOfAsteroids - 1 }, rest))
        : newAsteroidArray.concat(createAsteroid(rest));
};
// Creates Asteroid element and adds it to the canvas svg. Returns the asteroid
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
    // MY ATTEMPT TO GET IMAGES TO WORK. For some reason never worked. Will re-attempt later
    // const test = new Elem(canvas, "image")
    //     .attr("href", "assets/m.svg")
    //     .attr("x", asteroidX.toString())
    //     .attr("y", asteroidY.toString())
    //     .attr("width", diameter)
    //     .attr("height", diameter)
    //     .attr("isActive", "true")
    //     .attr("asteroidNumber", asteroidNumber)
    //     // .attr("shape", "circle")
    //     .attr("angle", angle)
    //     .attr("speed", speed <= 1 ? 2 : speed)
    //     .attr("r", diameter / 2)
    //     .attr("fill", "#FFFFF")
    return asteroid;
}
// Creates a bullet on the canvas with the current direction of the ship. Returns the bullet
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
// Impure Function that sets the initial sound settings
var setSoundInitialSettings = function (sounds) {
    sounds.backgroundSound.src = "assets/backgroundSound.wav";
    sounds.backgroundSound.loop = true;
    sounds.backgroundSound.volume = 0.4;
    sounds.shootSound.src = "assets/shoot.wav";
    sounds.shipExplosionSound.src = "assets/explosion.wav";
    sounds.asteroidExplosionSound.src = "assets/asteroidExplosion.wav";
    sounds.smallAsteroidExplosion.src = "assets/smallerExplosion.wav";
};
// Impure function. Updates the ship position based on x y coordinates.
var updateShipPosition = function (ship, x, y) {
    ship.x = x;
    ship.y = y;
    ship.gElem.attr("transform", movement(x, y) + " " + rotation(ship.angle));
};
// Impure function. Updates the ship based on a given angle
var updateShipAngle = function (ship, newAngle) {
    ship.angle = newAngle;
    ship.gElem.attr("transform", movement(ship.x, ship.y) + rotation(ship.angle));
};
// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != "undefined") {
    window.onload = function () {
        asteroids();
    };
}
