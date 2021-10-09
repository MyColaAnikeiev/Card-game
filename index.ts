import { getGame } from "./game/game";

// Quick guide:
//   Provide canvas element selector, and subscribe.
//   Canvas should have width and height width 3/2 ratio or similar. (Could
//   be changed in 'game_constants.ts' but because of my not very bright idea 
//   it's pain in ass to do now.)
//  
//   Also unsubscription is needed if you for some reason want to
//   delete game from page, it should I hope to clean after itself.


const sub = getGame('#gameCanvas').subscribe(console.log);