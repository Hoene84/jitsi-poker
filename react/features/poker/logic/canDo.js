// @flow

import type { Action, APokerState } from '../types';
import { activePlayers, cardSlotsOf, countCards, currentPlayer } from './helpers';
import { CALL, CHECK, COLLECT, FOLD, GIVE_CARDS, RAISE, SHOW_CARDS, THROW_AWAY_CARDS } from '../actionTypes';

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

export function canShowCards(state: APokerState, nick: string): ?Action {
    return cardSlotsOf(state, nick).filter(cardSlot => !cardSlot.flipped).length > 0 ? SHOW_CARDS : null;
}

export function canThrowAwayCards(state: APokerState, nick: string): ?Action {
    const isWinner = state.common.game.round.winners.includes(nick);
    const isLastPlayer = activePlayers(state).length === 1 && activePlayers(state)[0] === nick;
    const hasHiddenCards = cardSlotsOf(state, nick).filter(cardSlot => !cardSlot.flipped).length > 0;

    return !isWinner && !isLastPlayer && hasHiddenCards ? THROW_AWAY_CARDS : null;
}

export function canCollect(state: APokerState, nick: string): ?Action {
    return state.common.game.round.win[nick] ? COLLECT : null;
}

function _isCurrentPlayer(state: APokerState, nick: string) {
    return state.common.game.round.currentPlayer === nick;
}
