// @flow

import type { CommonState, Game, Player, PokerState } from './types';
import { assign as reduxAssign } from '../base/redux';

// workaround for https://github.com/facebook/flow/issues/4312?
function assign<T: Object>(target: T, source: $Shape<T>): T {
    return reduxAssign(target, source);
}

export function assignToState(state: PokerState, assignFunction: (PokerState) => $Shape<PokerState>): PokerState {
    return assign(state, assignFunction(state));
}

export function assignToCommon(state: PokerState, assignFunction: (CommonState) => $Shape<CommonState>): PokerState {
    return assignToState(state, () => ({
        common: assign(state.common, assignFunction(state.common))
    }));
}

export function assignToGame(state: PokerState, assignFunction: (Game) => $Shape<Game>): PokerState {
    return assignToCommon(state, () => ({
        game: assign(state.common.game, assignFunction(state.common.game))
    }));
}

export function assignToPlayers(state: PokerState, assignFunction: ({ [string]: Player }) => $Shape<{ [string]: Player }>) {
    return assignToCommon(state, () => ({
        players: {
            ...state.common.players,
            ...assignFunction(state.common.players)
        }
    }));
}

export function assignToAllPlayer(state: PokerState, assignFunction: (string, Player) => $Shape<Player>) {
    return assignToCommon(state, () => ({
        players: Object.fromEntries(Object.keys(state.common.players)
            .map(nick => [ nick, {
                ...state.common.players[nick],
                ...assignFunction(nick, state.common.players[nick])
            } ]))
    }));
}

export function assignToCurrentPlayer(state: PokerState, assignFunction: (string, Player) => $Shape<Player>) {
    const isCurrent = nick => state.common.game.currentPlayer === nick;

    return assignToAllPlayer(state, (nick, player) => isCurrent(nick) ? assignFunction(nick, player) : {});
}

export function countCards(state: PokerState, nick: string) {
    if (!state.common.game.deck) {
        return 0;
    }

    return state.common.game.deck && state.common.game.deck.cards.filter(cardSlot => cardSlot.owner === nick).length;
}

export function nextPlayerAfter(state: PokerState, nick: ?string = state.common.game.currentPlayer) {
    const nicks = Object.keys(state.common.players);

    return nicks[(nicks.indexOf(nick) + 1) % nicks.length];
}

export function currentPlayer(state: PokerState): ?Player {
    if (state.common.game.currentPlayer) {
        return state.common.players[state.common.game.currentPlayer];
    }
}
