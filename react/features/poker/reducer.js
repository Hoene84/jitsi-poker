/* eslint-disable arrow-body-style */
// @flow

import { ReducerRegistry } from '../base/redux';
import { checkSeatControl, chooseDealer, giveCards, newRound, nextPlayer, toBet, update } from './logic/gameModifiers';
import {
    addToPlayers,
    assignToBettingRound,
    assignToCommon,
    assignToCurrentPlayer,
    assignToGame,
    assignToRound,
    assignToState,
    chain,
    currentPlayer
} from './logic/helpers';

import {
    CALL,
    CHECK,
    FOLD,
    GIVE_CARDS,
    JOIN_GAME,
    NEW_STATE_RECEIVED,
    RAISE,
    SEND_GAME_STATE,
    START_GAME,
    STOP_GAME,
    TAKE_OVER
} from './actionTypes';

import { DEFAULT_STATE } from './constants';

ReducerRegistry.register('features/poker', (initialState = DEFAULT_STATE, action) => {
    switch (action.type) {
    case JOIN_GAME: {
        return chain(initialState)
        .then(state => addToPlayers(state, () => ({
            nick: action.nick,
            player: {
                amount: state.common.game.startAmount,
                actions: [],
                bet: 0,
                fold: true
            }
        })))
        .then(state => assignToState(state, () => ({
            nick: action.nick
        })))
        .then(state => update(state));
    }
    case TAKE_OVER: {
        return chain(initialState)
        .then(state => assignToState(state, () => ({
            nick: action.nick
        })))
        .then(state => update(state));
    }
    case STOP_GAME: {
        return chain(initialState)
        .then(state => assignToCommon(state, () => DEFAULT_STATE.common))
        .then(state => update(state));
    }
    case START_GAME: {
        return chain(initialState)
        .then(state => assignToGame(state, () => ({
            dealer: chooseDealer(state),
            state: 'running'
        })))
        .then(state => newRound(state))
        .then(state => update(state));
    }
    case GIVE_CARDS: {
        return chain(initialState)
        .then(state => giveCards(state))
        .then(state => update(state));
    }
    case CHECK: {
        return chain(initialState)
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case CALL: {
        return chain(initialState)
        .then(state => toBet(state, state.common.game.round.bet - (currentPlayer(state)?.bet || 0)))
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case RAISE: {
        return chain(initialState)
        .then(state => assignToCurrentPlayer(state, (nick, player) => ({
            amount: player.amount - action.amount,
            bet: player.bet + action.amount
        })))
        .then(state => assignToBettingRound(state, () => ({
            raisePlayer: state.common.game.round.currentPlayer
        })))
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case FOLD: {
        return chain(initialState)
        .then(state => assignToRound(state, game => ({
            pot: game.pot + currentPlayer(state)?.bet
        })))
        .then(state => assignToCurrentPlayer(state, () => {
            return {
                fold: true
            };
        }))
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case NEW_STATE_RECEIVED: {
        return chain(initialState)
        .then(state => assignToState(state, () => ({
            common: action.common
        })))
        .then(state => checkSeatControl(state));
    }
    case SEND_GAME_STATE: {
        return chain(initialState)
        .then(state => update(state));
    }
    }

    return initialState;
});
