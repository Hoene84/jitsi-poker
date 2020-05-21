// @flow

import {
    JOIN_GAME,
    START_GAME,
    STOP_GAME,
    GIVE_CARDS,
    TURN_FLOP,
    NEW_STATE_RECEIVED
} from './actionTypes';

export function joinGame(nick: string) {
    return {
        type: JOIN_GAME,
        nick
    };
}

export function startGame() {
    return {
        type: START_GAME
    };
}


export function stopGame() {
    return {
        type: STOP_GAME
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

export function newStateReceived(common: Object) {
    return {
        type: NEW_STATE_RECEIVED,
        common
    };
}
