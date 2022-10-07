/**
 * Enum representing the state of a cell (alive or dead).
 */
class State {
  static ALIVE = new State(true);
  static DEAD = new State(false);

  /** @param alive {boolean} */
  constructor(alive) {
    this.alive = alive;
  }

  /** @returns {boolean} */
  get isAlive() {
    return this.alive;
  }

  /** @returns {boolean} */
  get isDead() {
    return !this.alive;
  }

  /** @returns {State} */
  get inverse() {
    return this.alive ? State.DEAD : State.ALIVE;
  }

  toString() {
    return this.alive ? 'alive' : 'dead';
  }
}

export { State };
