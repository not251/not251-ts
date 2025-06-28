import { intervalVector } from "./intervalVector";

/**
 * Genera un pattern di suddivisione iniziale basato su una lunghezza totale e un gruppo di intervalli.
 * Crea un array di 0 e 1, dove 1 segna l'inizio di ogni blocco definito dalla somma degli intervalli nel gruppo.
 * Gestisce lunghezze totali non perfettamente divisibili per la dimensione del gruppo inserendo un blocco "irregolare".
 *
 * @param n La lunghezza totale desiderata per l'array di output.
 * @param group Un intervalVector i cui dati definiscono la lunghezza del blocco ripetuto (somma degli intervalli).
 * @param p Un fattore utilizzato per calcolare l'indice di inserimento del blocco irregolare (se presente).
 * @returns Un array di numeri (0 o 1) che rappresenta il pattern di suddivisione.
 */
export function subdiv(n: number, group: intervalVector, p: number): number[] {
  // Inizializza la lunghezza effettiva con la lunghezza desiderata n.
  let length = n;
  // Calcola la dimensione totale 'g' del blocco sommando gli intervalli in group.data.
  let g = 0;
  // Itera sugli elementi dell'array data del gruppo.
  for (let i = 0; i < group.data.length; i++) {
    // FIX: Usa l'asserzione non-null (!) assumendo che group.data[i] esista entro i limiti del ciclo (TS2532)
    // Somma l'intervallo corrente a g.
    g += group.data[i]!;
  }

  // Se n non è perfettamente divisibile per g, aggiusta la 'length'
  // sottraendo il resto per ottenere la lunghezza della parte regolare.
  if (n % g !== 0) {
    length -= n % g;
  }

  // Inizializza l'array di output.
  let out: number[] = [];
  // Genera la parte regolare del pattern.
  // Itera con step 'g' fino a 'length'.
  for (let i = 0; i < length; i += g) {
    // Aggiunge 1 per marcare l'inizio di un blocco.
    out.push(1);
    // Aggiunge g-1 zeri per completare il blocco.
    for (let j = 1; j < g; j++) {
      out.push(0);
    }
  }

  // Inizializza l'array per il blocco irregolare (se necessario).
  let irregular: number[] = [];
  // Se la lunghezza dell'output generato è minore di n (cioè n non era divisibile per g).
  if (out.length < n) {
    // Il blocco irregolare inizia sempre con 1.
    irregular.push(1);
    // Aggiunge zeri fino a raggiungere la lunghezza rimanente (n - length).
    while (irregular.length < n - length) {
      irregular.push(0);
    }
  }

  // Calcola l'indice dove inserire il blocco irregolare.
  let index = p * g;
  // Limita l'indice alla lunghezza massima possibile dell'array 'out' per evitare errori.
  if (index > out.length) {
    index = out.length;
  }

  // Inserisce il blocco 'irregular' nell'array 'out' all'indice calcolato.
  // Usa lo spread operator (...) per inserire gli elementi individualmente.
  out.splice(index, 0, ...irregular);

  // Restituisce l'array finale con il pattern di suddivisione.
  return out;
}

/**
 * Modifica un array inserendo un numero specificato ('num') nelle posizioni che NON corrispondono
 * all'inizio di un ciclo completo degli intervalli definiti da 'group'.
 * Questa funzione opera su una copia dell'array di input.
 * Nota: Il parametro 'left' non è attualmente utilizzato nella logica della funzione.
 *
 * @param inArr L'array di numeri di input da modificare.
 * @param group Un intervalVector che definisce gli intervalli. La sua proprietà 'modulo' verrà aggiornata con la somma degli intervalli.
 * @param num Il numero da inserire nell'array modificato.
 * @param left Un parametro booleano attualmente non utilizzato.
 * @returns Una nuova array con il numero 'num' inserito nelle posizioni appropriate.
 */
