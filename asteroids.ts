// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

const intervalRocket = 0.5 * 1000 // milliseconds

// let ship = { x:1,y:1 }
// el.attr('style', transform: translate(${ship.x}px, ${ship.y}px))
// ship.x++;ship.y++
// el.attr('style', transform: translate(${ship.x}px, ${ship.y}px))
// let ship = { x:1,y:1 }
// el.attr('style', \`transform: translate(${ship.x}px, ${ship.y}px)\`)
// ship.x++;ship.y++
// el.attr('style', \`transform: translate(${ship.x}px, ${ship.y}px)\`)

// turnRate = degrees/ms (ie. give it (degrees/s) / 1000)
const updateAngle = (turnRate: number): any => (
    timeDelta: any,
    keysPressed: any
) => (prevShip: any) => {
    const a = 65
    const d = 68
    const directionKeysPressed = keysPressed & (a | d)
    const direction =
        directionKeysPressed === a ? -1 : directionKeysPressed === d ? 1 : 0
    return {
        ...prevShip,
        angle:
            prevShip.angle + (turnRate / 180) * Math.PI * direction * timeDelta
    }
}
const circleTriangleCollision = (elem1: Elem, elem2: Elem) => {
    return false
}

// Pure function, returns whether or not a triangle and circle have collided
const checkVertexCircle = (triangle: Elem, circle: Elem): Boolean => {
    const vx1 = parseInt(triangle.attr("vx1"))
    const v2x = parseInt(triangle.attr("vx2"))
    const v3x = parseInt(triangle.attr("vx3"))
    const v3y = parseInt(triangle.attr("vy3"))
    const v1y = parseInt(triangle.attr("vy1"))
    const v2y = parseInt(triangle.attr("vy2"))
    const centrex = parseInt(circle.attr("x"))
    const centrey = parseInt(circle.attr("y"))
    const radius = parseInt(circle.attr("r"))
    const c1x = vx1 - centrex
    const c1y = v1y - centrey

    if (Math.sqrt(c1x * c1x + c1y * c1y) <= radius) {
        return true
    }

    const c2x = v2x - centrex
    const c2y = v2y - centrey

    if (Math.sqrt(c2x * c2x + c2y * c2y) <= radius) {
        return true
    }

    const c3x = v3x - centrex
    const c3y = v3y - centrey

    if (Math.sqrt(c3x * c3x + c3y * c3y) <= radius) {
        return true
    }
    return false
}

// Pure function, returns whether or not a triangle and circle have collided
const rectCircleCollision = (rect: Ship, circle: Elem): Boolean => {
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
    const circleX = parseInt(circle.attr("x"))
    const circleY = parseInt(circle.attr("y"))
    const circleR = parseInt(circle.attr("r"))
    const circleDistanceX = Math.abs(circleX - rect.x)
    const cirleDistanceY = Math.abs(circleY - rect.y)

    if (circleDistanceX > rect.width / 2 + circleR) {
        return false
    }
    if (cirleDistanceY > rect.height / 2 + circleR) {
        return false
    }

    if (circleDistanceX <= rect.width / 2) {
        console.log("COLLISOPN1")

        return true
    }
    if (cirleDistanceY <= rect.height / 2) {
        console.log("COLLISOPN2")

        return true
    }

    const cornerDistance_sq =
        (circleDistanceX - rect.width / 2) ^
        (2 + (cirleDistanceY - rect.height / 2)) ^
        2
    console.log("COLLISOPN", cornerDistance_sq <= (circleR ^ 2))
    return cornerDistance_sq <= (circleR ^ 2)
}

