import { BattleItem, Card, CardSuite, GameState } from "./interfaces_and_types";


// Generate new game state: shaffle deck, destribute cards among players etc.
export function newGameState(): GameState{
    const deck: Card[] = getDeck();
    const playerHand: Card[] = []
    const computerHand: Card[] = []

    // Shuffle
    for(let i = 0; i < 3; i++){
        deck.sort(() => Math.random() * 2 - 1 );
    }

    for(let i = 0; i < 6; i++){
        playerHand.push(deck.pop());
        computerHand.push(deck.pop());
    }

    sortCards(playerHand, deck[0].suite);
    sortCards(computerHand, deck[0].suite);

    return { 
        deck, 
        playerHand, 
        computerHand,
        playerTurn: Math.random() > 0.5 ? true : false,
        battleground: [],
        trump: deck[0].suite,
        gameStage: 'game'
    }
}

// Get not shuffled card deck
export function getDeck(): Card[]{
    const deck : Card[] = [];
    for(let i = 2; i <= 14; i++){
        const suites: Array<CardSuite> = ['hearts', 'clubs', 'diamonds', 'spades'];
        suites.forEach((suite) => {
            deck.push({
                suite: suite,
                rank: i
            })
        })
    }

    return deck;
}


export function sortCards(hand: Card[], trump: CardSuite){
    hand.sort((a, b) => {
        if(a.rank == b.rank && a.suite != trump && b.suite != trump){
            return 0;
        }

        if(a == getSmallest([a,b],trump)){
            return -1;
        }else{
            return 1;
        }
    })
}

// Return smallest card in hand
export function getSmallest(hand: Card[], trump: CardSuite): Card | null{
    if(hand.length == 0){
        return null;
    }

    let smallest: Card | null = hand[0];
    
    hand.forEach(card => {

        if(smallest.suite == trump && card.suite == trump){
            if(smallest.rank > card.rank){
                smallest = card;
            }
        }else if(smallest.suite == trump){
            smallest = card;
        }else if(card.suite != trump){
            if(smallest.rank > card.rank){
                smallest = card;
            }
        }
    })

    return smallest;
}

export function attack(hand: Card[], ind: number, battleground: BattleItem[]){
    battleground.push({ 
        top_card: hand.splice(ind, 1)[0], 
        bottom_card: null } 
    );
}

export function refillHands(state: GameState){
    const {deck} = state;
    if(state.playerTurn){
        refillHand(deck, state.playerHand);
        refillHand(deck, state.computerHand);
    }else{
        refillHand(deck, state.computerHand);
        refillHand(deck, state.playerHand);
    }
}

function refillHand(deck: Card[], hand: Card[]){
    const deckLen = deck.length;
    const handLen = hand.length;
    for(let i = 0; i < Math.min(6 - handLen, deckLen); i++){
        hand.push(deck.pop());
    }
}

// Counts repeating ranks. 
// If for examplehand starts with two 10-ths and 3 Kings 
// then export function should return array such as [2,3,...]
export function  getCardRepetitions(cards: Card[]){
    const sameRank = cards.reduce((acum, card) => {
        if(acum.last != card){
            acum.arr.push(1);
        }else{
            acum.arr[acum.arr.length]++;
        }

        return acum;
    },{arr: [], last: null});

    return sameRank.arr;
}


export function takeAllFromBattleground(battleground: BattleItem[], hand: Card[]){
    battleground.forEach((couple) => {
        hand.push(couple.top_card);
        if(couple.bottom_card){
            hand.push(couple.bottom_card);
        }
    })

    battleground.splice(0, battleground.length);
}


export function getSmallestThatCanBeat(card: Card, hand: Card[], trump: CardSuite){
    let smalest: Card | null = null;
    
    hand.forEach(handCard => {
        if(canBeat(card, handCard, trump)){
            if(!smalest){
                smalest = handCard;
            }else if(canBeat(handCard, smalest, trump)){
                smalest = handCard
            }
        }
    })

    return smalest;
}

export function canBeat(defender: Card, attaker: Card, trump: CardSuite): boolean{
    if(defender.suite == trump && attaker.suite == trump){
        return defender.rank < attaker.rank
    }
    if(attaker.suite == trump){
        return true;
    }
    if(attaker.suite != defender.suite){
        return false;
    }

    return defender.rank < attaker.rank;
}

export function computerCanAttackWith(state: GameState): Card[]{
    return state.computerHand.filter(card => canAttack(state, card));
}
export function playerCanAttackWith(state: GameState): Card[]{
    return state.playerHand.filter(card => canAttack(state, card));
}

export function canAttack(state: GameState, card: Card): boolean{
    // Check if other parth has enough cards in hand
    const notBeaten = state.battleground.reduce((count,couple) => {
        if(!couple.bottom_card){
            count++;
        }
        return count;
    }, 0)
    const defenderCardsLeft = state.playerTurn ? state.computerHand.length : state.playerHand.length;
    if(defenderCardsLeft - notBeaten < 1){
        return false;
    }

    // If just starting to attack
    if(state.battleground.length == 0){
        return true;
    }else{
        return state.battleground.some((couple) => {
            if(couple.top_card.rank == card.rank){
                return true;
            }

            if(couple.bottom_card && couple.bottom_card.rank == card.rank){
                return true;
            }

            return false;
        })
    }
}

export function clearBattleground(state: GameState){
    state.battleground = [];
}