import positionVector, { inverse_select } from "./positionVector";
import intervalVector from "./intervalVector";
import { modulo } from "./utility";
import { minRotation} from "./distances";
import { chord } from "./chord";

const noteItaliane: string[] = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const noteInglesi: string[]= ["C", "D", "E", "F", "G", "A", "B"];



export function scaleNames(scala: positionVector, ita: boolean = true) {
  let cMaj = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 12);
  let a = minRotation(scala, cMaj); 

    //sto supponendo che entrambe le scale sia di uguale lunghezza
    
    let trasp1 = cMaj.rototranslate(a,7,false);  //forse c'è un modo migliore che mettere 7
    let trasp2 = cMaj.rototranslate(a+1,7,false);
    
    let n = trasp1.data.map((value, index) => value - scala.data[index]);  // differenza lineare tra due vettori
    let m = trasp2.data.map((value, index) => value - scala.data[index]);
    let sum_n = n.reduce((acc, val) => acc + val, 0); //somma delle differenze 
    let sum_m = m.reduce((acc, val) => acc + val, 0);
    let dorototraslata: positionVector;
    if (Math.abs(sum_n) < Math.abs(sum_m)) { 
      dorototraslata = trasp1;
    } else {
    a = a + 1;
    dorototraslata = trasp2;
  }
  
  //l'algoritmo che porta a questo potrebbe essere ottimizzato
  let nomi: string[] = [];

  for (let i = 0; i < scala.data.length; i++) {
    let diff = scala.data[i] - dorototraslata.data[i]; // Calcola la differenza senza modulo
    let nome: string;

    if (ita == true){
    nome = noteItaliane[modulo(a + i, 7)];
    }
    else {nome = noteInglesi[modulo(a + i, 7)]}
    if (diff > 0) {
      for (let j = 0; j < diff; j++) {
        nome += "#";
      }
    } else if (diff < 0) {
      for (let j = 0; j < -diff; j++) {
        nome += "b";
      }
    }
    nomi.push(nome);
  }
  return nomi;  
}

/**
 * funzione per visualizzare web chord notes
 */
let scala = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 12);
let chordNotes = chord({scala: scala});

let index_chord = inverse_select(chordNotes, scala);

let nomi_scala = scaleNames(scala);

for (let i = 0; i < index_chord.data.length; i++) {
  console.log(nomi_scala[index_chord.data[i]]);
}

