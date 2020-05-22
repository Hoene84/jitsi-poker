// @flow

import type { Player, PokerState } from './types';
import { assign as reduxAssign } from '../base/redux';

// workaround for https://github.com/facebook/flow/issues/4312?
export function assign<T: Object>(target: T, source: $Shape<T>): T {
    return reduxAssign(target, source);
}

export function countCards(state: PokerState, nick: string) {
    if (!state.common.game.deck) {
        return 0;
    }

    return state.common.game.deck && state.common.game.deck.cards.filter(cardSlot => cardSlot.owner === nick).length;
}

export function nextPlayerAfter(state: PokerState, nick: ?string = state.common.game.currentPlayer) {
    const nicks = Object.keys(state.common.players);

    return nicks[(nicks.indexOf(nick) + 1) % nicks.length];
}

export function currentPlayer(state: PokerState): ?Player {
    if (state.common.game.currentPlayer) {
        return state.common.players[state.common.game.currentPlayer];
    }
}
