# AsteroidGame

Basic Asteroid game created for Universtiy assignment. 

Written in Pure Typescript utilising the FRP (Functional Reactive Programming) paradigm. 

Uses Rollup for packaging the game. 

[Click here to play](https://anttargett.github.io/AsteroidGame/)

To run locally 

``` npm run watch ```

Then open index.html in a browswer. 

### Features
- Sound effects
- Lives
- Highscores (Local Storage) 


## Future Features
- [ ] Add proper physics 
- [ ] Clean up code 
- [ ] Get images working
- [ ] Add tests
- [ ] Create NPM module

## Other Notes (Kept from assignment Submission) 

In terms of using Functional Programming.
The application aims to use Functional Programming techniques, by trying to  restrict side-effects to the subscribe() call.
Functions that are impure are either called in subscribe or a function call from the function inside the subscribe
Alongisde this, I aimed to use pure functions where possible as well as make them as reusable as possible.
Generics were mostly not required for the functionality required.
Used ideas from lecture to limit amount of mutated logic required. See CreateAsteroids recursive function to create an asteroid array.
Tried to use pure functions where possible to generate strings. 
Also used functions to split up logic and for Seperation of concerns. 
Also tried to apply DRY principle by creating functions for repated code. 

NOTE: Would refactor to different files. Thought it would be easier to leave in one file for marking, etc. 
