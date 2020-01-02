import Elem from "./svgelement"
import Observable from "./observable"

// FIT2102 2019 Assignment 1

// GAME DOCUMENTATION
// Game created is the asteroids game with some extended featues
// Current features include, Shooting asteroids, Being hit by asteroids, Lives, Score, Highscore, Sound effects, Muting sound effects, Levels, wrapping of the space world,
// being able to use WAD and arrow keys for movement as well as mouse for aiming and shooting.
// Highscore works by storing the highest score in local storage and retreiving it when the user visits the page.
// Sound effects work by loading in various sound effects, storing them in a sound object and calling it when required.
// HandleLevels works by being called on the MainObservableInterval and checks to see if all asteroids have been destroyed.
// If they have, the GameObject will be changed (i.e increase the level variable) which will then be used to determine speed of asteroid range, as well as
// number of asteroids, etc.
// Lives work by essentially being number of hits taken. Stored in the Ship Object. Decreases by 1 when hit. There is a grace period of 1 second after being hit
// This works by having a 1 second interval that checks if the Ship has been hit, will update a variable after the one second interval goes off.
// Alongside this, I used the advice given by Tim to use an Object to store key downs until key ups. This allows me to perform actions for multiple key presses
// Such as moving and turning and shooting and moving.
// Asteroids start at a random location with a random speed and direction. (Within ranges)
// Also tried to use images, but caused issue with hit detection and were not responding properly to x y updates, etc.

// In terms of using Functional Programming.
// The application aims to use Functional Programming techniques, by trying to  restrict side-effects to the subscribe() call.
// Functions that are impure are either called in subscribe or a function call from the function inside the subscribe
// Alongisde this, I aimed to use pure functions where possible as well as make them as reusable as possible.
// Generics were mostly not required for the functionality required.
// Used ideas from lecture to limit amount of mutated logic required. See CreateAsteroids recursive function to create an asteroid array.
// Tried to use pure functions where possible to generate strings.
// Also used functions to split up logic and for Seperation of concerns.
// Also tried to apply DRY principle by creating functions for repated code.

// NOTE: Play in full screen for better experiance.
// NOTE: Would refactor to different files. Thought it would be easier to leave in one file for marking, etc.

// All types for the code. Chose Type by default, and interfaces when extending types
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
	shipCollisionRecently: boolean
}
type gameInfo = {
	x?: number
	y?: number
	gameLevel: number
}

type bossInfo = gameInfo & {
	levelNumber: number
}

type CreateAsteroid = gameInfo & {
	asteroidNumber: number
}
// Extends the CreateAsteroid input type
interface CreateAsteroidsType extends CreateAsteroid {
	newAsteroidArray: Elem[]
	numberOfAsteroids: number
}
type SoundObject = {
	shootSound: SoundType
	backgroundSound: SoundType
	shipExplosionSound: SoundType
	asteroidExplosionSound: SoundType
	smallAsteroidExplosion: SoundType
}
type SoundType = {
	play: Function
	currentTime: number
	src: string
	loop: boolean
	paused: boolean
	muted: boolean
	volume: number
}
type GameObject = {
	gameSpeed: number
	level: number
	muted: boolean
	score: number
}

type movementActionObject = {
	[key: string]: string | boolean
}

const getInitialState = (sounds: SoundObject): GameObject => {
	const isMuted = localStorage.getItem("muted")
	const gameObject = { level: 0, gameSpeed: 25, muted: false, score: 0 }
	if (isMuted === "true") {
		muteSounds(sounds)
		return { ...gameObject, muted: true }
	} else {
		return gameObject
	}
}

