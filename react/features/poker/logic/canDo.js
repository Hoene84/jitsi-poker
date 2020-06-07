// @flow

import type { Action, APokerState } from '../types';
import { countCards, currentPlayer } from './helpers';
import { CALL, CHECK, FOLD, GIVE_CARDS, RAISE } from '../actionTypes';

export function canGiveCards(state: APokerState, nick: string): ?Action {
    const isDealer = state.common.game.dealer === nick;
    const cardsMissing = Object.keys(state.common.players).some(playerNick => countCards(state, playerNick) < 2);

    return isDealer && cardsMissing ? GIVE_CARDS : null;
}

export function canCheck(state: APokerState, nick: string): ?Action {
    return _isCurrentPlayer(state, nick)
    && countCards(state, nick) === 2
    && currentPlayer(state)?.bet === state.common.game.round.bet ? CHECK : null;
}

export function canCall(state: APokerState, nick: string): ?Action {
    return _isCurrentPlayer(state, nick)
    && countCards(state, nick) === 2
    && (currentPlayer(state)?.bet || 0) < state.common.game.round.bet ? CALL : null;
}

export function canRaise(state: APokerState, nick: string): ?Action {
    return _isCurrentPlayer(state, nick)
    && countCards(state, nick) === 2
    && state.common.game.round.currentPlayer !== state.common.game.round.bettingRound.raisePlayer ? RAISE : null;
}

export function canFold(state: APokerState, nick: string): ?Action {
    return _isCurrentPlayer(state, nick)
    && countCards(state, nick) === 2
    && !currentPlayer(state)?.fold ? FOLD : null;
}

function _isCurrentPlayer(state: APokerState, nick: string) {
    return state.common.game.round.currentPlayer === nick;
}
