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

const gameSpeed = 25

type Ship = {
    element: any
    gElem: any
    angle: number
    x: number
    y: number
    dead: boolean
}

function movement(x: number, y: number) {
    return `translate(${x} ${y})`
}
function toRadions(angle: number) {
    return angle * (Math.PI / 180)
}
function toDegrees(angle: number) {
    return angle * (180 / Math.PI)
}
function isDead(ship: Ship) {
    return ship.dead
}
function asteroids() {
    let bullets: Elem[] = []

    const asteroids: Elem[] = []

    // Inside this function you will use the classes and functions
    // defined in svgelement.ts and observable.ts
    // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
    // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!
    // Explain which ideas you have used ideas from the lectures to
    // create reusable, generic functions.
    const svg = document.getElementById("canvas")!

    function rotation(value: number) {
        return `rotate (${value})`
    }

    // make a group for the spaceship and a transform to move it and rotate it
    // to animate the spaceship you will update the transform property
    const g = new Elem(svg, "g").attr(
        "transform",
        "translate(300 300) rotate(170)"
    )

    // create a polygon shape for the space ship as a child of the transform group
    const element = new Elem(svg, "polygon", g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1")

    // Ship object
    const ship: Ship = {
        element,
        gElem: g,
        x: 300,
        y: 300,
        angle: 0,
        dead: false
    }

    // const shipObservable = ship.observe()

    const keydownObservable = Observable.fromEvent<KeyboardEvent>(
        document,
        "keydown"
    )
    const keyupObservable = Observable.fromEvent<KeyboardEvent>(
        document,
        "keyup"
    )
    const bulletObservable = Observable.interval(25)
    // Handles bullet movement
    bulletObservable
        .takeUntil(bulletObservable.filter(() => isDead(ship)))
        .subscribe(x => {
            bullets = bullets.filter((bullet: Elem) => {
                const currTimer = parseInt(bullet.attr("timer"))
                if (currTimer <= 0) {
                    return false
                } else {
                    return true
                }
            })
            bullets.forEach(bullet => {
                const currTimer = parseInt(bullet.attr("timer")) - 1
                const angle = parseInt(bullet.attr("angle"))
                const angleInRadions = toRadions(angle)
                const y = parseInt(bullet.attr("y"))
                const x = parseInt(bullet.attr("x"))
                const calculationX = x + 20 * Math.sin(angleInRadions)
                const calculationY = y - 20 * Math.cos(angleInRadions)
                bullet
                    .attr("x", calculationX)
                    .attr("y", calculationY)
                    .attr("timer", currTimer)
                    .attr(
                        "transform",
                        movement(calculationX, calculationY) + rotation(angle)
                    )
            })
        })
    // Creates a bullet witht the current direction of the ship
    function shootBullet(shipX: number, shipY: number, shipAngle: number) {
        const bulletStartX = shipX
        const bulletStatY = shipY
        const bulletAngle = shipAngle
        bullets.push(
            new Elem(svg, "circle")
                .attr("id", "bullet")
                .attr("timer", 150)
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
    function createAsteroid(x: number, y: number, colour: string) {
        const canvas = document.getElementById("canvas")
        if (!canvas) throw "Couldn't get canvas element!"
        // test = <svg
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
        const test = new Elem(canvas, "circle")
            .attr("transform", "translate(300 300) rotate(170)")
            .attr("src", "./assets/m.svg")

        const dot = new Elem(canvas, "circle")
            .attr("transform", "translate(300 300) rotate(170)")
            .attr("x", (150 + 150 * x).toString())
            .attr("y", (150 + 150 * y).toString())
            .attr("r", "10")
            .attr("fill", "#008000")
    }

    function performShipActions(movementActionObject: any) {
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
                    const calculationX = 10 * Math.sin(angleInRadions)
                    const calculationY = 10 * Math.cos(angleInRadions)
                    ship.x = ship.x + calculationX
                    ship.y = ship.y + -calculationY

                    ship.gElem.attr(
                        "transform",
                        movement(ship.x, ship.y) + rotation(ship.angle)
                    )
                } else if (element === " ") {
                    shootBullet(ship.x, ship.y, ship.angle)
                }
            }
        }
    }

    const movementObject: any = {}

    const intervalObservable = Observable.interval(gameSpeed)
    intervalObservable.subscribe(e => {
        performShipActions(movementObject)
    })

    const asteroidObservable = Observable.interval(gameSpeed)

    // Adds keydowns to the movementObject
    keydownObservable.subscribe(e => {
        movementObject[e.key] = true
    })
    // Makes keys false in the movementObject
    keyupObservable.subscribe(e => {
        movementObject[e.key] = false
    })

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
        ship.angle =
            actualY <= 0
                ? 180 + newAngle
                : newAngle
        console.log(ship.angle)
        createAsteroid(x.x, x.y, "blue")
        ship.gElem.attr(
            "transform",
            movement(ship.x, ship.y) + rotation(ship.angle)
        )
    })
}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != "undefined")
    window.onload = () => {
        asteroids()
    }
