/* eslint-disable arrow-body-style */
// @flow

import type { PokerState } from './types';

import { ReducerRegistry } from '../base/redux';
import {
    getDeck,
    update,
    giveCards,
    chooseDealer
} from './gameModifiers';
import {
    countCards,
    nextPlayerAfter,
    currentPlayer,
    assignToGame, assignToCurrentPlayer, assignToState, assignToPlayers
} from './helpers';

import {
    JOIN_GAME,
    START_GAME,
    STOP_GAME,
    GIVE_CARDS,
    NEW_STATE_RECEIVED,
    CHECK,
    RAISE,
    FOLD
} from './actionTypes';
import uuid from 'uuid';

const DEFAULT_STATE: PokerState = {
    common: {
        game: {
            id: uuid.v4().toUpperCase(),
            ticks: 0,
            state: 'none',
            startAmount: 20000,
            currentPlayer: null,
            dealer: null,
            deck: null,
            pot: 0
        },
        table: [],
        players: {},
        lastModifiedBy: null
    },
    nick: null
};

ReducerRegistry.register('features/poker', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case JOIN_GAME: {
        const newState = assignToPlayers(state, () => ({
            [action.nick]: {
                amount: state.common.game.startAmount,
                cards: null,
                actions: []
            }
        }));

        return update(assignToState(newState, () => ({
            nick: action.nick
        })));
    }
    case STOP_GAME: {
        return DEFAULT_STATE;
    }
    case START_GAME: {
        const dealer = chooseDealer(state.common.players);


        return update(assignToGame(state, () => ({
            state: 'running',
            dealer,
            deck: getDeck(),
            currentPlayer: nextPlayerAfter(state, dealer)
        })));
    }
    case GIVE_CARDS: {
        const nicks: Array<string> = Object.keys(state.common.players);

        return update(nicks.reduce((modifiedState: PokerState, nick: string) => {
            const missingCards = 2 - countCards(modifiedState, nick);

            return giveCards(modifiedState, nick, missingCards);
        }, state));
    }
    case CHECK: {
        return update(assignToGame(state, () => ({
            currentPlayer: nextPlayerAfter(state)
        })));
    }
    case RAISE: {
        let newState = state;

        newState = assignToCurrentPlayer(newState, (nick, player) => ({
            amount: player.amount - action.amount,
            bet: action.amount
        }));
        newState = assignToGame(newState, () => ({
            currentPlayer: nextPlayerAfter(newState)
        }));

        return update(newState);
    }
    case FOLD: {
        return update(assignToCurrentPlayer(assignToGame(state, () => ({
            currentPlayer: nextPlayerAfter(state),
            pot: state.common.game.pot + currentPlayer(state)?.bet
        })), () => {
            return {
                fold: true,
                bet: 0
            };
        }));
    }
    case NEW_STATE_RECEIVED: {
        return assignToState(state, () => ({
            common: action.common
        }));
    }
    }

    return state;
});
