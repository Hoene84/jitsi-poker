/* eslint-disable arrow-body-style */
// @flow

import type { APokerState, ChainablePokerState, Deck, Player, Suit, Symbol } from '../types';

import { JOIN_GAME, START_GAME, STOP_GAME } from '../actionTypes';
import { SUITS, SYMBOLS } from '../constants';
import {
    activePlayers,
    assignToAllPlayer,
    assignToCommon,
    assignToCurrentPlayer,
    assignToGame,
    assignToPlayer,
    assignToPlayers,
    chain,
    chainableAssign,
    countCards,
    currentPlayer,
    nextPlayerAfter,
    players
} from './helpers';
import { canCall, canCheck, canFold, canGiveCards, canRaise } from './canDo';
import { winners } from './ranking';

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

export function update(initialState: APokerState) {
    return chain(initialState)
    .then(state => updateGame(state))
    .then(state => updateActions(assignToCommon(state, () => ({
        lastModifiedBy: state.nick
    }))));
}

export function updateGame(state: APokerState): ChainablePokerState {
    return assignToGame(state, () => ({
        bet: Math.max(...players(state).map((player: Player) => player.bet))
    }));
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
                    canCall(state, nick),
                    canRaise(state, nick),
                    canFold(state, nick)
                ].filter(Boolean)
            };
        });
    }
    default: {
        return chain(state);
    }
    }
}

export function nextRound(initialState: APokerState) {
    return chain(initialState)
    .then(state => assignToGame(state, () => ({
        dealer: nextPlayerAfter(state, state.common.game.dealer)
    })))
    .then(state => newRound(state));
}

export function newRound(initialState: APokerState) {
    return chain(initialState)
    .then(state => assignToGame(state, game => ({
        dealer: nextPlayerAfter(state, game.dealer)
    })))
    .then(state => assignToAllPlayer(state, () => {
        return { fold: false };
    }))
    .then(state => assignToGame(state, game => ({
        deck: getDeck(),
        currentPlayer: nextPlayerAfter(state, game.dealer),
        raisePlayer: null,
        pot: 0,
        bet: game.blind.big
    })));
}

export function nextPlayer(initialState: APokerState) {
    const isDealer = initialState.common.game.dealer === initialState.common.game.currentPlayer;
    const allCalled = isDealer && (currentPlayer(initialState)?.bet || 0) === initialState.common.game.bet;

    if (allCalled || activePlayers(initialState).length < 2) {
        return chain(initialState)
        .then(state => collect(state))
        .then(state => nextRound(state));
    }

    return assignToGame(initialState, () => ({
        currentPlayer: nextPlayerAfter(initialState)
    }));
}

export function collect(initialState: APokerState) {
    const allWinners = winners(initialState);
    const potForEach = players(initialState).reduce((amount, player) => {
        return amount + player.bet;
    }, 0) / allWinners.length;

    return chain(initialState)
    .then(state => assignToPlayers(state, allWinners, (_, player) => ({
        amount: player.amount + potForEach
    })))
    .then(state => assignToAllPlayer(state, () => ({
        bet: 0
    })));
}

export function giveCards(state: APokerState) {
    const nicks: Array<string> = Object.keys(state.common.players);

    return nicks.reduce((modifiedState: APokerState, nick: string) => {
        const missingCards = 2 - countCards(modifiedState, nick);

        return giveCardsTo(modifiedState, nick, missingCards);
    }, chainableAssign(state, {}));
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

export function chooseDealer(state: APokerState) {
    const nicks = Object.keys(state.common.players);

    return nicks[Math.floor(Math.random() * nicks.length)];
}

export function toBet(state: APokerState, amount: number) {
    return assignToCurrentPlayer(state, (nick, player) => ({
        amount: player.amount - amount,
        bet: player.bet + amount
    }));
}


export function payBlinds(initalState: APokerState) {
    const small = nextPlayerAfter(initalState, initalState.common.game.dealer);
    const big = nextPlayerAfter(initalState, small);

    return _payBlind(initalState, small, initalState.common.game.blind.small)
    .then(state => _payBlind(state, big, state.common.game.blind.big));
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
