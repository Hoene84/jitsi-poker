// @flow

import type { Deck, Player, PokerState, Suit, Symbol } from './types';

import { GIVE_CARDS, JOIN_GAME, STOP_GAME, START_GAME } from './actionTypes';
import { SUITS, SYMBOLS } from './constants';
import { assign, countCards } from './helpers';

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
    return updateActions(assign(state, {
        common: assign(state.common, {
            lastModifiedBy: state.nick
        })
    }));
}

export function updateActions(state: PokerState) {
    switch (state.common.game.state) {
    case 'none': {
        // return mapPlayers(state, (_) => ({actions: [JOIN_GAME]}));
        return mapPlayers(state, nick => {
            return { actions: state.common.players[nick] ? [ START_GAME ] : [ JOIN_GAME ] };
        });
    }
    case 'running': {
        return mapPlayers(state, nick => {
            let actions = [ STOP_GAME ];
            const otherNicks = Object.keys(state.common.players);

            const isDealer = state.common.game.dealer === nick;
            const cardsMissing = otherNicks.some(playerNick => countCards(state, playerNick) < 2);

            actions = actions.concat(isDealer && cardsMissing ? [ GIVE_CARDS ] : []);

            return { actions };
        });
    }
    default: {
        return state;
    }
    }
}

export function mapPlayers(state: PokerState, mappingFunction: (string) => $Shape<Player>) {
    return assign(state, {
        common: {
            ...state.common,
            players: Object.fromEntries(Object.entries(state.common.players).map(([ nick, player ]) => [ nick, {
                ...player,
                ...mappingFunction(nick)
            } ]))
        }
    });
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
