import { 
    combineLatest, 
    distinct, 
    filter, 
    finalize, 
    map, 
    Observable, 
    of, 
    startWith, 
    Subject, 
    switchMap, 
    tap 
} from "rxjs";
import { getUserInputStream } from "./controll";
import { gameLogic } from "./game_logic";
import { newGameState } from "./helpers";
import { ImageLoaderData } from "./interfaces_and_types";
import { loadImages } from "./loader";
import { Renderer } from "./renderer";


export function getGame(canvas_selector: string): Observable<string>{
    const new_game$ = new Subject<number>();
    const renderer = new Renderer(canvas_selector);
    let loaded_images: ImageLoaderData;

    const game$ = combineLatest([
        new_game$.pipe(startWith(0)),
        loadImages()
    ]).pipe(
        switchMap(([_, images]) => {
            const game_state = newGameState();
            loaded_images = images;

            return combineLatest([
                of(game_state),
                of(images),
                getUserInputStream(game_state, canvas_selector)
            ])
        }),
        filter(([game_state, images, inputs]) => {
            if(inputs.type == 'replay button'){
                new_game$.next(0);
                return false;
            }

            return true;
        }),
        tap(([game_state, images, inputs]) => {
            gameLogic(game_state, inputs);
        }),
        tap(([game_state, images, inputs]) => {
            renderer.draw(game_state, images)
        }),
        map(([game_state, _, __]) => {
            return game_state.gameStage;
        }),
        distinct(),
        // Revoke loaded images
        finalize(() => {
            for(let key in loaded_images){
                URL.revokeObjectURL(loaded_images[key].src);
            }
            console.log("Cleaned");
        })
    )

    return game$;
}