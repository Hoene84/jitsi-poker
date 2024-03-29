// @flow

import {
    JOIN_GAME,
    TAKE_OVER,
    START_GAME,
    STOP_GAME,
    GIVE_CARDS,
    NEW_STATE_RECEIVED, CHECK, RAISE, FOLD, CALL, SEND_GAME_STATE, SHOW_CARDS, THROW_AWAY_CARDS, COLLECT
} from './actionTypes';

export function joinGame(nick: string) {
    return {
        type: JOIN_GAME,
        nick
    };
}

export function takeOver(nick: string) {
    return {
        type: TAKE_OVER,
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

export function showCards() {
    return {
        type: SHOW_CARDS
    };
}

export function throwAwayCards(nick: string) {
    return {
        type: THROW_AWAY_CARDS,
        nick
    };
}

export function collect(nick: string) {
    return {
        type: COLLECT,
        nick
    };
}

export function newStateReceived(common: Object) {
    return {
        type: NEW_STATE_RECEIVED,
        common
    };
}

export function sendGameState() {
    return {
        type: SEND_GAME_STATE
    };
}
