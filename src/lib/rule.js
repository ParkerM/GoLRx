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

class WellKnownRules {
  static REPLICATOR = new Rule('B1357/S1357');
  static FREDKIN = new Rule('B1357/S02468');
  static SEEDS = new Rule('B2/S');
  static LIVE_FREE_OR_DIE = new Rule('B2/S0');
  static LIFE_WITHOUT_DEATH = new Rule('B3/S012345678');
  static FLOCK = new Rule('B3/S12');
  static MAZECTRIC = new Rule('B3/S1234');
  static MAZE = new Rule('B3/S12345');
  static GAME_OF_LIFE = new Rule('B3/S23');
  static TWO_BY_TWO = new Rule('B36/S125');
  static HIGH_LIFE = new Rule('B36/S23');
  static MOVE = new Rule('B368/S245');
  static DAY_AND_NIGHT = new Rule('B3678/34678');
  static DRY_LIFE = new Rule('B37/S23');
  static PEDESTRIAN_LIFE = new Rule('B38/S23');
}

export { Rule, WellKnownRules };
