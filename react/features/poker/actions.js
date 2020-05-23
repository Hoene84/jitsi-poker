// @flow

import {
    JOIN_GAME,
    START_GAME,
    STOP_GAME,
    GIVE_CARDS,
    NEW_STATE_RECEIVED, CHECK, RAISE, FOLD, CALL
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

export function check() {
    return {
        type: CHECK
    };
}

export function call() {
    return {
        type: CALL
    };
}
export function raise(amount: number) {
    return {
        type: RAISE,
        amount
    };
}

export function fold() {
    return {
        type: FOLD
    };
}

export function newStateReceived(common: Object) {
    return {
        type: NEW_STATE_RECEIVED,
        common
    };
}