export function recursiveInsert(
  inArr: number[],
  group: intervalVector,
  num: number,
  left: boolean // 'left' parameter is unused in the current logic
): number[] {
  // Crea una copia dell'array di input per non modificarlo direttamente.
  let out = [...inArr];
  // Inizializza il contatore totale della posizione.
  let tot = 0;
  // Calcola la somma 'g' degli intervalli nel gruppo.
  let g = 0;
  // Itera sugli intervalli del gruppo.
  for (let i = 0; i < group.data.length; i++) {
    // FIX: Usa l'asserzione non-null (!) assumendo che group.data[i] esista (TS2532)
    // Somma l'intervallo corrente a g.
    g += group.data[i]!;
  }

  // Aggiorna la proprietà 'modulo' dell'oggetto 'group' (effetto collaterale!).
  group.modulo = g;
  // Inizializza l'indice per accedere ciclicamente agli intervalli del gruppo.
  let i = 0;

  // Itera finché il contatore 'tot' è minore della lunghezza dell'array di input.
  while (tot < inArr.length) {
    // Controlla se 'tot' NON è un multiplo del modulo del gruppo.
    // Questo identifica le posizioni *all'interno* di un ciclo di gruppo, escludendo l'inizio.
    if (tot % group.modulo !== 0) {
      // Controlla i limiti prima dell'assegnazione per sicurezza.
      if (tot < out.length) {
        // Assegna il numero 'num' alla posizione 'tot' nell'array di output.
        out[tot] = num;
      }
    }
    // Incrementa 'tot' utilizzando il metodo 'element' del gruppo,
    // che gestisce l'accesso ciclico agli intervalli.
    tot += group.element(i);
    // Incrementa l'indice per il prossimo intervallo del gruppo.
    i++;
  }

  // Restituisce l'array modificato.
  return out;
}

/**
 * Trova sequenze consecutive di zeri in un array e inserisce un numero 'n'
 * al punto medio di ciascuna sequenza.
 * Il parametro 'left' determina come viene calcolato il punto medio per sequenze di lunghezza pari.
 *
 * @param inArr L'array di numeri di input (spesso contenente 0 e altri valori).
 * @param n Il numero da inserire nei punti medi delle sequenze di zeri.
 * @param left Se true, il punto medio per sequenze pari è spostato a sinistra (floor((size-1)/2)). Se false, è spostato a destra (floor(size/2)).
 * @returns Una nuova array con il numero 'n' inserito nei punti medi.
 */
export function insertAtMidpoint(
  inArr: number[],
  n: number,
  left: boolean
): number[] {
  // Crea una copia dell'array di input.
  let out = [...inArr];
  // Ottiene la lunghezza dell'array.
  let l = inArr.length;

  // Se l'array ha meno di 2 elementi, non ci possono essere sequenze, restituisce la copia.
  if (l < 2) {
    return out;
  }

  // Flag per tracciare se siamo attualmente in una sequenza di zeri.
  let zeroGroup = false;
  // Indice di inizio dell'attuale sequenza di zeri.
  let start = 0;

  // Itera sull'array a partire dal secondo elemento.
  for (let i = 1; i < l; i++) {
    // Usa l'asserzione non-null (!) poiché 'i' è entro i limiti.
    const currentVal = inArr[i]!;
    // Se l'elemento corrente è 0.
    if (currentVal === 0) {
      // Se non eravamo già in un gruppo di zeri, inizia un nuovo gruppo.
      if (!zeroGroup) {
        zeroGroup = true;
        start = i; // Segna l'inizio del gruppo.
      }
    } else { // Se l'elemento corrente non è 0.
      // Se eravamo in un gruppo di zeri, questo segna la fine del gruppo.
      if (zeroGroup) {
        // Calcola la dimensione del gruppo di zeri appena terminato.
        let groupSize = i - start;
        // Calcola l'indice del punto medio in base al flag 'left'.
        let midpoint = left
          ? start + Math.floor((groupSize - 1) / 2) // Bias a sinistra per dimensione pari
          : start + Math.floor(groupSize / 2);      // Bias a destra (standard) per dimensione pari
        // Controlla i limiti prima dell'assegnazione.
        if (midpoint < out.length) {
            // Inserisce il numero 'n' nel punto medio calcolato.
            out[midpoint] = n;
        }
        // Resetta il flag, non siamo più in un gruppo di zeri.
        zeroGroup = false;
      }
    }
  }

  // Gestisce il caso in cui l'array termina con una sequenza di zeri.
  if (zeroGroup) {
    // L'ultimo indice dell'array.
    let last = l - 1;
    // Calcola la dimensione del gruppo di zeri finale.
    let groupSize = last - start + 1;
    // Calcola il punto medio per il gruppo finale.
    let midpoint = left
      ? start + Math.floor((groupSize - 1) / 2) // Bias a sinistra
      : last - Math.floor((groupSize - 1) / 2); // Bias a destra (rispetto alla fine del gruppo)
    // Controlla i limiti prima dell'assegnazione (midpoint deve essere >= 0).
    if (midpoint < out.length && midpoint >= 0) {
        // Inserisce il numero 'n' nel punto medio.
        out[midpoint] = n;
    }
  }

  // Restituisce l'array modificato.
  return out;
}

