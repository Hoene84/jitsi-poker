// @flow

import type { Action, PokerState } from './types';
import { countCards } from './helpers';
import { GIVE_CARDS } from './actionTypes';

export function canGiveCards(state: PokerState, nick: string): ?Action {
    const isDealer = state.common.game.dealer === nick;
    const cardsMissing = Object.keys(state.common.players).some(playerNick => countCards(state, playerNick) < 2);

    return isDealer && cardsMissing ? GIVE_CARDS : null;
}
