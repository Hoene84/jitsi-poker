/* eslint-disable arrow-body-style */
// @flow

import type {
    APokerState,
    ChainablePokerState,
    Deck,
    Player,
    Suit,
    Symbol
} from './types';

import { JOIN_GAME, START_GAME, STOP_GAME } from './actionTypes';
import { SUITS, SYMBOLS } from './constants';
import {
    assignToAllPlayer,
    assignToCommon,
    assignToGame,
    assignToPlayer,
    chainableAssign,
    countCards,
    nextPlayerAfter
} from './helpers';
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

export function update(state: APokerState) {
    return updateActions(assignToCommon(state, () => ({
        lastModifiedBy: state.nick
    })));
}

export function updateActions(state: APokerState): ChainablePokerState {
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
        return chainableAssign(state, {});
    }
    }
}

export function giveCards(state: APokerState) {
    const nicks: Array<string> = Object.keys(state.common.players);

    return nicks.reduce((modifiedState: APokerState, nick: string) => {
        const missingCards = 2 - countCards(modifiedState, nick);

        return giveCardsTo(modifiedState, nick, missingCards);
    }, chainableAssign(state, {}))
}

export function giveCardsTo(state: APokerState, owner: string, n: number) {
    const deck: ?Deck = state.common.game.deck;

    if (deck) {
        for (let i = 0; i < n; i++) {
            deck.cards[deck.nextIndex].owner = owner;
            deck.nextIndex = deck.nextIndex + 1;
        }
    }

    state.common.game.deck = deck;

    return assignToGame(state, () => ({ deck }));
}

export function chooseDealer(players: { [string]: Player }) {
    const nicks = Object.keys(players);

    return nicks[Math.floor(Math.random() * nicks.length)];
}

export function payBlinds(initalState: APokerState) {
    const small = nextPlayerAfter(initalState, initalState.common.game.dealer);
    const big = nextPlayerAfter(initalState, small);

    return _payBlind(initalState, small, initalState.common.game.blind.small)
    .next(state => _payBlind(state, big, state.common.game.blind.big));
}

function _payBlind(state: APokerState, nick: string, amount: number) {
    return assignToPlayer(state, nick, (_, player) => {
        const amountToPay = Math.max(0, amount - player.bet);

        return {
            bet: player.bet + amountToPay,
            amount: player.amount - amountToPay
        };
    });
}