// Main game is called to start the game
const asteroids = () => {
	// Getting canvas (Really an svg)
	const svg = document.getElementById("canvas")!
	// Bullets and asteroid arrays are declared as lets so they can be redefined. This is required to reduce number of bullets and asteroids
	let bullets: Elem[] = []
	let asteroids: Elem[] = []
	let bosses: Elem[] = []
	// Stores movement values for the ship. Used to be able to hold down keys
	const movementObject: movementActionObject = {}
	// Sounds object that holds all the sound references
	const sounds = {
		shootSound: document.createElement("audio"),
		backgroundSound: document.createElement("audio"),
		shipExplosionSound: document.createElement("audio"),
		asteroidExplosionSound: document.createElement("audio"),
		smallAsteroidExplosion: document.createElement("audio")
	}
	//Impure function to set sounds sources and volue, etc
	setSoundInitialSettings(sounds)

	// Elements to display text on the SVG.
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
	let gameOverElem = new Elem(svg, "text")
	let resetInstructionsElem = new Elem(svg, "text")
	let helperInstructions = new Elem(svg, "text")
		.attr("font-size", "20")
		.attr("fill", "white")
		.attr("x", svg.clientWidth / 2 - 400)
		.attr("y", svg.clientHeight / 2 + 200)

	// make a group for the spaceship and a transform to move it and rotate it
	// to animate the spaceship you will update the transform property
	const g = new Elem(svg, "g").attr(
		"transform",
		"translate(300 300) rotate(0)"
	)
	// create a polygon shape for the space ship as a child of the transform group
	const shipElement = new Elem(svg, "polygon", g.elem)
		.attr("points", "-15,20 15,20 0,-20")
		.attr("shape", "triangle")
		.attr("vx1", "-15")
		.attr("vy1", "20")
		.attr("vx2", "15")
		.attr("vy2", "20")
		.attr("vx3", "0")
		.attr("vy3", "-20")
		.attr("style", "fill:white;stroke:black;stroke-width:1")
	// Game object containing global varables for key attributes of the game, which arent required for the ship
	// Such as level, game speed, whether the game is muted and the current score. Highscore is stored locally in the browser
	const gameObject: GameObject = getInitialState(sounds)
	// Ship object to store information that will need to be updated throughout the game
	const ship: Ship = {
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
	}
	// Text for game instructions
	const gameInstructionsText =
		"Use W, A, D or Arrow Keys. Also can use Mouse to aim/shoot. Space to Shoot. M to mute and unmute"
	// Text for resetInstructions
	const resetInsturctions = "Press R to restart the game"
	// Functions to update the Text elements at the start of the game
	updateTextElem(createDisplayText("Level", gameObject.level), levelElem)
	updateTextElem(createShipLivesText(ship.lives), lifeElem)
	updateTextElem(createDisplayText("Score", gameObject.score), scoreElem)
	updateTextElem(
		createDisplayText(
			"Highscore",
			getAndSetHighscoreNumber(gameObject.score)
		),
		highScoreElem
	)

	updateHighScoreLocation(highScoreElem, svg)

	updateTextElem(gameInstructionsText, helperInstructions)
	// Keydown observable
	const keydownObservable = Observable.fromEvent<KeyboardEvent>(
		document,
		"keydown"
	)
	// Keyupobservable
	const keyupObservable = Observable.fromEvent<KeyboardEvent>(
		document,
		"keyup"
	)

	// Function to reset game state. Impure. Called in a subscribe
	const resetGame = () => {
		gameObject.level = 0
		gameObject.score = 0
		ship.x = 300
		ship.y = 300
		ship.angle = 0
		ship.dead = false
		ship.acceleration = 0.1
		ship.vel = { x: 0, y: 0 }
		ship.lives = 3
		ship.shipCollisionRecently = true
		ship.element.attr("isActive", "true")
		updateShipPosition(ship, 300, 300)
		updateShipAngle(ship, 0)
		updateTextElem(createDisplayText("Score", 0), scoreElem)
		updateTextElem(createShipLivesText(3), lifeElem)
		updateTextElem(createDisplayText("Level", 0), levelElem)
		updateTextElem("", gameOverElem)
		updateTextElem(gameInstructionsText, helperInstructions)
		updateTextElem("", resetInstructionsElem)
		resetArrays(bullets, asteroids)
	}

	const handleShipCollision = (ship: Ship) => {
		playSound(sounds.shipExplosionSound)
		//upAndDownShake()
		shake(svg)
		ship.lives = ship.lives - 1
		ship.shipCollisionRecently = true
		ship.element.attr("style", "fill:red;stroke:black;stroke-width:1")

		if (ship.lives >= 0) {
			updateTextElem(createShipLivesText(ship.lives), lifeElem)
		}
		if (ship.lives <= 0) {
			ship.dead = true
			ship.element.attr("isActive", "false")
		}
	}
	// Main observable for move actions for asteroids, ship and bullets.
	const mainObservable = Observable.interval(gameObject.gameSpeed)
	// Observable for mousedown events. Used for being able to shoot with mouse click
	const mouseDown = Observable.fromEvent<MouseEvent>(
		document,
		"mousedown"
	).map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))

	// Mouse move used to track movement of mouse and point the ship in the correct direction
	const mouseMove = Observable.fromEvent<MouseEvent>(
		document,
		"mousemove"
	).map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))
	// Observable to shoot bullets. Slower than main observable. Aim is to reduce consecutive bullet shooting
	const delayedBulletObservable = Observable.interval(
		gameObject.gameSpeed * 10
	)
	// Hit observable is set to 1 second intervals to handle updating shipcollisionrecently. Aim is to give the ship some invulnerability time
	const hitObservable = Observable.interval(1000)
	hitObservable.subscribe(e => {
		if (ship.shipCollisionRecently) {
			ship.element.attr("style", "fill:white;stroke:black;stroke-width:1")

			ship.shipCollisionRecently = false
		}
	})
	// Observable to clean arrays every 4 seconds. Gives time between levels. Also makes it so I am not iterating through giant levels if a player
	// plays for some time
	const cleanArrayObservable = Observable.interval(4000)
	mainObservable.subscribe(e => {
		if (isDead(ship) && !gameOverElem.elem.innerHTML) {
			handleGameOver()
		}
	})
	// Filters if ship is dead
	delayedBulletObservable
		.filter(() => !isDead(ship))
		.subscribe(e => {
			if (movementObject[" "]) {
				bullets = bullets.concat(
					createBullet(ship.x, ship.y, ship.angle, svg, sounds)
				)
			}
		})

	cleanArrayObservable.subscribe(e => {
		cleanArrays(bullets, asteroids)
	})
	// Subscribes to the main observable to handle levels and performShipActions.
	mainObservable
		.filter(() => !isDead(ship))
		.subscribe(e => {
			handleLevels(asteroids, gameObject)
			performShipActions(movementObject, ship, svg)
			// To handle playing background sound after refreshing
			if (
				sounds.backgroundSound.paused &&
				sounds.backgroundSound.readyState >= 1
			) {
				playSound(sounds.backgroundSound)
			}
		})
	// Adds keydowns to the movementObject. Actions that wont be prevented by ship dying
	keydownObservable
		.filter(() => !isDead(ship))
		.subscribe(e => {
			if (e.key === " " && !movementObject[e.key]) {
				bullets = bullets.concat(
					createBullet(ship.x, ship.y, ship.angle, svg, sounds)
				)
			}
		})

	// Handles bullet movement
	mainObservable
		.filter(() => !isDead(ship))
		.subscribe(x => {
			// Goes through each bullet and performs logic to move it
			bullets.forEach(bullet => {
				//Impure function to move bullet element
				moveElem(bullet, 10, svg)
				// Impure function to handle checking collisions with asteroids and bullet timer
				handleBulletLogic(bullet, asteroids, svg)
			})
			asteroids.forEach(asteroid => {
				// Function that updates the asteroid. Impure function is called (Has sideeffects)
				moveElem(asteroid, parseInt(asteroid.attr("speed")), svg)
				const isActive = asteroid.attr("isActive")

				if (isActive === "true" && !isDead(ship)) {
					// Pure function.
					const hasCollision = rectCircleCollision(ship, asteroid)
					if (hasCollision) {
						if (!collisionRecently(ship)) {
							// Function that updates the asteroid. Impure function is called (Has sideeffects)
							handleShipCollision(ship)
						}
					}
				}
			})
		})

	// Adds keydowns to the movementObject. This is seperate from the other subscribe as Actions that wont be prevented by ship dying
	keydownObservable.subscribe(e => {
		movementObject[e.key] = true
		updateTextElem("", helperInstructions)
		const muted = gameObject.muted
		// m key for muting
		if (e.key === "m" && !muted) {
			gameObject.muted = true
			localStorage.setItem("muted", "true")
			muteSounds(sounds)
		} else if (e.key === "m" && muted) {
			localStorage.setItem("muted", "false")
			gameObject.muted = false
			unmuteSounds(sounds)
		} else if (e.key === "r") {
			resetGame()
		}
	})
	// Makes keys false in the movementObject so that they will no longer be called.
	keyupObservable.subscribe(e => {
		movementObject[e.key] = false
	})
	// mousedown subscribe to shoot bullets
	mouseDown
		.filter(() => !isDead(ship))
		.subscribe(x => {
			// instead of mutating bullets it creates a new bullet array
			bullets = bullets.concat(
				createBullet(ship.x, ship.y, ship.angle, svg, sounds)
			)
		})

	// Subscribe to update mouse angle based on cursor position.
	mouseMove.subscribe(x => {
		const actualX = x.x - ship.x
		const actualY = ship.y - x.y
		const calculatedAngle = toDegrees(Math.atan(actualX / actualY))
		const newAngle = actualY <= 0 ? 180 + calculatedAngle : calculatedAngle
		// Impure function to update ship angle
		updateShipAngle(ship, newAngle)
	})
	// Function calls other impure functions to update the score, highscore elements, etc
	// The function itself is not impure.
	const bulletAsteroidCollision = (
		bullet: Elem,
		asteroid: Elem,
		game: GameObject,
		canvas: HTMLElement
	) => {
		const newScore = game.score + 100
		// Mutates game score to be the new Score
		game.score = newScore
		// Updates the text elements to display the new score
		updateTextElem(createDisplayText("Score", newScore), scoreElem)
		updateTextElem(
			createDisplayText("Highscore", getAndSetHighscoreNumber(newScore)),
			highScoreElem
		)
		updateHighScoreLocation(highScoreElem, canvas)
		// Gets the asteroid number
		const asteroidNumber = parseInt(asteroid.attr("asteroidNumber"))
		// Emits sound based on asteroid number (Type)
		emitAsteroidSoundEffect(asteroidNumber, sounds)
		asteroidExplosionAnimation(asteroid)
		// If less than three it will spawn new smaller asteroids
		if (asteroidNumber < 3) {
			const currentX = parseInt(asteroid.attr("x"))
			const currentY = parseInt(asteroid.attr("y"))
			asteroids = createAsteroids({
				newAsteroidArray: asteroids,
				numberOfAsteroids: asteroidNumber * 2,
				x: currentX,
				y: currentY,
				gameLevel: gameObject.level,
				asteroidNumber: asteroidNumber + 1
			})
		}
		// Sets asteroid and bullet to inactive and removes from canvas
		setInactive(asteroid)
		setInactive(bullet)
	}

	// Impure function. Iterates through all the asteroids and checks for collision with bullet.
	// If there is a collision, marks both as inactive and calls bulletAsteroidCollision
	const handleBulletLogic = (
		bullet: Elem,
		asteroids: Elem[],
		canvas: HTMLElement
	) => {
		const currTimer = parseInt(bullet.attr("timer")) - 1
		const bulletActive = bullet.attr("isActive")
		if (currTimer <= 0 || bulletActive === "false") {
			// Remove bullet from canvas and return false to filter from array. Impure function call
			setInactive(bullet)
		}
		bullet.attr("timer", currTimer)
		asteroids.forEach((asteroid: Elem) => {
			const isActive = asteroid.attr("isActive")
			if (isActive !== "false" && bulletActive !== "false") {
				// Checks for collision between current bullet and asteroid.
				// Pure function
				const hasCollision = circleCollision(bullet, asteroid)
				// If there is a collision, updated score, remove bullet and asteroid. Set both to false.
				if (hasCollision) {
					bulletAsteroidCollision(
						bullet,
						asteroid,
						gameObject,
						canvas
					)
				}
			}
		})
	}
	// Impure function to display game over text.
	const handleGameOver = () => {
		// Removes and recreates the svg to make it so it is the topmost element
		resetInstructionsElem.elem.remove()
		gameOverElem.elem.remove()
		gameOverElem = new Elem(svg, "text")
			.attr("font-size", "100")
			.attr("fill", "red")
			.attr("x", svg.clientWidth / 2 - 300)
			.attr("y", svg.clientHeight / 2)
		resetInstructionsElem = new Elem(svg, "text")
			.attr("font-size", "20")
			.attr("fill", "white")
			.attr("x", svg.clientWidth / 2 - 100)
			.attr("y", svg.clientHeight / 2 + 50)
		updateTextElem("GAME OVER", gameOverElem)
		updateTextElem(resetInsturctions, resetInstructionsElem)
	}

	// Function that handles when the level should be updated. Condition is when asteroids array is empty. i.e all been destryoed by player
	const handleLevels = (currentAsteroids: Elem[], gameObject: GameObject) => {
		if (currentAsteroids.length === 0) {
			gameObject.level += 1
			// So the player has a second of invul after asteroids spawn
			ship.shipCollisionRecently = true
			// Updates level display
			updateTextElem(
				createDisplayText("Level", gameObject.level),
				levelElem
			)
			// Creates asteroids based on game level * 2.
			asteroids = createAsteroids({
				newAsteroidArray: asteroids,
				numberOfAsteroids: gameObject.level * 2,
				gameLevel: gameObject.level,
				asteroidNumber: 1
			})
		}
	}
	// Function to reset arrays, goes through each bullet and asteroid and marks inactive (removes and cleans up)
	// Then sets arrays to empty. Used to help reset game after death
	const resetArrays = (currentBullets: Elem[], currentAsteroids: Elem[]) => {
		currentBullets.forEach(bullet => {
			setInactive(bullet)
		})
		bullets = []
		asteroids.forEach(asteroid => {
			setInactive(asteroid)
		})
		asteroids = []
	}
	// Clean up arrays called every 4 seconds from a subscribe to clean up elements no longer needed.
	// i.e when the isActive for bullet and asteroid is set to false
	const cleanArrays = (currentBullets: Elem[], currentAsteroids: Elem[]) => {
		bullets = currentBullets.filter(bullet => {
			const isActive = bullet.attr("isActive")
			if (isActive === "false") {
				setInactive(bullet)
				return false
			}
			return true
		})
		asteroids = currentAsteroids.filter(asteroid => {
			const isActive = asteroid.attr("isActive")
			if (isActive === "false") {
				setInactive(asteroid)
				return false
			}
			return true
		})
	}
}
const updateHighScoreLocation = (highScoreElem: Elem, svg: Element) => {
	highScoreElem.attr(
		"x",
		//@ts-ignore
		svg.clientWidth - highScoreElem.elem.getBBox().width
	)
}
// Handles ship actions for movement.
const performShipActions = (
	movementActionObject: movementActionObject,
	ship: Ship,
	svgCanvas: HTMLElement
) => {
	for (var key in movementActionObject) {
		if (
			movementActionObject.hasOwnProperty(key) &&
			movementActionObject[key]
		) {
			const element = key
			if (
				element === "d" ||
				element === "a" ||
				element === "ArrowLeft" ||
				element === "ArrowRight"
			) {
				const direction =
					element === "d" || element === "ArrowRight" ? 1 : -1
				updateShipAngle(ship, ship.angle + direction * 10)
			} else if (element === "w" || element === "ArrowUp") {
				// Calculates angle based on position. Used trigonometry
				const angleInRadions = toRadions(ship.angle)
				const calculationX = ship.x + 10 * Math.sin(angleInRadions)
				const calculationY = ship.y - 10 * Math.cos(angleInRadions)

				// Impure function to update ship x and y values. wrap needs to wrap and x and y values to make sure they are correct
				updateShipPosition(
					ship,
					wrap(calculationX, "x", svgCanvas),
					wrap(calculationY, "y", svgCanvas)
				)
			}
		}
	}
}
// Pure Function to return if the ship has collided recently
const collisionRecently = (ship: Ship) => {
	return ship.shipCollisionRecently
}
//Impure function. Mutes all sounds
// Updates values in sound object
const muteSounds = (sounds: SoundObject) => {
	Object.values(sounds).forEach((sound: SoundType) => {
		sound.muted = true
	})
}

