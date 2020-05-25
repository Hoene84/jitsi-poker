// @flow

import type { Card, Rank, Symbol } from './types';
import _ from 'lodash';
import { SYMBOLS } from './constants';

export function rank(cards: Array<Card>): Rank {
    return [_pair(cards)][0]
}

function _pairs(cards: Array<Card>): Array<Array<Symbol>> {
    const groups = _.groupBy(cards.map(card => card.symbol));
    const groupsTyped : Array<Array<Symbol>> = Object.keys(groups).map(symbol => groups[symbol]);

    return _.sortBy(groupsTyped, [group => group.length, group => SYMBOLS[group[0]]]);
}

// function _pair(cards: Array<Card>): Rank {
//     const pairs = _pairs(cards);
//     const highestSymbol = pairs[pairs.length - 1];
//     const availableKickers = cards.map(card => card.symbol).filter(symbol => symbol !== highestSymbol)
//
//     return {
//         hand: 'pair',
//         symbol: highestSymbol[0],
//         kicker: _.sortBy(availableKickers, symbol => SYMBOLS[symbol])[0]
//     };
// }

function _symbolHands(cards: Array<Card>): Rank {
    const pairs = _pairs(cards);
    const highestSymbol = pairs[pairs.length - 1];
    const secondHighestSymbol = pairs[pairs.length - 2];

    if (highestSymbol.length === 4) {
        return {
            hand: 'four',
            symbol: [highestSymbol[0]],
            kickers: [secondHighestSymbol[0]]
        };
    }

    if (highestSymbol.length === 3 && secondHighestSymbol.length === 2) {
        return {
            hand: 'fullHouse',
            symbol: [highestSymbol[0], secondHighestSymbol[0]],
            kickers: []
        };
    }

    if (highestSymbol.length === 3 && secondHighestSymbol.length === 2) {
        return {
            hand: 'fullHouse',
            symbol: [highestSymbol[0], secondHighestSymbol[0]],
            kickers: []
        };
    }


}
