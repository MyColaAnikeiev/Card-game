import { 
    attack, 
    canBeat, 
    clearBattleground, 
    computerCanAttackWith, 
    getCardRepetitions, 
    getSmallestThatCanBeat, 
    playerCanAttackWith, 
    refillHands, 
    sortCards, 
    takeAllFromBattleground 
} from "./helpers";

import { 
    GameState, 
    PlayerAction 
} from "./interfaces_and_types";


export function gameLogic(state: GameState, inputs: PlayerAction){
    // Check for conclusion
    if(!state.deck.length && !state.battleground.length){
        if(!state.playerHand.length && !state.computerHand.length){
            state.gameStage = 'draw';
        }else if(state.computerHand.length && !state.playerHand.length){
            state.gameStage = 'win';
        }else if(!state.computerHand.length && state.playerHand.length){
            state.gameStage = 'loose';
        }
    }

    if(state.gameStage != 'game'){
        return;
    }

    if(state.playerTurn){
        playerTurn(state, inputs);
    }else{
        computerTurn(state, inputs);
    }
}

function playerTurn(state: GameState, inputs: PlayerAction){
    

    const cards = playerCanAttackWith(state); 

    if(inputs.type == 'card'){
        const card = state.playerHand[inputs.index];
        if(cards.includes(card)){
            attack(state.playerHand, inputs.index, state.battleground);
        }
    }

    //const canAttack = cards.length > 0;
    if(inputs.type == 'take'){
        if(state.battleground.every((couple) => couple.bottom_card)){
            clearBattleground(state);
            refillHands(state);
            sortCards(state.playerHand, state.trump);
            state.playerTurn = false;
            return;
        }        
    }

    if(state.battleground.length){
        computerDefending(state);
    }
}
function computerTurn(state: GameState, inputs: PlayerAction){
    computerAttacking(state);

    playerDefending(state, inputs);
}

function playerDefending(state: GameState, inputs: PlayerAction){
    if(inputs.type == 'card'){
        const card = state.playerHand[inputs.index];
        const beated = state.battleground.find((couple, ind) => {
            if(couple.bottom_card){
                return false;
            }

            if(canBeat(couple.top_card, card, state.trump)){
                couple.bottom_card = card;
                state.playerHand.splice(inputs.index,1);
                return true;
            }
        })
    }else if(inputs.type == 'take'){
        takeAllFromBattleground(state.battleground, state.playerHand);
        refillHands(state);
        sortCards(state.playerHand, state.trump);
    }
}

function computerAttacking(state: GameState){
    sortCards(state.computerHand, state.trump);
        
    if(state.battleground.length == 0){
        const sameRank = getCardRepetitions(state.computerHand);
        if(state.computerHand.length == 0){
            return;
        }
        
        // Of two smallest rank sequences choose longest. 
        if(sameRank.length > 1 && sameRank[1] > sameRank[0]){
            attack(state.computerHand, sameRank[0], state.battleground);
        }else{
            attack(state.computerHand,0, state.battleground);
        }

    }else{

        const attackCards = computerCanAttackWith(state);
        const attacked = state.computerHand.find((card, ind) => {
            if(attackCards.includes(card)){
                attack(state.computerHand, ind, state.battleground);
                return true;
            }
            return false;
        })

        // If can't attack
        if(!attacked){
            // If all cards are beaten 
            if(state.battleground.every(couple => couple.bottom_card)){
                state.battleground = [];
                refillHands(state);
                sortCards(state.playerHand, state.trump);
                state.playerTurn = true;
                return;
            }
        }
    }
}


function computerDefending(state: GameState){
    const { battleground } = state;

    const ind = battleground.findIndex(couple => !couple.bottom_card);
    if(ind == -1){ // Nothing to beat
        return;
    }

    const { top_card } = battleground[ind]
    const card = getSmallestThatCanBeat(top_card, state.computerHand, state.trump);
            
    if(card){
        const cardInd = state.computerHand.indexOf(card);
        battleground[ind].bottom_card = card;
        state.computerHand.splice(cardInd, 1);
    }else{
        takeAllFromBattleground(battleground, state.computerHand);
        refillHands(state);
    }

}



