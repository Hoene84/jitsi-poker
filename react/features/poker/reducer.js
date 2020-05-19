// @flow

import type { PokerState } from './types';

import { ReducerRegistry } from '../base/redux';
import { getDeck, update, mapPlayers, assign, giveCards, chooseDealer } from './helpers'

import {
    JOIN_GAME,
    START_GAME,
    STOP_GAME,
    GIVE_CARDS,
    TURN_FLOP,
    NEW_STATE_RECEIVED
} from './actionTypes';
import uuid from "uuid";

const DEFAULT_STATE : PokerState = {
    common: {
        game: {
            id: uuid.v4().toUpperCase(),
            ticks: 0,
            state: 'none',
            start_amount: 20000,
            current_player: null,
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
                        amount: state.common.game.start_amount,
                        cards: null,
                        actions: []
                    }
                })
            }),
            nick: action.nick
        }));
    }
    case STOP_GAME: {
        return DEFAULT_STATE
    }
    case START_GAME: {
        return update(assign(state, {
            common: assign(state.common, {
                game: assign(state.common.game, {
                    state: 'running',
                    dealer: chooseDealer(state.common.players),
                    deck: getDeck()
                })
            })
        }));
    }
    case GIVE_CARDS: {
        const nicks : Array<string> = Object.keys(state.common.players)
        return nicks.reduce((state : PokerState, nick: string) => giveCards(state, nick, 2), state);
    }
    case NEW_STATE_RECEIVED: {
        return assign(state, {
            common: action.common
        });
    }
    }

    return state;
});
