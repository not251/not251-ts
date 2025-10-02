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

/**
 * Decompone un array in sotto-array (chunk) in base a una gerarchia di stadi.
 * Un nuovo chunk inizia in corrispondenza di un numero `n` diverso da zero, dove `n` è minore
 * del numero di stadio `splitStage` fornito.
 *
 * @param inputArray L'array di numeri da suddividere.
 * @param splitStage Il numero di stadio corrente. La funzione dividerà l'array in corrispondenza di qualsiasi numero `n` tale che `0 < n < splitStage`.
 * @returns Un array di array di numeri (number[][]), dove ogni sotto-array rappresenta un chunk gerarchico.
 * @example
 * // Esempio: Suddivisione basata sullo stadio 2 (quindi i valori '1' sono separatori)
 * const inputArray = [1, 0, 2, 0, 1, 0, 0, 0];
 * const splitStage = 2;
 * const result = splitByHierarchy(inputArray, splitStage);
 * // result === [[1, 0, 2, 0], [1, 0, 0, 0]]
 */
export function splitByHierarchy(inputArray: number[], splitStage: number): number[][] {
  if (!inputArray || inputArray.length === 0) {
    return [];
  }

  const chunks: number[][] = [];
  let lastSplitIndex = 0;

  // Esempio: inputArray = [1, 0, 2, 0, 1, 0, 0, 0], splitStage = 2
  for (let i = 0; i < inputArray.length; i++) {
    const value = inputArray[i]!;
    // Un valore è un separatore se è diverso da zero e minore dello stadio di split.
    // Nel nostro esempio, solo `1` è un separatore.
    const isSplitter = value !== 0 && value < splitStage;

    // Divide l'array prima dell'elemento corrente se è un separatore,
    // ma non creare un chunk vuoto all'inizio.
    if (isSplitter && i > 0) {
      // i = 4, value = 1. `isSplitter` è true.
      // Si crea un chunk da `lastSplitIndex` (0) a `i` (4).
      // chunks.push([1, 0, 2, 0])
      chunks.push(inputArray.slice(lastSplitIndex, i));
      // Il nuovo punto di partenza per il prossimo chunk è l'indice del separatore.
      // lastSplitIndex = 4
      lastSplitIndex = i;
    }
  }

  // Aggiunge l'ultimo chunk rimasto.
  // Dopo il loop, `lastSplitIndex` è 4.
  // Si aggiunge l'ultimo pezzo dell'array da indice 4 alla fine.
  // chunks.push([1, 0, 0, 0])
  chunks.push(inputArray.slice(lastSplitIndex));

  // Alla fine, chunks = [[1, 0, 2, 0], [1, 0, 0, 0]]
  return chunks;
}

/**
 * Trova lo/gli slot libero/i (0) più vicino/i a un dato indice all'interno di un chunk.
 * @param chunk L'array in cui cercare.
 * @param targetIndex L'indice di partenza della ricerca.
 * @returns Un array contenente gli indici degli slot liberi più vicini. Può contenere 0, 1 o 2 elementi.
 * @example
 * // Caso 1: un solo slot vicino
 * findNearestFreeSlot([1, 2, 0, 3, 2], 1); // restituisce [2]
 * 
 * // Caso 2: due slot equidistanti
 * findNearestFreeSlot([1, 0, 3, 0, 1], 2); // restituisce [3, 1] (l'ordine può variare)
 */
function findNearestFreeSlot(chunk: readonly number[], targetIndex: number): number[] {
  const len = chunk.length;
  // Controlla la posizione target stessa.
  if (chunk[targetIndex] === 0) {
    return [targetIndex];
  }

  // Cerca verso l'esterno dalla posizione target, un passo (offset) alla volta.
  for (let offset = 1; offset < len; offset++) {
    const rightIndex = targetIndex + offset;
    const leftIndex = targetIndex - offset;

    const foundSlots: number[] = [];

    // Controlla a destra: è un indice valido? La posizione è libera (0)?
    if (rightIndex < len && chunk[rightIndex] === 0) {
      foundSlots.push(rightIndex);
    }
    // Controlla a sinistra: è un indice valido? La posizione è libera (0)?
    if (leftIndex >= 0 && chunk[leftIndex] === 0) {
      foundSlots.push(leftIndex);
    }

    // Se abbiamo trovato uno o più slot a questa distanza (offset), 
    // restituiscili subito e interrompi la ricerca.
    // Questo garantisce che gli slot restituiti siano sempre i più vicini.
    if (foundSlots.length > 0) {
      return foundSlots;
    }
  }

  return []; // Nessuno slot libero trovato dopo aver scansionato l'intero array.
}

