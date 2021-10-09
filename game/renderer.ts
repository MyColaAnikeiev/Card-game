import { 
    BATTLEGROUND, 
    BATTLEGROUND_SHIFT, 
    CARD_SIZE, 
    COMPUTER_CARDS, 
    MAX_GAP_BEETWEN_CARDS, 
    PLAYER_HAND, 
    REPLAY_BTN, 
    TRUMP_POSITION 
} from "./game_constants";
import { 
    AreaBox, 
    BattleItem, 
    Card, 
    ClipingArea, 
    GameState, 
    Position 
} from "./interfaces_and_types";

export class Renderer{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private canvasSizes: DOMRect;
    private background: string;

    constructor(canvasSeletor: string){
        this.canvas = document.querySelector(canvasSeletor);
        this.ctx = this.canvas.getContext('2d');
        this.background = Math.random() > 0.5 ? 'bg1' : 'bg2';
    }

    draw(state: GameState, images: { [key:string] : HTMLImageElement }){
        this.canvasSizes = this.canvas.getBoundingClientRect();
        const cardsImg = images['cards'];

        this.drawBackground(images[this.background]);
        
        // Computer Cards
        this.putHand(
            images['cards'], 
            this.getClipingAreaSequence(state.computerHand, true), 
            COMPUTER_CARDS
        )

        this.drawBattleground(cardsImg, state.battleground);

        this.drawDeck(cardsImg, state.deck);

        // Player Cards
        this.putHand(
            cardsImg, 
            this.getClipingAreaSequence(state.playerHand), 
            PLAYER_HAND
        )

        this.drawButtonImage(images['replay'], REPLAY_BTN);

        if(state.gameStage == 'game'){
            const turn = state.playerTurn ? 'Ваш хід' : 'Хід опонента';
            this.drawText(turn, 32, {x: 0.47, y:0.67});
        }else{
            const stage = state.gameStage
            const msgs= { 'draw': 'Нічия!', 'win': 'Ви виграли!', 'loose': 'Ви програли!' }
            this.drawText(msgs[stage],40, {x: 0.5, y:0.5})
        }
    }

    drawText(text: string, size: number, pos: Position){
        const {width: cw, height: ch} = this.canvasSizes;
        const absolutePos: [number, number] = [cw*pos.x, ch* pos.y];
        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#808080';
        this.ctx.fillText(text, ...absolutePos);
    }

    drawButtonImage(img: HTMLImageElement, pos: AreaBox){
        const {width, height} = img;
        const clip: ClipingArea = { x:0, y:0, width, height};
        this.putImage(img, clip, pos);
    }

    drawDeck(img: HTMLImageElement, deck: Card[]){
        const seq = this.getClipingAreaSequence([deck[0]]);
        const pos: AreaBox = {
            ...TRUMP_POSITION,
            ...CARD_SIZE
        }
        // This will draw last card which also is trump
        this.putHand(img, seq, pos);

        // Draw deck on top of trump card
        // With hidden=true we will get backside of card
        const backside = this.getClipingAreaSequence([deck[0]], true);
        pos.x = 0; pos.y = 0;
        const {width: cw, height: ch} = this.canvasSizes;
        for(let i = 0; i < deck.length - 1; i++){
            this.ctx.save();
            this.ctx.translate(
                cw*(TRUMP_POSITION.x - 0.023),
                ch*(TRUMP_POSITION.y + 0.25))
            this.ctx.rotate(Math.PI * -0.5);   
            this.putImage(img,backside[0], pos),
            pos.x -= 0.001;
            pos.y += 0.0003;
            this.ctx.restore();
        }
    }

    drawBattleground(img: HTMLImageElement, battleground: BattleItem[]){
        const top_seq = this.getClipingAreaSequence(
            battleground.map(item => item.top_card)
        );
        const bottom_seq = this.getClipingAreaSequence(
            battleground.map(item => item.bottom_card)
        )

        const topCardsShift = this.putHand(img, top_seq, BATTLEGROUND);
        const SHIFTED_BUTTLEGROUND: AreaBox = {
            x: BATTLEGROUND.x + BATTLEGROUND_SHIFT.x,
            y: BATTLEGROUND.y + BATTLEGROUND_SHIFT.y,
            width: BATTLEGROUND.width,
            height: BATTLEGROUND.height
        }
        this.putHand(img, bottom_seq, SHIFTED_BUTTLEGROUND);
    }

    drawBackground(bg: HTMLImageElement){
        const bgClipArea: ClipingArea = { 
            x:0, y: 0, 
            width: bg.width, height: bg.height 
        };
        const drawArea: AreaBox = { x:0 ,y: 0, width: 1.0, height: 1.0 };
        this.putImage(bg, bgClipArea, drawArea);
    }

    putImage(img: HTMLImageElement, clipingRegion: ClipingArea, pos: AreaBox){
        const {width: cw, height: ch } = this.canvasSizes;
        this.ctx.drawImage(img, 
            clipingRegion.x, clipingRegion.y, 
            clipingRegion.width, clipingRegion.height,
            pos.x*cw, pos.y*ch,
            (pos.width)*cw, (pos.height)*ch)
    }

    // Mapings card type to 'img/cards.png'
    getClipingAreaSequence(cards: Card[], hidden: boolean = false): ClipingArea[]{
        const width = 960 / 13;
        const height = 575 / 5;
        const cardSuiteToYIndexMap: { [key: string] : number } = {
            'hearts': 2,
            'clubs' : 0,
            'diamonds' : 1,
            'spades' : 3
        }

        const clipingAreas = [];

        if(hidden){
            const backside: ClipingArea = {
                x: width * 2, y: height * 4,
                width, height
            }
            cards.forEach(() => clipingAreas.push(backside));
        }else{
            cards.forEach(card => {
                if(!card){
                    clipingAreas.push({x:0,y:0,width:0,height:0});
                    return;
                }

                // Default to 'A' which for some reason is put at begining,
                let x = 0;
                let y = height * cardSuiteToYIndexMap[card.suite];

                if(card.rank <= 13){
                    x = width * (card.rank - 1);
                }

                clipingAreas.push({x,y,width,height});
            })
        }

        return clipingAreas;
    }

    putHand(
        img: HTMLImageElement, 
        clipingSeq: ClipingArea[], 
        handPos: AreaBox, 
        forcedCardShift: number = -1
    ){
        const cards = clipingSeq.length;
        const subArea = handPos.width - CARD_SIZE.width;
        let cardXShift = cards > 1 ? subArea / (cards-1) : 0;
        if(cardXShift > CARD_SIZE.width * (1 + MAX_GAP_BEETWEN_CARDS)){
            cardXShift = CARD_SIZE.width * (1 + MAX_GAP_BEETWEN_CARDS);
        }

        if(forcedCardShift != -1){
            cardXShift = forcedCardShift;
        }

        const {width, height} = CARD_SIZE;
        clipingSeq.forEach((cl, ind) => {
            if(cl.height == 0 || cl.height == 0){
                return;
            }

            const box: AreaBox = {
                x: handPos.x + cardXShift * ind,
                y: handPos.y,
                width, height
            }
            this.putImage(img, cl, box);
        })

        return cardXShift;
    }
}