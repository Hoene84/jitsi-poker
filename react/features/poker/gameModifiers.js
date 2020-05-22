/* eslint-disable arrow-body-style */
// @flow

import type { Deck, Player, PokerState, Suit, Symbol } from './types';

import { JOIN_GAME, START_GAME, STOP_GAME } from './actionTypes';
import { SUITS, SYMBOLS } from './constants';
import { assignToAllPlayer, assignToCommon } from './helpers';
import { canCheck, canFold, canGiveCards, canRaise } from './canDo';

export function getDeck(): Deck {
    return {
        nextIndex: 0,
        cards: Object.keys(SUITS)
            .flatMap((suit: Suit) => Object.keys(SYMBOLS)
                .map((symbol: Symbol) => {
                    return {
                        card: {
                            suit,
                            symbol
                        },
                        owner: null
                    };
                }))
    };
}

export function update(state: PokerState) {
    return updateActions(assignToCommon(state, () => ({
        lastModifiedBy: state.nick
    })));
}

export function updateActions(state: PokerState) {
    switch (state.common.game.state) {
    case 'none': {
        // return mapPlayers(state, (_) => ({actions: [JOIN_GAME]}));
        return assignToAllPlayer(state, nick => {
            return { actions: state.common.players[nick] ? [ START_GAME ] : [ JOIN_GAME ] };
        });
    }
    case 'running': {
        return assignToAllPlayer(state, nick => {
            return {
                actions: [
                    STOP_GAME,
                    canGiveCards(state, nick),
                    canCheck(state, nick),
                    canRaise(state, nick),
                    canFold(state, nick)
                ].filter(Boolean)
            };
        });
    }
    default: {
        return state;
    }
    }
}

export function giveCards(state: PokerState, owner: string, n: number): PokerState {
    const deck: ?Deck = state.common.game.deck;

    if (deck) {
        for (let i = 0; i < n; i++) {
            deck.cards[deck.nextIndex].owner = owner;
            deck.nextIndex = deck.nextIndex + 1;
        }
    }

    state.common.game.deck = deck;

    return state;
}

export function chooseDealer(players: { [string]: Player }) {
    const nicks = Object.keys(players);

    return nicks[Math.floor(Math.random() * nicks.length)];
}
