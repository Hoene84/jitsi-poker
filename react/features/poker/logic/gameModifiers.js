/* eslint-disable arrow-body-style */
// @flow

import type { APokerState, ChainablePokerState, Deck, Player, Suit, Symbol } from '../types';

import { JOIN_GAME, START_GAME, STOP_GAME } from '../actionTypes';
import { DEFAULT_STATE, SUITS, SYMBOLS } from '../constants';
import {
    activePlayers,
    addStagePerformance,
    assignToAllPlayer,
    assignToBettingRound,
    assignToCardSlotsOf,
    assignToCommon,
    assignToCurrentPlayer,
    assignToGame,
    assignToPlayer,
    assignToRound,
    assignToState,
    cardSlots,
    chain,
    chainableAssign,
    countCards,
    logState,
    nextPlayerAfter,
    getPlayer,
    players
} from './helpers';
import {
    canCall,
    canCheck,
    canCollect,
    canFold,
    canGiveCards,
    canRaise,
    canShowCards,
    canThrowAwayCards
} from './canDo';
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
                        owner: null,
                        flipped: false
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

export function updateGame(initialState: APokerState): ChainablePokerState {
    return chain(initialState)
    .then(state => assignToRound(state, () => ({
        bet: Math.max(...players(state).map((player: Player) => player.bet))
    })))
    .then(state => assignToRound(state, () => ({
        winners: winners(state)
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
                    canCall(state, nick),
                    canRaise(state, nick),
                    canFold(state, nick)
                ].filter(Boolean)
            };
        });
    }
    case 'showdown': {
        return assignToAllPlayer(state, nick => {
            return {
                actions: [
                    STOP_GAME,
                    canShowCards(state, nick),
                    canThrowAwayCards(state, nick),
                    canCollect(state, nick)
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
        .then(state => showdown(state))
        .then(state => assignToRound(state, () => ({ currentPlayer: null })));
    }
    }

    return chain(initialState);
}

export function newRound(initialState: APokerState) {
    return chain(initialState)
    .then(state => assignToAllPlayer(state, () => {
        return { fold: false };
    }))
    .then(state => assignToGame(state, game => ({
        dealer: nextPlayerAfter(state, game.dealer),
        state: 'running'
    })))
    .then(state => assignToRound(state, () => DEFAULT_STATE.common.game.round))
    .then(state => payBlinds(state))
    .then(state => assignToRound(state, () => ({
        deck: getDeck(),
        currentPlayer: nextPlayerAfter(state, state.common.game.dealer)
    })))
    .then(state => addStagePerformance(state, state.common.game.round.currentPlayer));
}

export function nextPlayer(initialState: APokerState) {
    return chain(initialState)
    .then(state => tryFinishBettingRound(state))
    .then(state => setCurrentAsDominantSpeaker(state));
}

export function tryFinishBettingRound(initialState: APokerState) {
    const nextIsRaisePlayer = nextPlayerAfter(initialState) === initialState.common.game.round.bettingRound.raisePlayer;
    const isDealer = initialState.common.game.dealer === initialState.common.game.round.currentPlayer;

    const allCalled = !activePlayers(initialState).some(nick => {
        const bet = initialState.common.players[nick]?.bet || 0;

        return bet < initialState.common.game.round.bet;
    });

    if (activePlayers(initialState).length < 2) {
        return chain(initialState)
        .then(state => betToPot(state, activePlayers(state)[0]))
        .then(state => assignToRound(state, () => ({
            winners: [ activePlayers(state)[0] ]
        })))
        .then(state => assignToGame(state, () => ({
            state: 'showdown'
        })))
        .then(state => calculatePot(state));
    }

    if (nextIsRaisePlayer || (isDealer && allCalled)) {
        return nextBettingRound(initialState)
        .then(state => assignToRound(state, () => ({
            currentPlayer: nextPlayerAfter(state, state.common.game.dealer)
        })))
        .then(state => addStagePerformance(state, 'table'));
    }

    return assignToRound(initialState, () => ({
        currentPlayer: nextPlayerAfter(initialState)
    }));
}

export function showdown(initialState: APokerState) {

    return chain(initialState)
    .then(state => assignToGame(state, () => ({
        state: 'showdown'
    })))
    .then(state => assignToRound(state, () => ({
        pot: players(state).map(player => player.bet)
.reduce((a, b) => a + b)
    })))
    .then(state => assignToAllPlayer(state, () => ({
        bet: 0
    })));
}

export function collect(initialState: APokerState, nick: string) {
    const potForEach = initialState.common.game.round.pot / initialState.common.game.round.winners.length;

    return chain(initialState)
    .then(state => assignToPlayer(state, nick, player => {
        const amount = player.amount + state.common.game.round.win[nick];

        delete state.common.game.round.win[nick];

        return { amount };
    }))
    .then(state => assignToRound(state, round => ({
        pot: round.pot - potForEach
    })))
    .then(state => tryFinishRound(state))
    .then(state => addStagePerformance(state, nick));
}

export function tryFinishRound(initialState: APokerState) {
    if (initialState.common.game.round.pot === 0) {
        return newRound(initialState);
    }

    return chain(initialState);
}

export function giveCards(initialState: APokerState) {
    const nicks: Array<string> = Object.keys(initialState.common.players);

    return nicks.reduce((modifiedState: APokerState, nick: string) => {
        const missingCards = 2 - countCards(modifiedState, nick);

        return giveCardsTo(modifiedState, nick, missingCards)
        .then(state => assignToPlayer(state, nick, () => {
            return { fold: false };
        }));
    }, chainableAssign(initialState, {}));
}

export function giveCardsTo(state: APokerState, owner: string, n: number) {
    const deck: ?Deck = state.common.game.round.deck;

    if (deck) {
        for (let i = 0; i < n; i++) {
            deck.cards[deck.nextIndex].owner = owner;
            if (owner === 'table') {
                deck.cards[deck.nextIndex].flipped = true;
            }
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
    return assignToCurrentPlayer(state, player => ({
        amount: player.amount - amount,
        bet: player.bet + amount
    }));
}

export function betToPot(initialState: APokerState, nick: string) {
    return chain(initialState)
    .then(state => assignToRound(state, round => ({
        pot: round.pot + getPlayer(state, nick).bet
    })))
    .then(state => assignToPlayer(state, nick, () => ({
        bet: 0
    })));
}

export function showCards(initialState: APokerState, nick: ?string): ChainablePokerState {
    return assignToCardSlotsOf(initialState, nick, () => {
        return { flipped: true };
    })
    .then(state => tryFinishShowdown(state));
}

export function throwAwayCards(initialState: APokerState, nick: ?string): ChainablePokerState {
    return assignToCardSlotsOf(initialState, nick, () => {
        return { owner: null };
    })
    .then(state => tryFinishShowdown(state));
}

export function tryFinishShowdown(initialState: APokerState) {
    if (new Set(cardSlots(initialState).filter(slot => slot.owner && !slot.flipped)
.map(cardSlot => cardSlot.owner)).size <= 1) {
        return calculatePot(initialState);
    }

    return chain(initialState);
}

export function calculatePot(initialState: APokerState) {
    const potForEach = initialState.common.game.round.pot / initialState.common.game.round.winners.length;

    return assignToRound(initialState, () => ({
        win: Object.fromEntries(initialState.common.game.round.winners.map(winner => [ winner, potForEach ]))
    }));
}

export function payBlinds(initialState: APokerState) {
    const small = nextPlayerAfter(initialState, initialState.common.game.dealer);
    const big = nextPlayerAfter(initialState, small);

    return chain(initialState)
    .then(state => _payBlind(state, small, state.common.game.blind.small))
    .then(state => _payBlind(state, big, state.common.game.blind.big))
    .then(state => assignToRound(state, () => ({
        bet: state.common.game.blind.big,
        raiseAmount: state.common.game.blind.big
    })));
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
    return assignToPlayer(state, nick, player => {
        const amountToPay = Math.max(0, amount - player.bet);

        return {
            bet: player.bet + amountToPay,
            amount: player.amount - amountToPay
        };
    });
}

function setCurrentAsDominantSpeaker(initialState: APokerState) {
    return chain(initialState)
    .then(state => addStagePerformance(state, state.common.game.round.bettingRound.raisePlayer, 0))
    .then(state => addStagePerformance(state, state.common.game.round.currentPlayer));
}
