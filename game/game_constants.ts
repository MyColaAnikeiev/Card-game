import { AreaBox, Position } from "./interfaces_and_types"

export const imageSourcesFolder = './game/img/';


// All sizes below is normalized relative to canvas size
export const CARD_SIZE = {
    width: 0.1,
    height: 0.22
}
export const MAX_GAP_BEETWEN_CARDS = 0.1;

export const PLAYER_HAND: AreaBox = {
    x: 0.04,
    y: 0.7,
    width: 0.8,
    height: CARD_SIZE.height
}
export const COMPUTER_CARDS: AreaBox = {
    x: 0.04,
    y: 0.05,
    width: 0.8,
    height: CARD_SIZE.height
}
export const BATTLEGROUND: AreaBox = {
    x: 0.07,
    y: 0.34,
    width: 0.7,
    height: CARD_SIZE.height
}
export const BATTLEGROUND_SHIFT: Position = {
    x: 0.015,
    y: 0.045
}

export const REPLAY_BTN: AreaBox = {
    x: 0.93,
    y: 0.02,
    width: 0.055,
    height: 0.08
}
export const TRUMP_POSITION: Position = {
    x: 0.82,
    y: 0.30
}