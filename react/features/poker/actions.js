// @flow

import {
    JOIN_GAME,
    START_GAME,
    GIVE_CARDS,
    TURN_FLOP,
    NEW_STATE_RECEIVED,
} from './actionTypes';

export function joinGame(nick : String) {
    return {
        type: JOIN_GAME,
        nick: nick
    };
}

export function startGame() {
    return {
        type: START_GAME
    };
}

export function giveCards() {
    return {
        type: GIVE_CARDS
    };
}

export function turnFlop() {
    return {
        type: TURN_FLOP
    };
}

export function new_state_received(common : Object) {
    return {
        type: NEW_STATE_RECEIVED,
        common
    };
}