//  Pure function that calculates circler collision
function circleCollision(elem1: Elem, elem2: Elem): Boolean {
    // Varables for element 1
    const circle1R = parseInt(elem1.attr("r"))
    const circle1X = parseInt(elem1.attr("x"))
    const circle1y = parseInt(elem1.attr("y"))
    // Variables for element 2
    const circle2Y = parseInt(elem2.attr("y"))
    const circle2X = parseInt(elem2.attr("x"))
    const circle2R = parseInt(elem2.attr("r"))

    const rTotal = (circle1R ? circle1R : 0) + circle2R
    const x = circle1X - circle2X
    const y = circle1y - circle2Y
    const distance = Math.sqrt(x * x + y * y)

    if (rTotal > distance) {
        console.log(
            "R TOTAL",
            rTotal,
            "Dist",
            distance,
            "Collision",
            rTotal > distance
        )
        return true
    } else {
        return false
    }
}
//Impure function. Mutes all sounds
const muteSounds = (sounds: Object) => {
    Object.values(sounds).forEach((sound: any) => {
        sound.muted = true
    })
}
//Impure function. Unmutes all sounds
const unmuteSounds = (sounds: Object) => {
    Object.values(sounds).forEach((sound: any) => {
        sound.muted = false
    })
}
const gameSpeed = 25

type Ship = {
    element: Elem
    gElem: Elem
    angle: number
    width: number
    height: number
    x: number
    y: number
    dead: boolean
    acceleration: number
    vel: Object
    lives: number
}
type CreateAsteroid = {
    x?: number
    y?: number
    color: string
    asteroidNumber: number
}
type SoundObject = {
    shootSound: any
    backgroundSound: any
    shipExplosionSound: any
    asteroidExplosionSound: any
    smallAsteroidExplosion: any
}
type GameObject = {
    gameSpeed: number
    level: number
    muted: boolean
    score: number
}
// Pure function
function movement(x: number, y: number) {
    return `translate(${x} ${y})`
}
// Pure function
function toRadions(angle: number) {
    return angle * (Math.PI / 180)
}
// Pure function
function toDegrees(angle: number) {
    return angle * (180 / Math.PI)
}
// Pure function
function rotation(value: number) {
    return `rotate (${value})`
}
// Pure function
function isDead(ship: Ship) {
    return ship.lives <= 0
}

