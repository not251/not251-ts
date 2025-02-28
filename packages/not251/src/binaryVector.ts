/**
 * Represents a binary vector with boolean data,
 * supporting cyclic properties defined by modulo and an offset.
 */
class binaryVector {
    data: boolean[];
    modulo: number;
    offset: number;
  
    /**
     * Initializes a new binaryVector with specified boolean data,
     * a modulo for cyclic properties, and an offset value.
     * @param data An array of boolean values representing the binary vector.
     * @param modulo A cyclic constraint defining the repeating interval.
     * @param offset The offset used for normalization.
     */
    constructor(data: boolean[], modulo: number = 12, offset: number = 12) {
      this.data = data;
      this.modulo = modulo;
      this.offset = offset;
    }
  }