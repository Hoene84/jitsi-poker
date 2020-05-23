/* eslint-disable arrow-body-style */
// @flow

import type { APokerState, PokerState } from './types';

import { ReducerRegistry } from '../base/redux';
import {
    chooseDealer,
    getDeck,
    giveCards,
    payBlinds,
    update
} from './gameModifiers';
import {
    assignToCurrentPlayer,
    assignToGame,
    assignToPlayers,
    assignToState,
    chainableAssign,
    countCards,
    currentPlayer,
    nextPlayerAfter
} from './helpers';

import {
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
            dealer: null,
            deck: null,
            pot: 0,
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
            state: 'running',
            deck: getDeck(),
            currentPlayer: nextPlayerAfter(initialState, state.common.game.dealer)
        })))
        .next(state => update(state));
    }
    case GIVE_CARDS: {
        const nicks: Array<string> = Object.keys(initialState.common.players);

        return nicks.reduce((modifiedState: APokerState, nick: string) => {
            const missingCards = 2 - countCards(modifiedState, nick);

            return giveCards(modifiedState, nick, missingCards);
        }, chainableAssign(initialState, {}))
        .next(state => payBlinds(state))
        .next(state => update(state));
    }
    case CHECK: {
        return assignToGame(initialState, () => ({
            currentPlayer: nextPlayerAfter(initialState)
        }))
        .next(state => update(state));
    }
    case RAISE: {
        return assignToCurrentPlayer(initialState, (nick, player) => ({
            amount: player.amount - action.amount,
            bet: player.bet + action.amount
        }))
        .next(state => assignToGame(state, () => ({
            currentPlayer: nextPlayerAfter(state)
        })))
        .next(state => update(state));
    }
    case FOLD: {
        return assignToGame(initialState, () => ({
            currentPlayer: nextPlayerAfter(initialState),
            pot: initialState.common.game.pot + currentPlayer(initialState)?.bet
        }))
        .next(state => assignToCurrentPlayer(state, () => {
            return {
                fold: true,
                bet: 0
            };
        }))
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
