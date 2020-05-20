// @flow

import type { Deck, Player, PokerState, Suit, Symbol } from './types';

import { GIVE_CARDS, JOIN_GAME, STOP_GAME, START_GAME } from './actionTypes';
import { SUITS, SYMBOLS } from './constants';
import { assign as reduxAssign} from '../base/redux';

//workaround for https://github.com/facebook/flow/issues/4312?
export function assign<T: Object>(target: T, source: $Shape<T>) : T {
    return reduxAssign(target, source)
}

export function getDeck(): Deck {
    return {
        nextIndex: 0,
        cards: Object.keys(SUITS)
            .flatMap((suit) => Object.keys(SYMBOLS)
                .map((symbol) => {
                    return {
                        card: {
                            suit: (suit: Suit),
                            symbol: (symbol: Symbol)
                        },
                        owner: null
                    };
                }))
    };
}

export function update(state : PokerState) {
    return updateActions(assign(state, {
        common: assign(state.common, {
            lastModifiedBy: state.nick
        })
    }));
}

export function updateActions(state : PokerState) {
    switch (state.common.game.state) {
    case 'none': {
        // return mapPlayers(state, (_) => ({actions: [JOIN_GAME]}));
        return mapPlayers(state, (nick) => ({actions: state.common.players[nick] ? [START_GAME] : [JOIN_GAME]}));
    }
    case 'running': {
        return mapPlayers(state, (nick) => {
            let actions = [STOP_GAME];
            actions = actions.concat(state.common.game.dealer === nick && Object.keys(state.common.players).some(nick => countCards(state, nick) < 2) ? [GIVE_CARDS] : []);
            return { actions: actions };
        });
    }
    default: {
        return state;
    }
    }
}

export function countCards(state : PokerState, nick : string) {
    if(!state.common.game.deck) return 0;
    return state.common.game.deck && state.common.game.deck.cards.filter(cardSlot => cardSlot.owner === nick).length;
}

export function mapPlayers(state : PokerState, mappingFunction : (string) => $Shape<Player>){
    return assign(state, {
        common: {
            ...state.common,
            players: Object.fromEntries(Object.entries(state.common.players).map(([nick, player]) => {
                const x = mappingFunction(nick)
                return [ nick, {...player, ...x } ];
            })),
        }
    });
}

export function giveCards(state : PokerState, owner: string, n : number) : PokerState {
    const deck : ?Deck = state.common.game.deck;
    for (let i = 0; i < n && deck; i++) {
        deck.cards[deck.nextIndex].owner = owner;
        deck.nextIndex = deck.nextIndex + 1
    }
    state.common.game.deck = deck;
    return state
}

export function chooseDealer(players : { [string]: Player }) {
    const nicks = Object.keys(players)
    return nicks[Math.floor(Math.random() * nicks.length)]
}
