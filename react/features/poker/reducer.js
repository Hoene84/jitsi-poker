/* eslint-disable arrow-body-style */
// @flow

import type { PokerState } from './types';

import { ReducerRegistry } from '../base/redux';
import {
    chooseDealer,
    giveCards,
    newRound,
    payBlinds,
    toBet,
    update,
    nextPlayer
} from './gameModifiers';
import {
    assignToCurrentPlayer,
    assignToGame,
    assignToPlayers,
    assignToState,
    chain,
    currentPlayer,
} from './helpers';

import {
    CALL,
    CHECK,
    FOLD,
    GIVE_CARDS,
    JOIN_GAME,
    NEW_STATE_RECEIVED,
    RAISE,
    START_GAME,
    STOP_GAME
} from './actionTypes';
import uuid from 'uuid';

const DEFAULT_STATE: PokerState = {
    common: {
        game: {
            id: uuid.v4().toUpperCase(),
            ticks: 0,
            state: 'none',
            startAmount: 1000,
            currentPlayer: null,
            raisePlayer: null,
            dealer: null,
            deck: null,
            pot: 0,
            bet: 0,
            blind: {
                small: 5,
                big: 10
            }
        },
        table: [],
        players: {},
        lastModifiedBy: null
    },
    nick: null
};

ReducerRegistry.register('features/poker', (initialState = DEFAULT_STATE, action) => {
    switch (action.type) {
    case JOIN_GAME: {
        return chain(initialState)
        .then(state => assignToPlayers(state, () => ({
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
    case STOP_GAME: {
        return chain(initialState)
        .then(state => assignToState(state, () => DEFAULT_STATE))
        .then(state => update(state));
    }
    case START_GAME: {
        return chain(initialState)
        .then(state => assignToGame(state, () => ({
            dealer: chooseDealer(state.common.players)
        })))
        .then(state => assignToGame(state, () => ({
            state: 'running'
        })))
        .then(state => newRound(state))
        .then(state => update(state));
    }
    case GIVE_CARDS: {
        return chain(initialState)
        .then(state => giveCards(state))
        .then(state => payBlinds(state))
        .then(state => update(state));
    }
    case CHECK: {
        return chain(initialState)
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case CALL: {
        return chain(initialState)
        .then(state => toBet(state, state.common.game.bet - (currentPlayer(state)?.bet || 0)))
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case RAISE: {
        return chain(initialState)
        .then(state => assignToCurrentPlayer(state, (nick, player) => ({
            amount: player.amount - action.amount,
            bet: player.bet + action.amount
        })))
        .then(state => assignToGame(state, () => ({
            raisePlayer: state.common.game.currentPlayer
        })))
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case FOLD: {
        return chain(initialState)
        .then(state => assignToGame(state, () => ({
            pot: state.common.game.pot + currentPlayer(state)?.bet
        })))
        .then(state => assignToCurrentPlayer(state, () => {
            return {
                fold: true,
                bet: 0
            };
        }))
        .then(state => nextPlayer(state))
        .then(state => update(state));
    }
    case NEW_STATE_RECEIVED: {
        return chain(initialState)
        .then(state => assignToState(initialState, () => ({
            common: action.common
        })));
    }
    }

    return initialState;
});
