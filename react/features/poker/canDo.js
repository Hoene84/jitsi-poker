// @flow

import type { Action, APokerState } from './types';
import { countCards } from './helpers';
import { CHECK, FOLD, GIVE_CARDS, RAISE } from './actionTypes';

export function canGiveCards(state: APokerState, nick: string): ?Action {
    const isDealer = state.common.game.dealer === nick;
    const cardsMissing = Object.keys(state.common.players).some(playerNick => countCards(state, playerNick) < 2);

    return isDealer && cardsMissing ? GIVE_CARDS : null;
}

export function canCheck(state: APokerState, nick: string): ?Action {
    return _isCurrentPlayer(state, nick) ? CHECK : null;
}

export function canRaise(state: APokerState, nick: string): ?Action {
    return _isCurrentPlayer(state, nick) ? RAISE : null;
}

export function canFold(state: APokerState, nick: string): ?Action {
    return _isCurrentPlayer(state, nick) ? FOLD : null;
}

function _isCurrentPlayer(state: APokerState, nick: string) {
    return state.common.game.currentPlayer === nick;
}
