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
    update
} from './gameModifiers';
import {
    assignToCurrentPlayer,
    assignToGame,
    assignToPlayers,
    assignToState,
    currentPlayer,
    nextPlayerAfter
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
        return assignToPlayers(initialState, () => ({
            nick: action.nick,
            player: {
                amount: initialState.common.game.startAmount,
                actions: [],
                bet: 0,
                fold: true
            }
        }))
        .next(state => assignToState(state, () => ({
            nick: action.nick
        })))
        .next(state => update(state));
    }
    case STOP_GAME: {
        return assignToState(initialState, () => DEFAULT_STATE)
        .next(state => update(state));
    }
    case START_GAME: {
        return assignToGame(initialState, () => ({
            dealer: chooseDealer(initialState.common.players)
        }))
        .next(state => assignToGame(state, () => ({
            state: 'running'
        })))
        .next(state => newRound(state))
        .next(state => update(state));
    }
    case GIVE_CARDS: {
        return giveCards(initialState)
        .next(state => payBlinds(state))
        .next(state => update(state));
    }
    case CHECK: {
        return assignToGame(initialState, () => ({
            currentPlayer: nextPlayerAfter(initialState)
        }))
        .next(state => update(state));
    }
    case CALL: {
        return toBet(initialState, initialState.common.game.bet - (currentPlayer(initialState)?.bet || 0))
        .next(state => assignToGame(state, () => ({
            raisePlayer: state.common.game.currentPlayer
        })))
        .next(state => assignToGame(state, () => ({
            currentPlayer: nextPlayerAfter(state)
        })))
        .next(state => update(state));
    }
    case RAISE: {
        return assignToCurrentPlayer(initialState, (nick, player) => ({
            amount: player.amount - action.amount,
            bet: player.bet + action.amount
        }))
        .next(state => assignToGame(state, () => ({
            raisePlayer: state.common.game.currentPlayer
        })))
        .next(state => assignToGame(state, () => ({
            currentPlayer: nextPlayerAfter(state)
        })))
        .next(state => update(state));
    }
    case FOLD: {
        return assignToGame(initialState, () => ({
            pot: initialState.common.game.pot + currentPlayer(initialState)?.bet
        }))
        .next(state => assignToCurrentPlayer(state, () => {
            return {
                fold: true,
                bet: 0
            };
        }))
        .next(state => assignToGame(state, () => ({
            currentPlayer: nextPlayerAfter(state)
        })))
        .next(state => update(state));
    }
    case NEW_STATE_RECEIVED: {
        return assignToState(initialState, () => ({
            common: action.common
        }));
    }
    }

    return initialState;
});
