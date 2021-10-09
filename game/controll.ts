import { 
    combineLatest, 
    fromEvent, 
    interval, 
    map, 
    mapTo, 
    merge, 
    Observable, 
    of, 
    startWith, 
    switchMap 
} from 'rxjs';
import { 
    BATTLEGROUND, 
    CARD_SIZE, 
    MAX_GAP_BEETWEN_CARDS, 
    PLAYER_HAND, 
    REPLAY_BTN 
} from './game_constants';
import { 
    ActionType, 
    AreaBox, 
    Card, 
    GameState, 
    PlayerAction, 
    Position 
} from './interfaces_and_types';


function getCanvasClickStream(canvas_selector: string){
    const canvas = document.querySelector(canvas_selector);

    const canvasClick$ = fromEvent(canvas, 'click')
        .pipe(
            map((evt: MouseEvent) => {
                const {width, height, top, left} = (<HTMLElement>evt.target).getBoundingClientRect();
                const x = (evt.clientX -  left) / width;
                const y = (evt.clientY - top) / height;
                return { x, y }
            })
        )

    return canvasClick$;
}


export function getUserInputStream(
    game_state: GameState, 
    canvas_selector: string 
): Observable<PlayerAction> {

   return combineLatest([of(game_state), getCanvasClickStream(canvas_selector)])
    .pipe(
        map(([state, pos]): PlayerAction  => {
            // Click on player hand card
            const ind = selectedCard(state.playerHand, pos, PLAYER_HAND);
            if(ind != -1){
                return { type: 'card', index: ind }
            }

            // Click on battleground card
            const battlegroundCards = state.battleground.map(couple => couple.top_card);
            if(selectedCard(battlegroundCards, pos, BATTLEGROUND) != -1){
                return { type: 'take', index: 0};
            }

            const btnType = checkForBtn(pos);
            if(btnType != null){
                return { type: btnType, index: 0};
            }

            return { type: 'missclick', index: 0 }
        }),
        startWith(<PlayerAction>{ type: 'missclick', index: 0 }),
        switchMap((action ) => {
            const interval$ = (<Observable<PlayerAction>>interval(200)
            .pipe(mapTo(<PlayerAction>{ type: 'impulse', index: 0})))

            return merge (of(action), interval$);
        })
    )

}


function isInsideABox(pos: Position, box: AreaBox): boolean{
    if( box.x > pos.x || box.x + box.width < pos.x ||
        box.y > pos.y || box.y + box.height < pos.y )
    {
        return false;
    }else{
        return true;
    }
}

// returns index or -1 if not found
function selectedCard(cards: Card[], pos: Position, handPosition: AreaBox): number{
    if( cards.length == 0 || !isInsideABox(pos, handPosition))
    {
        return -1; 
    }

    // Case when one card
    if(cards.length == 1){
        const diff = pos.x - handPosition.x;
        if(diff <= CARD_SIZE.width){
            return 0;
        }
    }

    const filled = handPosition.width / CARD_SIZE.width;
    // if player cards not overlaping
    if(filled >= cards.length){
        const diff = pos.x - handPosition.x;
        let gap = (handPosition.width - CARD_SIZE.width*cards.length) / 
            (cards.length-1);
        if(gap > CARD_SIZE.width * MAX_GAP_BEETWEN_CARDS){
            gap = CARD_SIZE.width * MAX_GAP_BEETWEN_CARDS;
        }
        const ind = Math.floor(diff / (CARD_SIZE.width + gap));
        // See if it's not a gap
        if(diff - ind*(CARD_SIZE.width+gap) > CARD_SIZE.width){
            return -1;
        }
        else if(ind >= cards.length){
            return -1;
        }else{
            return ind;
        }
    // if cards overlaping
    }else{
        // last card is completely visible
        const diff = pos.x - handPosition.x;
        const subSize = (handPosition.width - CARD_SIZE.width) / (cards.length-1);
        const ind = Math.floor(diff / subSize);
        return ind >= cards.length-1 ? cards.length-1 : ind;
    }

}

function checkForBtn(pos: Position): ActionType | null{
    if(isInsideABox(pos, REPLAY_BTN)){
        return 'replay button';
    }

    return null;
}