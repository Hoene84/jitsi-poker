/* eslint-disable arrow-body-style */
// @flow

import type { APokerState, ChainablePokerState, Deck, Player, Suit, Symbol } from '../types';

import { JOIN_GAME, START_GAME, STOP_GAME } from '../actionTypes';
import { SUITS, SYMBOLS, DEFAULT_STATE } from '../constants';
import {
    activePlayers,
    assignToAllPlayer, assignToBettingRound,
    assignToCommon,
    assignToCurrentPlayer,
    assignToGame,
    assignToPlayer,
    assignToPlayers, assignToRound,
    assignToState,
    chain,
    chainableAssign,
    countCards,
    currentPlayer, logState,
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
                .sort(() => Math.random() - 0.5)
    };
}

export function update(initialState: APokerState) {
    return chain(initialState)
    .then(state => updateGame(state))
    .then(state => updateActions(assignToCommon(state, () => ({
        lastModifiedBy: state.nick
    }))))
    .then(state => logState(state));
}

export function updateGame(state: APokerState): ChainablePokerState {
    return assignToRound(state, () => ({
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

export function nextBettingRound(initialState: APokerState) {
    switch (initialState.common.game.round.state) {
    case 'preflop': {
        return chain(initialState)
        .then(state => assignToBettingRound(state, () => DEFAULT_STATE.common.game.round.bettingRound))
        .then(state => giveCardsTo(state, 'table', 3))
        .then(state => assignToRound(state, () => ({ state: 'flop' })));
    }
    case 'flop': {
        return chain(initialState)
        .then(state => assignToBettingRound(state, () => DEFAULT_STATE.common.game.round.bettingRound))
        .then(state => giveCardsTo(state, 'table', 1))
        .then(state => assignToRound(state, () => ({ state: 'turn' })));
    }
    case 'turn': {
        return chain(initialState)
        .then(state => assignToBettingRound(state, () => DEFAULT_STATE.common.game.round.bettingRound))
        .then(state => giveCardsTo(state, 'table', 1))
        .then(state => assignToRound(state, () => ({ state: 'river' })));
    }
    case 'river': {
        return chain(initialState)
        .then(state => collect(state))
        .then(state => newRound(state));
    }
    }

    return chain(initialState);
}

export function newRound(initialState: APokerState) {
    return chain(initialState)
    .then(state => assignToGame(state, game => ({
        dealer: nextPlayerAfter(state, game.dealer)
    })))
    .then(state => assignToAllPlayer(state, () => {
        return { fold: false };
    }))
    .then(state => assignToRound(state, () => DEFAULT_STATE.common.game.round))
    .then(state => assignToRound(state, () => ({
        deck: getDeck(),
        currentPlayer: nextPlayerAfter(state, state.common.game.dealer),
        bet: state.common.game.blind.big
    })));
}

export function nextPlayer(initialState: APokerState) {
    return chain(initialState)
    .then(state => tryFinishBettingRound(state))
    .then(state => assignToRound(state, () => ({
        currentPlayer: nextPlayerAfter(state)
    })));
}

export function tryFinishBettingRound(initialState: APokerState) {
    const isDealer = initialState.common.game.dealer === initialState.common.game.round.currentPlayer;
    const allCalled = isDealer && (currentPlayer(initialState)?.bet || 0) === initialState.common.game.round.bet;

    if (allCalled || activePlayers(initialState).length < 2) {
        return nextBettingRound(initialState);
    }

    return chain(initialState);
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
    const deck: ?Deck = state.common.game.round.deck;

    if (deck) {
        for (let i = 0; i < n; i++) {
            deck.cards[deck.nextIndex].owner = owner;
            deck.nextIndex = deck.nextIndex + 1;
        }
    }

    state.common.game.round.deck = deck;

    return assignToRound(state, () => ({ deck }));
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


export function payBlinds(initialState: APokerState) {
    const small = nextPlayerAfter(initialState, initialState.common.game.dealer);
    const big = nextPlayerAfter(initialState, small);

    return chain(initialState)
    .then(state => _payBlind(state, small, state.common.game.blind.small))
    .then(state => _payBlind(state, big, state.common.game.blind.big))
    .then(state => assignToRound(state, () => ({ bet: state.common.game.blind.big })));
}

export function checkSeatControl(initialState: APokerState) {
    if (initialState.common.lastModifiedBy === initialState.nick) {
        return chain(initialState).then(state => assignToState(state, () => ({
            nick: state.common.lastModifiedBy === state.nick ? null : state.nick
        })))
        .then(state => update(state));
    }

    return chain(initialState);
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