// Pure function that returns the correct x or y value if it is outside of the boundary
const wrap = (value: number, type: string, canvas: HTMLElement): number => {
    const boundary = type === "x" ? canvas.clientWidth : canvas.clientHeight
    if (value > boundary) {
        return 0
    } else if (value < 0) {
        return boundary
    } else {
        return value
    }
}
// Impure function. Updates elemItem location using movement logic
const moveElem = (elemItem: Elem, speed: number, canvas: HTMLElement) => {
    const angle = parseInt(elemItem.attr("angle"))
    const angleInRadions = toRadions(angle)
    const origY = parseInt(elemItem.attr("y"))
    const origX = parseInt(elemItem.attr("x"))
    const calculatedX = wrap(
        origX + speed * Math.sin(angleInRadions),
        "x",
        canvas
    )
    const calculatedY = wrap(
        origY - speed * Math.cos(angleInRadions),
        "y",
        canvas
    )
    elemItem
        .attr("x", calculatedX)
        .attr("y", calculatedY)
        .attr("transform", movement(calculatedX, calculatedY) + rotation(angle))
}
const emitAsteroidSoundEffect = (
    asteroidNumber: number,
    sounds: SoundObject
) => {
    if (asteroidNumber === 1) {
        sounds.asteroidExplosionSound.currentTime = 0
        sounds.asteroidExplosionSound.play()
    } else {
        sounds.smallAsteroidExplosion.currentTime = 0
        sounds.smallAsteroidExplosion.play()
    }
}
const getShipLivesText = (lives: number) => {
    const life = " ❤️ "
    return `Life: ${life.repeat(lives)} `
}
const getHighscoreString = (highscore: number) => {
    return `Highscore: ${highscore} `
}
const getAndSetHighscoreNumber = (currentScore: number) => {
    const currentHighscoreFromStorage = localStorage.getItem("highscore")
    const highscoreNumber = currentHighscoreFromStorage
        ? parseInt(currentHighscoreFromStorage)
        : 0

    if (currentScore > highscoreNumber) {
        localStorage.setItem("highscore", currentScore.toString())
        return currentScore
    } else {
        return highscoreNumber
    }
}
// Updates score text
const updateTextElem = (text: string, textElem: Elem) => {
    textElem.elem.innerHTML = text
}
const getScoreText = (newScore: number) => {
    return `Score: ${newScore}`
}
function asteroids() {
    // Getting canvas (Really an svg)
    const svg = document.getElementById("canvas")!
    // Bullets and asteroid arrays are declared as lets so they can be redefined. This is required to reeduce number of bullets and asteroids
    let bullets: Elem[] = []
    let asteroids: Elem[] = []

    // Sounds object that holds all the sound references
    const sounds = {
        shootSound: document.createElement("audio"),
        backgroundSound: document.createElement("audio"),
        shipExplosionSound: document.createElement("audio"),
        asteroidExplosionSound: document.createElement("audio"),
        smallAsteroidExplosion: document.createElement("audio")
    }
    // Setting sounds
    sounds.backgroundSound.src = "assets/backgroundSound.wav"
    sounds.backgroundSound.loop = true
    sounds.backgroundSound.volume = 0.4
    sounds.backgroundSound.play()
    sounds.shootSound.src = "assets/shoot.wav"
    sounds.shipExplosionSound.src = "assets/explosion.wav"
    sounds.asteroidExplosionSound.src = "assets/asteroidExplosion.wav"
    sounds.smallAsteroidExplosion.src = "assets/smallerExplosion.wav"

    const scoreElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 20)
    const levelElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 80)

    const lifeElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 50)
    const highScoreElem = new Elem(svg, "text")
        .attr("font-size", "20")
        .attr("fill", "white")
        .attr("x", svg.clientWidth - 150)
        .attr("y", 20)
    // make a group for the spaceship and a transform to move it and rotate it
    // to animate the spaceship you will update the transform property

    const g = new Elem(svg, "g").attr(
        "transform",
        "translate(300 300) rotate(170)"
    )
    // create a polygon shape for the space ship as a child of the transform group
    const element = new Elem(svg, "polygon", g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("shape", "triangle")
        .attr("vx1", "-15")
        .attr("vy1", "20")
        .attr("vx2", "15")
        .attr("vy2", "20")
        .attr("vx3", "0")
        .attr("vy3", "-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1")
    // Muted is required to be a let as it needs to be mutated
    const gameObject: GameObject = {
        level: 1,
        gameSpeed: 25,
        muted: false,
        score: 0
    }
    // Ship object to store information that will need to be updated throughout the game
    const ship: Ship = {
        element,
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
    }
    updateTextElem("Level: 1", levelElem)
    updateTextElem(getShipLivesText(ship.lives), lifeElem)
    updateTextElem(getScoreText(gameObject.score), scoreElem)
    updateTextElem(
        getHighscoreString(getAndSetHighscoreNumber(gameObject.score)),
        highScoreElem
    )
    // const shipObservable = ship.observe()

    const keydownObservable = Observable.fromEvent<KeyboardEvent>(
        document,
        "keydown"
    )
    const keyupObservable = Observable.fromEvent<KeyboardEvent>(
        document,
        "keyup"
    )

    // Creates a bullet witht the current direction of the ship
    function shootBullet(shipX: number, shipY: number, shipAngle: number) {
        const bulletStartX = shipX
        const bulletStatY = shipY
        const bulletAngle = shipAngle
        sounds.shootSound.currentTime = 0
        sounds.shootSound.play()
        bullets = bullets.concat(
            new Elem(svg, "circle")
                .attr("id", "bullet")
                .attr("shape", "circle")
                .attr("isActive", "true")
                .attr("timer", 50)
                .attr("x", bulletStartX)
                .attr("y", bulletStatY)
                .attr("angle", bulletAngle)
                .attr("r", "3")
                .attr("fill", "#FFFFFF")
                .attr(
                    "transform",
                    movement(bulletStartX, bulletStatY) + rotation(bulletAngle)
                )
        )
    }

    function createAsteroid({ x, y, color, asteroidNumber }: CreateAsteroid) {
        const canvas: any = document.getElementById("canvas")
        if (!canvas) throw "Couldn't get canvas element!"
        const canvasWidth = svg.clientWidth
        const canvasHeight = svg.clientHeight

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
        const asteroidX = x ? x : canvasWidth * Math.random()
        const asteroidY = y ? y : canvasHeight * Math.random()
        const speed = 5 * Math.random()
        const angle = 360 * Math.random()
        const diameter = 100 / asteroidNumber
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
            .attr("fill", "#FFFFF")
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
        asteroids = asteroids.concat(asteroid)
        // asteroids.push(test)
    }

    const updateCurrentVelocity = () => {}

    const updatePos: any = (prevShip: any) => {
        return {
            x: prevShip.x + (prevShip.vel.x * gameSpeed) / 1000,
            y: prevShip.y + (prevShip.vel.y * gameSpeed) / 1000
        }
    }
    // Handles ship actions such as movement.
    const performShipActions = (movementActionObject: any) => {
        for (var key in movementActionObject) {
            if (
                movementActionObject.hasOwnProperty(key) &&
                movementActionObject[key]
            ) {
                const element = key
                if (element === "d" || element === "a") {
                    const direction = element === "d" ? 1 : -1
                    ship.angle = ship.angle + direction * 10
                    ship.gElem.attr(
                        "transform",
                        movement(ship.x, ship.y) + rotation(ship.angle)
                    )
                } else if (element === "w") {
                    const angleInRadions = toRadions(ship.angle)
                    const calculationX = ship.x + 10 * Math.sin(angleInRadions)
                    const calculationY = ship.y - 10 * Math.cos(angleInRadions)
                    ship.x = wrap(calculationX, "x", svg)
                    ship.y = wrap(calculationY, "y", svg)
                    const newPositions = updatePos(ship)
                    //console.log(newPositions)
                    ship.gElem.attr(
                        "transform",
                        movement(ship.x, ship.y) + rotation(ship.angle)
                    )
                }
            }
        }
    }

    const movementObject: any = {}

    const checkShipCollision = (ship: Ship, currAsteroid: Elem) => {
        const hasCollision = rectCircleCollision(ship, currAsteroid)
        if (hasCollision) {
            // sounds.shipExplosionSound.currentTime = 0
            sounds.shipExplosionSound.play()
            ship.lives = ship.lives - 1
            if (ship.lives >= 0) {
                updateTextElem(getShipLivesText(ship.lives), lifeElem)
            }
            if (ship.lives <= 0) {
                ship.element.elem.remove()
            }
        }
    }

    const mainObservable = Observable.interval(gameSpeed)

    // Observable to shoot bullets. Slower
    const delayedBulletObservable = Observable.interval(gameSpeed * 5)
    delayedBulletObservable.subscribe(e => {
        if (movementObject[" "]) {
            shootBullet(ship.x, ship.y, ship.angle)
        }
    })
    // Observable to shoot bullets. Slower
    const cleanArrayObservable = Observable.interval(1000)
    cleanArrayObservable.subscribe(e => {
        cleanArrays(bullets, asteroids)
    })
    mainObservable
        // .takeUntil(mainObservable.filter(() => isDead(ship)))
        .subscribe(e => {
            handleLevels(asteroids, gameObject)
            performShipActions(movementObject)
        })

    const bulletAsteroidCollision = (
        bullet: Elem,
        asteroid: Elem,
        game: GameObject
    ) => {
        const newScore = game.score + 100
        game.score = newScore
        updateTextElem(getScoreText(newScore), scoreElem)
        updateTextElem(
            getHighscoreString(getAndSetHighscoreNumber(newScore)),
            highScoreElem
        )
        const asteroidNumber = parseInt(asteroid.attr("asteroidNumber"))
        emitAsteroidSoundEffect(asteroidNumber, sounds)
        if (asteroidNumber === 1) {
            sounds.asteroidExplosionSound.currentTime = 0
            sounds.asteroidExplosionSound.play()
        } else {
            sounds.smallAsteroidExplosion.currentTime = 0
            sounds.smallAsteroidExplosion.play()
        }
        if (asteroidNumber < 3) {
            const currentX = parseInt(asteroid.attr("x"))
            const currentY = parseInt(asteroid.attr("y"))
            for (var i = 0; i <= asteroidNumber * 2; i++) {
                createAsteroid({
                    x: currentX,
                    y: currentY,
                    color: "blue",
                    asteroidNumber: asteroidNumber + 1
                })
            }
        }
        asteroid.attr("isActive", "false")
        bullet.attr("isActive", "false")
        bullet.elem.remove()
        asteroid.elem.remove()
    }

    const handleBulletLogic = (bullets: Elem[], asteroids: Elem[]) => {
        return bullets.filter(bullet => {
            const currTimer = parseInt(bullet.attr("timer")) - 1
            const bulletActive = bullet.attr("isActive")
            if (currTimer <= 0 || bulletActive === "false") {
                // Remove bullet from canvas and return false to filter from array
                bullet.elem.remove()
                return false
            }
            // impure function to move bullet.
            moveElem(bullet, 10, svg)
            bullet.attr("timer", currTimer)

            asteroids.forEach((asteroid: any) => {
                const isActive = asteroid.attr("isActive")
                if (isActive !== "false" && bulletActive !== "false") {
                    // Checks for collision between current bullet and asteroid.
                    // Pure function
                    const hasCollision = circleCollision(bullet, asteroid)
                    // If there is a collision, updated score, remove bullet and asteroid. Set both to false.
                    if (hasCollision) {
                        bulletAsteroidCollision(bullet, asteroid, gameObject)
                    }
                }
            })

            return true
        })
    }

    // Handles bullet movement
    mainObservable
        // .takeUntil(bulletObservable.filter(() => isDead(ship)))
        .subscribe(x => {
            // Goes through each bullet and performs logic to move it
            bullets = handleBulletLogic(bullets, asteroids)
            asteroids.forEach(asteroid => {
                moveElem(asteroid, parseInt(asteroid.attr("speed")), svg)
                const isActive = asteroid.attr("isActive")
                if (isActive === "true") {
                    checkShipCollision(ship, asteroid)
                }
            })
        })

    // Adds keydowns to the movementObject
    keydownObservable.subscribe(e => {
        movementObject[e.key] = true
        const muted = gameObject.muted
        if (e.key === "m" && !muted) {
            gameObject.muted = true
            console.log("MUTE")
            muteSounds(sounds)
        } else if (e.key === "m" && muted) {
            gameObject.muted = false
            console.log("UNMUTE")
            unmuteSounds(sounds)
        }
    })
    // Makes keys false in the movementObject
    keyupObservable.subscribe(e => {
        movementObject[e.key] = false
    })
    const cleanArrays = (currentBullets: Elem[], currentAsteroids: Elem[]) => {
        bullets = currentBullets.filter(bullet => {
            const isActive = bullet.attr("isActive")
            console.log("FILTER", isActive === "false")
            return isActive !== "false"
        })
        asteroids = asteroids.filter(asteroid => {
            const isActive = asteroid.attr("isActive")
            return isActive !== "false"
        })
    }

    const mouseDown = Observable.fromEvent<MouseEvent>(
        document,
        "mousedown"
    ).map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))

    mouseDown.subscribe(x => {
        shootBullet(ship.x, ship.y, ship.angle)
    })

    const mouseMove = Observable.fromEvent<MouseEvent>(
        document,
        "mousemove"
    ).map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))

    // Handles the ship handle the mouse
    mouseMove.subscribe(x => {
        const actualX = x.x - ship.x
        const actualY = ship.y - x.y
        const newAngle = toDegrees(Math.atan(actualX / actualY))
        ship.angle = actualY <= 0 ? 180 + newAngle : newAngle

        //createAsteroid(x.x, x.y, "blue")
        ship.gElem.attr(
            "transform",
            movement(ship.x, ship.y) + rotation(ship.angle)
        )
    })
    const handleLevels = (currentAsteroids: Elem[], gameObject: GameObject) => {
        if (currentAsteroids.length === 0) {
            gameObject.level += 1
            gameObject.gameSpeed = gameObject.gameSpeed * 2
            for (var i = 0; i < gameObject.level * 2; i++) {
                createAsteroid({ x: 1, y: 2, color: "blue", asteroidNumber: 1 })
            }
        }
    }
}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != "undefined") {
    window.onload = () => {
        asteroids()
    }
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