//Impure function. Unmutes all sounds
// Updates values in sound object
const unmuteSounds = (sounds: SoundObject) => {
	Object.values(sounds).forEach((sound: SoundType) => {
		sound.muted = false
	})
}

// Pure function, returns whether or not a triangle and circle have collided https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle For some of the maths required
const rectCircleCollision = (rect: Ship, circle: Elem): Boolean => {
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
		return true
	}
	if (cirleDistanceY <= rect.height / 2) {
		return true
	}

	const cornerDistance_sq =
		(circleDistanceX - rect.width / 2) ^
		(2 + (cirleDistanceY - rect.height / 2)) ^
		2
	return cornerDistance_sq <= (circleR ^ 2)
}

//  Pure function that calculates circler collision. Used https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection to work out maths required
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
		return true
	} else {
		return false
	}
}

// Pure function to generate translate string
function movement(x: number, y: number): string {
	return `translate(${x}, ${y})`
}
// Pure function to convert to radions for trig
function toRadions(angle: number): number {
	return angle * (Math.PI / 180)
}
// Pure function to convert to degrees for trig
function toDegrees(angle: number): number {
	return angle * (180 / Math.PI)
}
// Pure function to generate rotate string
function rotation(value: number): string {
	return `rotate (${value})`
}
// Pure function to get boolean value for if the ship is dead
function isDead(ship: Ship): boolean {
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
// Impure function. Mutates elemItem location using movement logic. Uses trigonometry
const moveElem = (elemItem: Elem, speed: number, canvas: HTMLElement): void => {
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
// Takes in a asteroid number and calls the play function for the correct asteroid sound
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
// Pure function to get Life text
const createShipLivesText = (lives: number) => {
	const life = " ❤️ "
	return `Life: ${life.repeat(lives)} `
}
// Pure function to get both highscore text, score text and level text. Reusable
const createDisplayText = (startingText: String, displayValue: number) => {
	return `${startingText}: ${displayValue} `
}

// Impure. Gets the highscore from the localstorage. If the currentscore is greater than the highscore it sets the highscore to the current score
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
// Updates score text. Impure.
const updateTextElem = (text: string, textElem: Elem) => {
	textElem.elem.innerHTML = text
}
//Impure. Sets an element to inactive by removing it and marking it as isActive false
const setInactive = (element: Elem) => {
	element.attr("isActive", "false")
	element.elem.remove()
}
// Takes any sound and calls the play function
const playSound = (sound: SoundType, time?: number) => {
	if (time !== undefined) {
		sound.currentTime = time
	}
	sound.play()
}

// TODO Finish Creates boss element and adds it to the canvas svg. Returns the asteroid
// const createBoss = ({ x, y, gameLevel, levelNumber }: bossInfo) => {
//     const svg = undefined
// 	const canvas: HTMLElement | null = document.getElementById("canvas")

// 	if (!canvas) throw "Couldn't get canvas element!"
// 	const canvasWidth = canvas.clientWidth
// 	const canvasHeight = canvas.clientHeight
// 	const asteroidX = x ? x : canvasWidth * Math.random()
// 	const asteroidY = y ? y : canvasHeight * Math.random()
// 	const speed = 5 * Math.random() * gameLevel
// 	const angle = 360 * Math.random()

// 	// make a group for the spaceship and a transform to move it and rotate it
// 	// to animate the spaceship you will update the transform property
// 	const g = new Elem(svg, "g").attr(
// 		"transform",
// 		"translate(300 300) rotate(0)"
// 	)
// 	// create a polygon shape for the space ship as a child of the transform group
// 	const shipElement = new Elem(svg, "polygon", g.elem)
// 		.attr("points", "-15,20 15,20 0,-20")
// 		.attr("shape", "triangle")
// 		.attr("vx1", "-15")
// 		.attr("vy1", "20")
// 		.attr("vx2", "15")
// 		.attr("vy2", "20")
// 		.attr("vx3", "0")
// 		.attr("vy3", "-20")
// 		.attr("style", "fill:white;stroke:black;stroke-width:1")

// 	const boss: Ship = {
// 		element: shipElement,
// 		gElem: g,
// 		width: 30,
// 		height: 30,
// 		x: 300,
// 		y: 300,
// 		angle: 0,
// 		dead: false,
// 		acceleration: 0.1,
// 		vel: { x: 0, y: 0 },
// 		lives: 3,
// 		shipCollisionRecently: true
// 	}

// 	return boss
// }
// PURE Recursive pure function to create an array of asteroids
const createAsteroids = ({
	newAsteroidArray,
	numberOfAsteroids,
	...rest
}: CreateAsteroidsType): Elem[] => {
	return numberOfAsteroids > 1
		? createAsteroids({
				newAsteroidArray: newAsteroidArray.concat(createAsteroid(rest)),
				numberOfAsteroids: numberOfAsteroids - 1,
				...rest
		  })
		: newAsteroidArray.concat(createAsteroid(rest))
}

const asteroidExplosionAnimation = (
	asteroid: Elem,
	explosionPieces: number = 5
) => {}

// Creates Asteroid element and adds it to the canvas svg. Returns the asteroid
function createAsteroid({ x, y, gameLevel, asteroidNumber }: CreateAsteroid) {
	const canvas: HTMLElement | null = document.getElementById("canvas")

	if (!canvas) throw "Couldn't get canvas element!"
	const canvasWidth = canvas.clientWidth
	const canvasHeight = canvas.clientHeight
	const asteroidX = x ? x : canvasWidth * Math.random()
	const asteroidY = y ? y : canvasHeight * Math.random()
	const speed = 5 * Math.random() * gameLevel
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

	return asteroid
}

// Creates a bullet on the canvas with the current direction of the ship. Returns the bullet
const createBullet = (
	shipX: number,
	shipY: number,
	shipAngle: number,
	svgCanvas: HTMLElement,
	sounds: SoundObject
) => {
	const bulletStartX = shipX
	const bulletStatY = shipY
	const bulletAngle = shipAngle
	playSound(sounds.shootSound, 0)
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
		.attr(
			"transform",
			movement(bulletStartX, bulletStatY) + rotation(bulletAngle)
		)
	return bullet
}
// Impure Function that sets the initial sound settings
const setSoundInitialSettings = (sounds: SoundObject) => {
	sounds.backgroundSound.src = "assets/backgroundSound.wav"
	sounds.backgroundSound.loop = true
	sounds.backgroundSound.volume = 0.4
	sounds.shootSound.src = "assets/shoot.wav"
	sounds.shipExplosionSound.src = "assets/explosion.wav"
	sounds.asteroidExplosionSound.src = "assets/asteroidExplosion.wav"
	sounds.smallAsteroidExplosion.src = "assets/smallerExplosion.wav"
}

// Impure function. Updates the ship position based on x y coordinates.
const updateShipPosition = (ship: Ship, x: number, y: number) => {
	ship.x = x
	ship.y = y
	ship.gElem.attr("transform", `${movement(x, y)} ${rotation(ship.angle)}`)
}
// Impure function. Updates the ship based on a given angle
const updateShipAngle = (ship: Ship, newAngle: number) => {
	ship.angle = newAngle
	ship.gElem.attr(
		"transform",
		movement(ship.x, ship.y) + rotation(ship.angle)
	)
}

const shakingElements: Array<any> = []

//The `randomInt` helper function
const randomInt = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

type ShakeType = {
	magnitude: number
	element: any
	magnitudeUnit: number
    counter: number,
    numberOfShakes: number
}
type AngularShake = ShakeType & {
	tiltAngle: number
	startAngle: number
}

type UpAndDown = ShakeType & {
	startX: number
	startY: number
}

//The `upAndDownShake` function
const upAndDownShake = (shakeObject: UpAndDown) => {
	const {
		startX,
		startY,
		magnitude,
        magnitudeUnit,
        numberOfShakes,
		element,
		counter
	} = shakeObject
	const currentMagnitude = magnitude
	//Reset the element's position at the start of each shake
	element.style.transform = "translate(" + startX + "px, " + startY + "px)"

	//Reduce the magnitude
	const newMagnitude = currentMagnitude - magnitudeUnit

	//Randomly change the element's position
	var randomX = randomInt(-newMagnitude, newMagnitude)
	var randomY = randomInt(-newMagnitude, newMagnitude)

	element.style.transform = "translate(" + randomX + "px, " + randomY + "px)"
	requestAnimationFrame(() =>
		upAndDownShake({
			...shakeObject,
			magnitude: newMagnitude,
			counter: counter + 1
		})
	)
	if (counter >= numberOfShakes) {
		element.style.transform =
			"translate(" + startX + "px, " + startY + "px)"
		shakingElements.splice(shakingElements.indexOf(element), 1)
	}
}
const angularShake = (shakeObject: AngularShake) => {
	//Reset the element's rotation
	const {
		element,
		startAngle,
        magnitudeUnit,
        numberOfShakes,
		magnitude,
		counter,
		tiltAngle
	} = shakeObject
	element.style.transform = "rotate(" + startAngle + "deg)"

	//Reduce the magnitude
	const newMagnitude = magnitude - magnitudeUnit

	//Rotate the element left or right, depending on the direction,
	//by an amount in radians that matches the magnitude
	var angle = Number(magnitude * tiltAngle).toFixed(2)
	console.log(angle)
	element.style.transform = "rotate(" + angle + "deg)"

	//Reverse the tilt angle so that the element is tilted
	//in the opposite direction for the next shake
	const newTiltAngle = tiltAngle * -1

	requestAnimationFrame(() =>
		angularShake({
			...shakeObject,
			tiltAngle: newTiltAngle,
			magnitude: newMagnitude,
			counter: counter + 1
		})
	)
	if (counter >= numberOfShakes) {
		element.style.transform = "rotate(" + startAngle + "deg)"
		shakingElements.splice(shakingElements.indexOf(element), 1)
	}
}
// Modified shake function afom here https://stackoverflow.com/questions/36962903/javascript-shake-html-element
const shake = function(element: HTMLElement, magnitude = 16, angular = false) {
	//First set the initial tilt angle to the right (+1)
	const tiltAngle = 1

	//The total number of shakes (there will be 1 shake per frame)
	const numberOfShakes = 15

	//Capture the element's position and angle so you can
	//restore them after the shaking has finished
	const startX = 0,
		startY = 0,
		startAngle = 0

	// Divide the magnitude into 10 units so that you can
	// reduce the amount of shake by 10 percent each frame
	const magnitudeUnit = magnitude / numberOfShakes
	//The `angularShake` function

	//Add the element to the `shakingElements` array if it
	//isn't already there
	if (shakingElements.indexOf(element) === -1) {
		shakingElements.push(element)

		//Add an `updateShake` method to the element.
		//The `updateShake` method will be called each frame
		//in the game loop. The shake effect type can be either
		//up and down (x/y shaking) or angular (rotational shaking).
		if (angular) {
			angularShake({
				counter: 1,
				magnitude,
				element,
				tiltAngle,
				startAngle,
                magnitudeUnit,
                numberOfShakes
			})
		} else {
			upAndDownShake({
				counter: 1,
				magnitude,
				element,
				startX,
				startY,
                magnitudeUnit,
                numberOfShakes
			})
		}
		//When the shaking is finished, reset the element's angle and
		//remove it from the `shakingElements` array
	}
}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != "undefined") {
	window.onload = () => {
		asteroids()
	}
}
