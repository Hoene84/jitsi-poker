// @flow

import { assign, ReducerRegistry } from '../base/redux';
import { getDeck, updatePossibleActions, mapPlayers, getCardsFromDeck, chooseDealer } from './helpers'

import { JOIN_GAME, START_GAME, GIVE_CARDS, TURN_FLOP, NEW_STATE_RECEIVED } from './actionTypes';
import uuid from "uuid";

const DEFAULT_STATE = {
    common: {
        game: {
            id: null,
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
        return updatePossibleActions(assign(state, {
            common: {
                ...state.common,
                game: {
                    ...state.common.game,
                    id: uuid.v4().toUpperCase(),
                },
                players: {
                    ...state.common.players,
                    [action.nick]: {
                        amount: state.common.game.start_amount,
                        cards: null,
                        actions: []
                    }
                },
            }
        }));
    }
    case START_GAME: {
        return updatePossibleActions(assign(state, {
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
        return updatePossibleActions(mapPlayers(newState, () => ({cards : cards.splice(0, 2)})));
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
