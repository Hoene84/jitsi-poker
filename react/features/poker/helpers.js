// @flow

import type {
    APokerState,
    ChainablePokerState,
    CommonState,
    Game,
    Player,
    PlayerEntry,
    PokerState
} from './types';
import { assign as reduxAssign } from '../base/redux';

// workaround for https://github.com/facebook/flow/issues/4312?
function assign<T: Object>(target: T, source: $Shape<T>): T {
    return reduxAssign(target, source);
}

export function chainableAssign<T: Object>(target: T, source: $Shape<T>): ChainablePokerState {
    const state = reduxAssign(target, source);

    return {
        ...state,
        next: (func: (PokerState) => PokerState) => func(state)
    };
}

export function assignToState(
        state: APokerState,
        assignFunction: (APokerState) =>$Shape<PokerState>): ChainablePokerState {
    return chainableAssign(state, assignFunction(state));
}

export function assignToCommon(
        state: APokerState,
        assignFunction: (CommonState) => $Shape<CommonState>): ChainablePokerState {
    return assignToState(state, () => {
        return {
            common: assign(state.common, assignFunction(state.common))
        };
    });
}

export function assignToGame(state: APokerState, assignFunction: (Game) => $Shape<Game>): ChainablePokerState {
    return assignToCommon(state, () => {
        return {
            game: assign(state.common.game, assignFunction(state.common.game))
        };
    });
}

export function assignToPlayers(
        state: APokerState,
        assignFunction: ({ [string]: Player }) => PlayerEntry): ChainablePokerState {
    const playerEntry = assignFunction(state.common.players);

    return assignToCommon(state, () => {
        return {
            players: {
                ...state.common.players,
                ...{ [playerEntry.nick]: playerEntry.player }
            }
        };
    });
}

export function assignToAllPlayer(
        state: APokerState,
        assignFunction: (string, Player) => $Shape<Player>): ChainablePokerState {
    return assignToCommon(state, () => {
        return {
            players: Object.fromEntries(Object.keys(state.common.players)
            .map(nick => [ nick, {
                ...state.common.players[nick],
                ...assignFunction(nick, state.common.players[nick])
            } ]))
        };
    });
}

export function assignToPlayer(
        state: APokerState,
        nick: string,
        assignFunction: (string, Player) => $Shape<Player>): ChainablePokerState {
    // eslint-disable-next-line arrow-body-style
    return assignToAllPlayer(state, (aNick, player) => {
        return nick === aNick ? assignFunction(nick, player) : {};
    });
}

export function assignToCurrentPlayer(
        state: APokerState,
        assignFunction: (string, Player) => $Shape<Player>): ChainablePokerState {
    return state.common.game.currentPlayer
        ? assignToPlayer(state, state.common.game.currentPlayer, assignFunction)
        : chainableAssign(state, {});
}

export function countCards(state: APokerState, nick: string) {
    return state.common.game.deck ? state.common.game.deck.cards.filter(cardSlot => cardSlot.owner === nick).length : 0;
}

export function nextPlayerAfter(state: APokerState, nick: ?string = state.common.game.currentPlayer) {
    const nicks = Object.keys(state.common.players);

    return nicks[(nicks.indexOf(nick) + 1) % nicks.length];
}

export function currentPlayer(state: APokerState): ?Player {
    if (state.common.game.currentPlayer) {
        return state.common.players[state.common.game.currentPlayer];
    }
}

export function players(state: APokerState): Array<Player> {
    return Object.keys(state.common.players).map(nick => state.common.players[nick]);
}
