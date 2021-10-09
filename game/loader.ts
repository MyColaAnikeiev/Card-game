import { 
    bufferCount,
    combineLatest, 
    finalize, 
    from,
    map,
    mergeMap, 
    Observable, 
    of,
    tap
} from "rxjs";
import { imageSourcesFolder } from "./game_constants";
import { ImageLoaderData } from "./interfaces_and_types";


const path = imageSourcesFolder;
const list = [
    "bg1.jpeg",
    "bg2.jpeg",
    'cards.png',
    'replay.png'
]


export function loadImages(): Observable<ImageLoaderData>{

    return of(...list).pipe(
        mergeMap(filename => combineLatest([
            of(getBasename(filename)),
            from(fetch(path+filename))
        ])),
        mergeMap(([name,res]) => combineLatest([
            of(name),
            from(res.blob())
        ])),
        map(([name, blob]) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            return [name, img]
        }),
        bufferCount(list.length),
        map(arr => Object.fromEntries(arr))
    )
}

function getBasename(filename: string){
    return filename.split('.')[0];
}