/**
 * Distribuisce un numero di eventi in modo proporzionale all'interno di un chunk.
 * Se la posizione ideale è occupata, sceglie lo slot libero più vicino confrontando la 
 * distanza dal valore decimale originale. In caso di ulteriore parità, usa un tie-break.
 * @param chunk Il sotto-array su cui operare.
 * @param events Il numero totale di eventi che il chunk dovrebbe contenere.
 * @param stage Il numero che rappresenta l'evento da inserire.
 * @param tieBreak La priorità ('left' o 'right') da usare se due slot sono perfettamente equidistanti.
 * @returns Un nuovo chunk con gli eventi distribuiti.
 * @example
 * const chunk = [1, 0, 0, 0, 0, 0, 0, 0];
 * const events = 3;
 * const stage = 2;
 * const result = distributeProportionally(chunk, events, stage, 'right');
 * // result === [1, 0, 0, 2, 0, 2, 0, 0]
 */
export function distributeProportionally(
  chunk: number[], 
  events: number, 
  stage: number, 
  tieBreak: 'left' | 'right' = 'right'
): number[] {
  const outputChunk = [...chunk];
  const totalLength = chunk.length;

  // Se il numero di eventi desiderato è 1 o meno, non c'è nulla da aggiungere.
  if (events <= 1) {
    return outputChunk;
  }

  // Il ciclo parte da 1 perché si assume che il primo evento (i=0) sia già nel chunk.
  for (let i = 1; i < events; i++) {
    // Calcola la posizione ideale con precisione decimale.
    // Esempio: totalLength=8, events=3, i=1 -> floatIndex = (8 * 1) / 3 = 2.66...
    const floatIndex = (totalLength * i) / events;
    // Arrotonda all'intero più vicino per trovare l'indice target.
    // Esempio: targetIndex = Math.round(2.66...) = 3
    const targetIndex = Math.round(floatIndex);

    let finalIndex = -1;

    // Se la posizione target è valida e libera, usala.
    if (targetIndex >= 0 && targetIndex < totalLength && outputChunk[targetIndex] === 0) {
      finalIndex = targetIndex;
    } else {
      // Altrimenti, cerca lo/gli slot libero/i più vicino/i.
      const options = findNearestFreeSlot(outputChunk, Math.min(targetIndex, totalLength - 1));

      // Se viene trovata una sola opzione, usa quella.
      if (options.length === 1) {
        finalIndex = options[0]!;
      } else if (options.length > 1) {
        // Se ci sono più opzioni (caso di equidistanza), scegli la migliore.
        const option1 = options[0]!;
        const option2 = options[1]!;

        // Calcola la distanza di ogni opzione dal valore decimale originale.
        // Esempio: floatIndex = 3.5, options = [3, 5]
        // dist1 = abs(3 - 3.5) = 0.5
        const dist1 = Math.abs(option1 - floatIndex);
        // dist2 = abs(5 - 3.5) = 1.5
        const dist2 = Math.abs(option2 - floatIndex);

        if (dist1 < dist2) {
          finalIndex = option1; // option1 è più vicina
        } else if (dist2 < dist1) {
          finalIndex = option2; // option2 è più vicina
        } else {
          // Le distanze sono identiche, si verifica una parità.
          // Usa il parametro `tieBreak` per risolvere.
          // Esempio: floatIndex = 3.0, options = [2, 4], tieBreak = 'left'
          // finalIndex = 2
          finalIndex = tieBreak === 'left' 
            ? Math.min(option1, option2) // Scegli l'indice più piccolo
            : Math.max(option1, option2); // Scegli l'indice più grande
        }
      }
      // Se `options` è vuoto, `finalIndex` rimane -1.
    }

    // Se è stato trovato un indice valido, inserisci l'evento.
    if (finalIndex !== -1) {
      outputChunk[finalIndex] = stage;
    }
  }

  return outputChunk;
}


