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

function createAsteroid(x: number, y: number, colour: string) {
    const canvas = document.getElementById("canvas")
    if (!canvas) throw "Couldn't get canvas element!"
    const dot = new Elem(canvas, "circle")
        .attr("transform", "translate(300 300) rotate(170)")
        .attr("x", (150 + 150 * x).toString())
        .attr("y", (150 + 150 * y).toString())
        .attr("r", "10")
        .attr("fill", "#008000")
}
const gameSpeed = 25

type Ship = {
    element: any
    gElem: any
    angle: number
    x: number
    y: number
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
function asteroids() {
    const bullets: Elem[] = []

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
    const ship: Ship = { element, gElem: g, x: 300, y: 300, angle: 0 }

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
    const something = bulletObservable
        .takeUntil(bulletObservable.filter(() => false))
        .subscribe(x => {
            console.log("HALP")
            bullets.forEach(bullet => {
                const angle = parseInt(bullet.attr("angle"))
                const angleInRadions = toRadions(angle)
                const y = parseInt(bullet.attr("y"))
                const x = parseInt(bullet.attr("x"))
                const calculationX = x + 20 * Math.sin(angleInRadions)
                const calculationY = y  - 20 * Math.cos(angleInRadions)
                bullet
                    .attr("x", calculationX)
                    .attr("y", calculationY)
                    .attr(
                        "transform",
                        movement(calculationX, calculationY) + rotation(angle)
                    )
            })
        })

    function performShipActions(movementActionObject: any) {
        for (var key in movementActionObject) {
            if (
                movementActionObject.hasOwnProperty(key) &&
                movementActionObject[key]
            ) {
                const element = key
                console.log(key + " -> " + movementActionObject[key])
                console.log("SHOULD DO SOMETHING", element)
                if (element === "d" || element === "a") {
                    const direction = element === "d" ? 1 : -1
                    ship.angle = ship.angle + direction * 10

                    ship.gElem.attr(
                        "transform",
                        movement(ship.x, ship.y) + rotation(ship.angle)
                    )
                } else if (element === "w") {
                    console.log(element)
                    console.log("SHIP VAL", ship.x)
                    const angleInRadions = toRadions(ship.angle)
                    const calculationX = 10 * Math.sin(angleInRadions)
                    const calculationY = 10 * Math.cos(angleInRadions)
                    console.log(
                        "CALCULATING",
                        calculationX,
                        calculationY,
                        angleInRadions
                    )
                    console.log("Attribute x", ship.element.attr("x"))
                    ship.x = ship.x + calculationX
                    ship.y = ship.y + -calculationY

                    ship.gElem.attr(
                        "transform",
                        movement(ship.x, ship.y) + rotation(ship.angle)
                    )
                } else if (element === " ") {
                    console.log("BANG BANG SHOOT GUN", ship.x, ship.y)
                    const bulletStartX = ship.x
                    const bulletStatY = ship.y
                    const bulletAngle = ship.angle
                    bullets.push(
                        new Elem(svg, "circle")
                            .attr("x", bulletStartX)
                            .attr("y", bulletStatY)
                            .attr("angle", bulletAngle)
                            .attr("r", "3")
                            .attr("fill", "#FFFFFF")
                            .attr(
                                "transform",
                                movement(ship.x, ship.y) + rotation(ship.angle)
                            )
                    )
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

    mouseDown
        .filter(e => {
            {
                console.log(e)
            }
            return true
        })
        .subscribe(x => {
            console.log(x)
            console.log("CALCULATING ANGLE")
            const actualX = x.x - ship.x
            const actualY = ship.y - x.y
            ship.angle = toDegrees(Math.atan(actualY / actualX))
            console.log(ship.angle)
            createAsteroid(x.x, x.y, "blue")
            ship.gElem.attr(
                "transform",
                movement(ship.x, ship.y) + rotation(ship.angle)
            )
        })
}

function getRotation() {
    // ctx.translate(this.x, this.y);
    // ctx.rotate(this.angle);
}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != "undefined")
    window.onload = () => {
        asteroids()
    }
