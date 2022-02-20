import { Rule } from './rule.js';

describe('Rule', () => {
  describe('MCell notation', () => {
    // prettier-ignore
    const wellKnownRules = [
      { name: "Replicator",             ruleStr: "B1357/S1357",   birth: [1, 3, 5, 7],  survival: [1, 3, 5, 7] },
      { name: "Fredkin",                ruleStr: "B1357/S02468",  birth: [1, 3, 5, 7],  survival: [0, 2, 4, 6, 8] },
      { name: "Seeds",                  ruleStr: "B2/S",          birth: [2],           survival: [] },
      { name: "Live Free or Die",       ruleStr: "B2/S0",         birth: [2],           survival: [0] },
      { name: "Life without death",     ruleStr: "B3/S012345678", birth: [3],           survival: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
      { name: "Flock",                  ruleStr: "B3/S12",        birth: [3],           survival: [1, 2] },
      { name: "Mazectric",              ruleStr: "B3/S1234",      birth: [3],           survival: [1, 2, 3, 4] },
      { name: "Maze",                   ruleStr: "B3/S12345",     birth: [3],           survival: [1, 2, 3, 4, 5] },
      { name: "Conway's Game of Life",  ruleStr: "B3/S23",        birth: [3],           survival: [2, 3] },
      { name: "2×2",                    ruleStr: "B36/S125",      birth: [3, 6],        survival: [1, 2, 5] },
      { name: "HighLife",               ruleStr: "B36/S23",       birth: [3, 6],        survival: [2, 3] },
      { name: "Move",                   ruleStr: "B368/S245",     birth: [3, 6, 8],     survival: [2, 4, 5] },
      { name: "Day & Night",            ruleStr: "B3678/34678",   birth: [3, 6, 7, 8],  survival: [4, 6, 7, 8] },
      { name: "DryLife",                ruleStr: "B37/S23",       birth: [3, 7],        survival: [2, 3] },
      { name: "Pedestrian Life",        ruleStr: "B38/S23",       birth: [3, 8],        survival: [2, 3] },
    ];

    it.each(wellKnownRules)(
      '$name ($ruleStr): birth=$birth, survival=$survival',
      ({ name, ruleStr, birth, survival }) => {
        const rule = new Rule(ruleStr);

        expect(rule.birthCounts).toEqual(birth);
        expect(rule.survivalCounts).toEqual(survival);
      },
    );
  });
});
