// @flow

import type { PokerState } from './types';

import { ReducerRegistry } from '../base/redux';
import { getDeck, update, mapPlayers, assign, getCardsFromDeck, chooseDealer } from './helpers'

import { JOIN_GAME, START_GAME, GIVE_CARDS, TURN_FLOP, NEW_STATE_RECEIVED } from './actionTypes';
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
            common: {
                ...state.common,
                players: {
                    ...state.common.players,
                    [action.nick]: {
                        amount: state.common.game.start_amount,
                        cards: null,
                        actions: []
                    }
                },
            },
            nick: action.nick
        }));
    }
    case START_GAME: {
        return update(assign(state, {
            common: {
                ...state.common,
                game: {
                    ...state.common.game,
                    state: 'running',
                    dealer: chooseDealer(state.common.players),
                    deck: getDeck()
                },
            }
        }));
    }
    case GIVE_CARDS: {
        const result = getCardsFromDeck(state, Object.keys(state.common.players).length * 2);
        const {newState, cards} = result;
        return update(mapPlayers(newState, () => (
            {
                card1 : (cards && cards[0]),
                card2 : (cards && cards[1])
            })));
    }
    case TURN_FLOP: {
        return {
            ...state,
            common: {
                ...state.common,
                table: ['AK', 'AH']
            },
        };
    }
    case NEW_STATE_RECEIVED: {
        return assign(state, {
            common: action.common
        });
    }
    }

    return state;
});