/**
 * Genera una "griglia" (una sequenza di array) applicando progressivamente
 * funzioni di suddivisione e inserimento.
 * Inizia con un pattern base da `subdiv`, opzionalmente aggiunge un secondo livello
 * con `recursiveInsert`, e poi applica ripetutamente `insertAtMidpoint`
 * finché non rimangono più zeri nell'ultimo array generato.
 *
 * @param n Parametro di dimensione passato a `subdiv`.
 * @param group L'intervalVector usato da `subdiv` e `recursiveInsert`.
 * @param left Flag booleano passato a `insertAtMidpoint` nel ciclo principale per controllare il bias del punto medio.
 * @returns Un array bidimensionale (number[][]) contenente la sequenza completa degli array generati.
 */
export function grid(
  n: number,
  group: intervalVector,
  left: boolean
): number[][] {
  // Inizializza l'array che conterrà tutti gli stadi della griglia.
  let out: number[][] = [];

  // --- Stadio 1: Generazione del pattern iniziale ---
  // Chiama subdiv per creare il pattern di base. 'p' è impostato a 'n'.
  let subdivisions = subdiv(n, group, n);
  // Aggiunge il pattern iniziale all'output.
  out.push(subdivisions);

  // Inizializza il numero da inserire per i prossimi stadi.
  let num = 2;

  // --- Stadio 2 (Opzionale): Inserimento ricorsivo ---
  // Eseguito solo se il gruppo ha più di un intervallo.
  if (group.data.length > 1) {
    // Chiama recursiveInsert usando il pattern iniziale, il numero corrente (2),
    // e un valore hardcoded 'true' per il parametro 'left' (che è inutilizzato in recursiveInsert).
    let stage2 = recursiveInsert(subdivisions, group, num, true);
    // Aggiunge il risultato dello stadio 2 all'output.
    out.push(stage2);
    // Incrementa il numero per il prossimo stadio.
    num++;
  }

  // --- Stadi Successivi: Inserimento al punto medio ---
  // Ciclo infinito che si interromperà quando non ci saranno più zeri.
  while (true) {
    // FIX: Controlla se 'out' è vuoto e se l'ultimo elemento è definito (TS2345)
    // Ottiene l'ultimo array generato (l'ultimo stadio).
    const lastStage = out[out.length - 1];
    // Se per qualche motivo l'ultimo stadio non è definito, esce dal ciclo per sicurezza.
    if (!lastStage) {
        //console.error("Grid generation error: last stage is undefined.");
        break;
    }

    // Genera il nuovo stadio chiamando insertAtMidpoint sull'ultimo stadio,
    // usando il numero corrente 'num' e il flag 'left' passato alla funzione 'grid'.
    let stage = insertAtMidpoint(lastStage, num, left);
    // Aggiunge il nuovo stadio all'output.
    out.push(stage);

    // Controlla se ci sono ancora zeri nel nuovo stadio.
    // 'some' restituisce true se almeno un elemento soddisfa la condizione (val === 0).
    const zerosLeft = stage.some((val) => val === 0);
    // Se non ci sono più zeri (!zerosLeft è true), interrompe il ciclo.
    if (!zerosLeft) {
      break;
    }

    // Incrementa il numero per il prossimo ciclo di inserimento.
    num++;
  }

  // Restituisce l'array bidimensionale contenente tutti gli stadi generati.
  return out;
}
