// @flow

import type {
    APokerState,
    Card, CardSlot,
    ChainablePokerState,
    CommonState,
    Game,
    Player,
    PlayerEntry,
    PokerState
} from '../types';
import { assign as reduxAssign } from '../../base/redux';
import { OWNER_TABLE } from '../constants';

// workaround for https://github.com/facebook/flow/issues/4312?
function assign<T: Object>(target: T, source: $Shape<T>): T {
    return reduxAssign(target, source);
}

export function chainableAssign<T: Object>(target: T, source: $Shape<T>): ChainablePokerState {
    return chain(reduxAssign(target, source));
}

export function chain(state: APokerState): ChainablePokerState {
    return {
        ...state,
        then: func => func(state)
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
    return assignToCommon(state, common => {
        return {
            game: assign(common.game, assignFunction(common.game))
        };
    });
}

export function addToPlayers(
        state: APokerState,
        assignFunction: ({ [string]: Player }) => PlayerEntry): ChainablePokerState {
    const playerEntry = assignFunction(state.common.players);

    return assignToCommon(state, common => {
        return {
            players: {
                ...common.players,
                ...{ [playerEntry.nick]: playerEntry.player }
            }
        };
    });
}

export function assignToAllPlayer(
        state: APokerState,
        assignFunction: (string, Player) => $Shape<Player>): ChainablePokerState {
    return assignToCommon(state, common => {
        return {
            players: Object.fromEntries(Object.keys(common.players)
            .map(nick => [ nick, {
                ...common.players[nick],
                ...assignFunction(nick, common.players[nick])
            } ]))
        };
    });
}

export function assignToPlayers(
        state: APokerState,
        nicks: Array<string>,
        assignFunction: (string, Player) => $Shape<Player>): ChainablePokerState {
    // eslint-disable-next-line arrow-body-style
    return assignToAllPlayer(state, (aNick, aPlayer) => {
        return nicks.includes(aNick) ? assignFunction(aNick, aPlayer) : {};
    });
}

export function assignToPlayer(
        state: APokerState,
        nick: string,
        assignFunction: (string, Player) => $Shape<Player>): ChainablePokerState {
    // eslint-disable-next-line arrow-body-style
    return assignToAllPlayer(state, (aNick, aPlayer) => {
        return nick === aNick ? assignFunction(nick, aPlayer) : {};
    });
}

export function assignToCurrentPlayer(
        state: APokerState,
        assignFunction: (string, Player) => $Shape<Player>): ChainablePokerState {
    return state.common.game.currentPlayer
        ? assignToPlayer(state, state.common.game.currentPlayer, assignFunction)
        : chain(state);
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

export function player(state: APokerState, nick: string): Player {
    return state.common.players[nick];
}

export function players(state: APokerState): Array<Player> {
    return Object.keys(state.common.players).map(nick => state.common.players[nick]);
}

export function activePlayers(state: APokerState): Array<string> {
    return Object.keys(state.common.players).filter(nick => !player(state, nick).fold);
}

export function cards(state: APokerState, nick: string): Array<Card> {
    return cardSlots(state)
        .filter(slot => [ nick, OWNER_TABLE ].includes(slot.owner))
        .map(slot => slot.card);
}

export function cardSlots(state: APokerState): Array<CardSlot> {
    return state.common.game.deck?.cards || [];
}

export function isNotInSeatControl(state: APokerState, nick: string) {
    return state.nick === null && state.common.players[nick];
}