/**
 * Trova l'indice dell'array più lungo in un array di array.
 * @param arrays Un array di array di numeri.
 * @returns L'indice dell'array più lungo, o -1 se l'input è vuoto.
 * @example
 * const arrays = [[0, 0], [0, 0, 0, 0], [0]];
 * const longestIndex = findLongestArrayIndex(arrays);
 * // longestIndex === 1
 */
function findLongestArrayIndex(arrays: number[][]): number {
  if (arrays.length === 0) {
    return -1;
  }
  // Usa `reduce` per iterare sull'array di array e trovare l'indice di quello più lungo.
  // `longestIndex` è l'accumulatore, che tiene traccia dell'indice più lungo trovato finora.
  // Esempio: arrays = [[0, 0], [0, 0, 0, 0], [0]], valore iniziale di longestIndex = 0
  // 1. Confronta lunghezza di arr[1] (4) con arr[0] (2). È maggiore. longestIndex diventa 1.
  // 2. Confronta lunghezza di arr[2] (1) con arr[1] (4). Non è maggiore. longestIndex rimane 1.
  // Alla fine, restituisce 1.
  return arrays.reduce(
    (longestIndex, currentArray, currentIndex, arr) => {
      return currentArray.length > arr[longestIndex]!.length ? currentIndex : longestIndex;
    },
    0
  );
}

/**
 * Gestisce un singolo stadio di suddivisione gerarchica di un pattern ritmico.
 * Utilizza una logica di "completamento intelligente" per inserire eventi mancanti.
 * @param inputArray L'array di partenza per questo stadio.
 * @param events Il numero totale di eventi desiderato per ogni chunk principale.
 * @param stage Il numero dello stadio corrente da inserire (es. 2, 3...).
 * @param tieBreak La priorità da passare a `distributeProportionally`.
 * @returns Un nuovo array che rappresenta lo stato del pattern dopo questo stadio di suddivisione.
 */
export function manageHierarchicalStage(
  inputArray: number[], 
  events: number, 
  stage: number, 
  tieBreak: 'left' | 'right' = 'right'
): number[] {
  // Esempio: inputArray = [1, 0, 0, 0, 1, 0, 0, 0], events = 2, stage = 2

  // 1. Decompone l'array in base ai separatori < stage (in questo caso, '1').
  // chunks = [[1, 0, 0, 0], [1, 0, 0, 0]]
  const chunks = splitByHierarchy(inputArray, stage);
  
  const processedChunks = chunks.map(chunk => {
    // --- Inizio elaborazione primo chunk: chunk = [1, 0, 0, 0] ---
    
    // 2. Per ogni chunk, conta quanti eventi dello stadio corrente esistono già.
    // existingEvents = 0
    const existingEvents = chunk.filter(value => value === stage).length;

    // 3. Se il chunk è già "completo", lo restituisce così com'è.
    if (existingEvents >= events) {
      return chunk;
    }

    // 4. Se non è completo, calcola gli eventi mancanti.
    // remainingEvents = 2 - 0 = 2
    const remainingEvents = events - existingEvents;

    // 4a. Suddivide ulteriormente il chunk per isolare gli spazi disponibili.
    // I separatori sono < (stage + 1), cioè < 3. Quindi '1' e '2' sono separatori.
    // Poiché il chunk è [1, 0, 0, 0], non ci sono altri separatori interni.
    // subChunks = [[1, 0, 0, 0]]
    const subChunks = splitByHierarchy(chunk, stage + 1);

    // 4b. Trova il sotto-chunk più lungo, che verrà usato come target per l'inserimento.
    // longestSubChunkIndex = 0
    const longestSubChunkIndex = findLongestArrayIndex(subChunks);
    
    if (longestSubChunkIndex === -1) {
      return chunk;
    }

    // longestSubChunk = [1, 0, 0, 0]
    const longestSubChunk = subChunks[longestSubChunkIndex];

    if (!longestSubChunk) {
        return chunk; 
    }

    // 4c. Distribuisce gli eventi mancanti solo nel sotto-chunk più lungo.
    // processedSubChunk = distributeProportionally([1, 0, 0, 0], 2, 2) -> [1, 0, 2, 0]
    // (il risultato può variare leggermente in base all'arrotondamento)
    const processedSubChunk = distributeProportionally(longestSubChunk, remainingEvents, stage, tieBreak);

    // 4d. Sostituisce il sotto-chunk originale con quello elaborato.
    // subChunks ora è [[1, 0, 2, 0]]
    subChunks[longestSubChunkIndex] = processedSubChunk;

    // 4e. Ricompone il chunk principale.
    // return [1, 0, 2, 0]
    return subChunks.flat();
  });

  // 5. Ricompone l'array finale unendo tutti i chunk elaborati.
  // processedChunks = [[1, 0, 2, 0], [1, 0, 2, 0]]
  // return [1, 0, 2, 0, 1, 0, 2, 0]
  return processedChunks.flat();
}

