// @flow

import {
    TURN_FLOP,
    NEW_STATE_RECEIVED,
} from './actionTypes';

export function turnFlop() {
    return {
        type: TURN_FLOP
    };
}

export function new_state_received(state : Object) {
    return {
        type: NEW_STATE_RECEIVED,
        state
    };
}
