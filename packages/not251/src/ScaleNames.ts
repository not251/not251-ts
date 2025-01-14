import { scaleNames } from "./chord";
import { positionVector } from "./positionVector";

const scalePool = [
    {
      name: "Misolidia",
      degrees: [0, 2, 4, 5, 7, 9, 10],
    },
    {
      name: "Maggiore",
      degrees: [0, 2, 4, 5, 7, 9, 11],
    },
    {
      name: "Dorica",
      degrees: [0, 2, 3, 5, 7, 9, 10],
    },
    {
      name: "Frigia",
      degrees: [0, 1, 3, 5, 7, 8, 10],
    },
    {
      name: "Lidia",
      degrees: [0, 2, 4, 6, 7, 9, 11],
    },
    {
      name: "Minore naturale",
      degrees: [0, 2, 3, 5, 7, 8, 10],
    },
    {
      name: "Locria",
      degrees: [0, 1, 3, 5, 6, 8, 10],
    },
    {
      name: "Minore armonica",
      degrees: [0, 2, 3, 5, 7, 8, 11],
    },
    {
      name: "Minore melodica",
      degrees: [0, 2, 3, 5, 7, 9, 11],
    },
    {
      name: "Maggiore armonica",
      degrees: [0, 2, 4, 5, 7, 8, 11],
    },
    {
      name: "Superlocria",
      degrees: [0, 1, 3, 4, 6, 8, 10],
    },
  
    // Aggiungere altre scale al bisogno
  ];
  
  function generateCombinations<T>(arr: T[], n: number): (T | null)[][] {
    if (n < arr.length) {
        throw new Error("n must be greater than or equal to the length of the input array.");
    }

    const m = arr.length;
    const combinations: (T | null)[][] = [];

    function backtrack(
        current: (T | null)[],
        index: number
    ): void {
        // Se la combinazione ha raggiunto la lunghezza desiderata
        if (current.length === n) {
            // Controlla se include tutti gli elementi del vettore di input
            const includesAll = arr.every((element) => current.includes(element));
            if (includesAll) {
                combinations.push([...current]);
            }
            return;
        }

        // Aggiungi un elemento del vettore di input
        if (index < m) {
            current.push(arr[index]);
            backtrack(current, index + 1);
            current.pop();
        }

        // Aggiungi un null
        current.push(null);
        backtrack(current, index);
        current.pop();
    }

    backtrack([], 0);
    return combinations;
}

  /**
   * Allinea due scale basandosi sui gradi, posizionandoli correttamente
   * nello stesso indice a seconda del grado che rappresentano.
   *
   * @param {positionVector} scaleInput - La scala in input da analizzare.
   * @param {positionVector} referenceScale - La scala di riferimento per il confronto.
   * @returns {Object} - Due array allineati: `alignedInput` e `alignedReference`.
   */
  function alignScales(scaleA: positionVector, scaleB: positionVector): [(number | null)[], (number | null)[]] {
    const degreesA = scaleA.getDegrees();
    const degreesB = scaleB.getDegrees();
    if (degreesA == degreesB) {
     return [scaleA.data, scaleB.data];
    }
    const shifting = scaleA.data[0] - scaleB.data[0];
    const newB = scaleB.sum(shifting);
  
    const maxLength = Math.max(scaleA.data.length, scaleB.data.length)
  const alignedA: (number | null)[] = Array.from({ length: maxLength }, () => null);
  const alignedB: (number | null)[] = Array.from({ length: maxLength }, () => null);
    let index = 0;
    let indexA = 0;
    let indexB = 0;
    while (index < maxLength){
      if (degreesA[indexA] == degreesB[indexB] && (degreesA[indexA+1] != degreesA[indexA] && degreesB[indexB+1] != degreesB[indexB])){
        alignedA[index] = scaleA.data[indexA];
        indexA++;
        alignedB[index] = newB.data[indexB];
        indexB++;
        index++;
      } else if (degreesA[indexA] == degreesB[indexB]){
  
        let iA = 1;
        while (degreesA[indexA] == degreesA[indexA + iA]){
          iA++;
        }
        let iB = 1;
        while (degreesB[indexB] == degreesB[indexB + iB]){
          iB++;
        }
        let iC = Math.max(iA, iB);
        let a: (number | null)[] = Array.from({ length: iC }, () => null);
        let b: (number | null)[] = Array.from({ length: iC }, () => null);
        if(iA > iB){
          a = scaleA.data.slice(indexA,indexA+iA);
          const btemp = newB.data.slice(indexB,indexB+iB);
          const bComb = generateCombinations(btemp,iC);
          let best = Infinity;
          let indexx = 0;
          for (let i = 0 ; i < bComb.length ; i++){
            let actualdist = 0;
            let actual = bComb[i];
            for ( let j = 0 ; j < actual.length ; j++){
              if(actual[j] != null){
                actualdist += Math.abs(actual[j] - a[j]);
              }
            }
            if(actualdist < best){
              best = actualdist;
              indexx = i
            }
          }
          b = bComb[indexx];
        } else{
          const atemp = scaleA.data.slice(indexA,indexA+iA);
          b = newB.data.slice(indexB,indexB+iB);
          const aComb = generateCombinations(atemp,iC);
          let best = Infinity;
          let indexx = 0;
          for (let i = 0 ; i < aComb.length ; i++){
            let actualdist = 0;
            let actual = aComb[i];
            for ( let j = 0 ; j < actual.length ; j++){
              if(actual[j] != null){
                actualdist += Math.abs(actual[j] - b[j]);
              }
            }
            if(actualdist < best){
              indexx = i
            }
          }
          a = aComb[indexx];
        }
        indexA += iA;
        indexB += iB;
        let c = 0
        while ( iC > 0 ){
          alignedA[index] = a[c];
          alignedB[index] = b[c];
          c++;
          index++;
          iC--;
        }
  
      } else if(degreesA[indexA] < degreesB[indexB]){
  
        alignedA[index] = scaleA.data[indexA];
        indexA++;
        index++;
      } else {
  
        alignedB[index] = newB.data[indexB]
        indexB++;
        index++;
      }
    }
    for (let i = 0 ; i < alignedB.length ; i++ ){
      if(alignedB[i] != null){
        alignedB[i] -= shifting;
      }
    }
  
    return [alignedA, alignedB];
  }
  
  /**
   * Trova il nome di una scala basandosi su un pool di scale predefinite.
   * Se la scala non è presente nel pool, restituisce il nome della scala più vicina con le variazioni in gradi (es. #4 o b6).
   *
   * @param {positionVector} scaleInput - La scala da analizzare.
   * @returns {string} - Il nome della scala trovata o più vicina con eventuali variazioni.
   */
  function findScaleName(scaleInput: positionVector) {
    const normalizedInput = scaleInput.toZero();
    const pool = scalePool.map((s) => ({
      ...s,
      degrees: new positionVector(s.degrees, 12, 12),
    }));
  
    const rootNote = scaleNames(scaleInput)[0];
  
    let closestScale = { name: "", degrees: new positionVector([], 12, 12) };
    let minDistance = Infinity;
    let variationLabels = [];
    let bestBaseMatch = -Infinity;
  
    for (const poolScale of pool) {
      const [alignedInput, alignedReference] = alignScales(normalizedInput, poolScale.degrees);
      let distance = 0;
      let baseMatch = 0; // Conta i gradi che corrispondono negli indici di base [0, 2, 4, 6]
  
      for (let i = 0; i < alignedInput.length; i++) {
        const inputDegree = alignedInput[i];
        const referenceDegree = alignedReference[i];
  
        if (inputDegree !== null && referenceDegree !== null) {
          if ([0, 2, 4, 6].includes(i)) {
            // Incrementa baseMatch se i gradi agli indici base corrispondono
            if (inputDegree === referenceDegree) {
              baseMatch++;
            }
          }
          distance += Math.abs(inputDegree - referenceDegree);
        } else if (inputDegree !== null || referenceDegree !== null) {
          distance += 1; // Penalità per disallineamento
        }
      }
  
      // Aggiorna la scala migliore se il match di base è migliore, o se la distanza è minore in caso di parità
      if (baseMatch > bestBaseMatch || (baseMatch === bestBaseMatch && distance < minDistance)) {
        bestBaseMatch = baseMatch;
        minDistance = distance;
        closestScale = poolScale;
  
        variationLabels = [];
        for (let i = 0; i < alignedInput.length; i++) {
          const inputDegree = alignedInput[i];
          const referenceDegree = alignedReference[i];
          const degreeRef = i + 1;
  
          if (referenceDegree === null) {
            variationLabels.push(`add${degreeRef}`);
          } else if (inputDegree === null) {
            variationLabels.push(`no${degreeRef}`);
          } else if (inputDegree !== referenceDegree) {
            const diff = inputDegree - referenceDegree;
            const label = diff === 1 ? `#${degreeRef}` : diff === -1 ? `b${degreeRef}` : null;
            if (label) variationLabels.push(label);
          }
        }
      }
    }
  
    const variationText = variationLabels.length > 0 ? ` ${variationLabels.join(" ")}` : "";
    return `${rootNote} ${closestScale.name}${variationText}`;
  }
  