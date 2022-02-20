class Rule {
  /** @member {number[]} */
  #birth = [];

  /** @member {number[]} */
  #survival = [];

  /**
   *
   * @param {string} ruleBS - MCell-style rule formatted as {Bb0...bm/Ss0...sn}
   *                          s.t. all b are unique, all s are unique, and 0 <= m,n < 9
   */
  constructor(ruleBS) {
    const bs = ruleBS.split('/', 2);
    let b = bs[0].substring(1);
    let s = bs[1].substring(1);

    this.#birth = b.split('').map((i) => parseInt(i, 10));
    this.#survival = s.split('').map((i) => parseInt(i, 10));
  }

  get birthCounts() {
    return this.#birth;
  }

  get survivalCounts() {
    return this.#survival;
  }
}

export { Rule };
