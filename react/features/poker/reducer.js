// @flow

import {  ReducerRegistry } from '../base/redux';

import { TURN_FLOP, NEW_STATE_RECEIVED } from './actionTypes';

const DEFAULT_STATE = {
    board: ['empty'],
};

ReducerRegistry.register('features/poker', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case TURN_FLOP: {
        return {
            ...state,
            board: ['AK', 'AH'],
        };
    }
    case NEW_STATE_RECEIVED: {
        return action.state;
    }
    }

    return state;
});
