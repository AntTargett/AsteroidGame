# AsteroidGame
## GAME DOCUMENTATION
Game created is the asteroids game with some extended featues
Current features include, Shooting asteroids, Being hit by asteroids, Lives, Score, Highscore, Sound effects, Muting sound effects, Levels, wrapping of the space world,
being able to use WAD and arrow keys for movement as well as mouse for aiming and shooting.
Highscore works by storing the highest score in local storage and retreiving it when the user visits the page.
Sound effects work by loading in various sound effects, storing them in a sound object and calling it when required.
HandleLevels works by being called on the MainObservableInterval and checks to see if all asteroids have been destroyed.
If they have, the GameObject will be changed (i.e increase the level variable) which will then be used to determine speed of asteroid range, as well as
number of asteroids, etc.
Lives work by essentially being number of hits taken. Stored in the Ship Object. Decreases by 1 when hit. There is a grace period of 1 second after being hit
This works by having a 1 second interval that checks if the Ship has been hit, will update a variable after the one second interval goes off.
Alongside this, I used the advice given by Tim to use an Object to store key downs until key ups. This allows me to perform actions for multiple key presses
Such as moving and turning and shooting and moving.

In terms of using Functional Programming.
The application aims to use Functional Programming techniques, by trying to  restrict side-effects to the subscribe() call.
Functions that are impure are either called in subscribe or a function call from the function inside the subscribe
Alongisde this, I aimed to use pure functions where possible as well as make them as reusable as possible.
Generics where mostly not required for the functionality required.
Used ideas from lecture to limit amount of mutated logic required. See CreateAsteroids recursive function to create an asteroid array.
Tried to use pure functions where possible to generate strings. 
Also used functions to split up logic and for Seperation of concerns. 
Also tried to apply DRY principle by creating functions for repated code. 

NOTE: Would refactor to different files. Thought it would be easier to leave in one file for marking, etc. 