// @flow

import type { PokerState } from './types';

import { ReducerRegistry } from '../base/redux';
import { getDeck, update, giveCards, chooseDealer } from './gameModifiers';
import { assign, countCards, nextPlayerAfter } from './helpers';

import {
    JOIN_GAME,
    START_GAME,
    STOP_GAME,
    GIVE_CARDS,
    NEW_STATE_RECEIVED
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
            deck: null
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
        return update(assign<PokerState>(state, {
            common: assign(state.common, {
                players: assign(state.common.players, {
                    [action.nick]: {
                        amount: state.common.game.startAmount,
                        cards: null,
                        actions: []
                    }
                })
            }),
            nick: action.nick
        }));
    }
    case STOP_GAME: {
        return DEFAULT_STATE;
    }
    case START_GAME: {
        const dealer = chooseDealer(state.common.players);


        return update(assign(state, {
            common: assign(state.common, {
                game: assign(state.common.game, {
                    state: 'running',
                    dealer,
                    deck: getDeck(),
                    currentPlayer: nextPlayerAfter(state, dealer)
                })
            })
        }));
    }
    case GIVE_CARDS: {
        const nicks: Array<string> = Object.keys(state.common.players);

        return update(nicks.reduce((modifiedState: PokerState, nick: string) => {
            const missingCards = 2 - countCards(modifiedState, nick);

            return giveCards(modifiedState, nick, missingCards);
        }, state));
    }
    case NEW_STATE_RECEIVED: {
        return assign(state, {
            common: action.common
        });
    }
    }

    return state;
});