/**
 * Genera una griglia ritmica completa attraverso un processo di completamento e espansione.
 * Il processo riempie iterativamente la griglia, la espande una volta che è piena, e poi
 * continua a riempire la nuova griglia espansa.
 *
 * @param initialGrid L'array di partenza, che costituisce il primo stadio.
 * @param multiplicity Il fattore di espansione da applicare una volta che `initialGrid` è stato completato.
 * @param stageConfigs (Opzionale) Un array per configurare il numero di `events` per stadi specifici.
 *                   Es: `[{ stage: 2, events: 3 }]`. Se uno stadio non è configurato, usa `events = 2`.
 * @param tieBreak (Opzionale) La regola per risolvere i casi di equidistanza ('left' o 'right'). Default: 'right'.
 * @returns Un array bidimensionale (number[][]) che contiene tutti gli stadi del processo.
 */
export function hierarchicalGrid(
  initialGrid: number[],
  multiplicity: number,
  tieBreak: 'left' | 'right' = 'right',
  stageConfigs?: { stage: number; events: number }[]
): number[][] {
  // Controlla che la griglia iniziale sia valida.
  if (!initialGrid || initialGrid.length === 0) {
    return [];
  }

  // Inizializza l'output con la griglia iniziale come primo stadio.
  const allStages: number[][] = [[...initialGrid]];
  let currentGrid = [...initialGrid];
  let stageNumber = 2;
  // L'espansione si considera "fatta" in anticipo se la molteplicità non la richiede.
  let expansionDone = multiplicity <= 1;

  // Loop principale che continua finché c'è lavoro da fare.
  while (true) {
    const hasZeros = currentGrid.some(val => val === 0);

    // Condizione di terminazione: la griglia è piena e l'espansione è già avvenuta (o non era necessaria).
    if (!hasZeros && expansionDone) {
      break;
    }

    // Condizione di espansione: la griglia è piena, ma l'espansione deve ancora avvenire.
    if (!hasZeros && !expansionDone) {
      const expandedGrid: number[] = [];
      for (const element of currentGrid) {
        expandedGrid.push(element);
        for (let i = 0; i < multiplicity - 1; i++) {
          expandedGrid.push(0);
        }
      }
      // La griglia di lavoro diventa quella espansa.
      currentGrid = expandedGrid;
      // Segna che l'espansione è stata completata.
      expansionDone = true;
      // Il ciclo continua per processare la nuova griglia (che ora ha zeri).
    }

    // Determina il numero di eventi per lo stadio corrente.
    // Cerca una configurazione specifica per lo stadio attuale.
    const config = stageConfigs?.find(c => c.stage === stageNumber);
    // Usa gli eventi configurati o il default (2).
    const events = config ? config.events : 2;

    // Genera il nuovo stadio usando la logica gerarchica.
    const newStage = manageHierarchicalStage(currentGrid, events, stageNumber, tieBreak);
    
    // Aggiunge il nuovo stadio ai risultati.
    allStages.push(newStage);
    // Aggiorna la griglia di lavoro per il prossimo ciclo.
    currentGrid = newStage;
    // Incrementa il numero dello stadio.
    stageNumber++;
  }

  return allStages;
}