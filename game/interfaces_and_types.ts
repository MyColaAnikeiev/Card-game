export type ImageLoaderData = {
    [key: string]: HTMLImageElement
}

// Sizes are normalized relative to canvas size unless stated otherwise
export type Position = {
    x: number,
    y: number
}

// sizes in pixels
export type ClipingArea = {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type ActionType = 'card' | 'take' | 'replay button' | 'missclick' | 'impulse';
export interface PlayerAction{
    type: ActionType, 
    index: number
}
export type CardSuite = 'hearts' | 'clubs' | 'diamonds' | 'spades';
export interface Card{
    suite: CardSuite;
    rank: number;
}

export interface BattleItem {
    bottom_card: Card;
    top_card: Card | null
}

export type GameStage = 'game' | 'draw' | 'win' | 'loose';
export interface GameState{
    deck: Card[],
    playerHand: Card[],
    computerHand: Card[],
    playerTurn: boolean,
    battleground: BattleItem[],
    trump: CardSuite,
    gameStage: GameStage
}

export type AreaBox = {
    x: number,
    y: number,
    width: number,
    height: number
}

export type ImageDataItem = [string, Blob];
export type GameImageData = ImageDataItem[];