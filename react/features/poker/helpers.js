// @flow

import type { Card, Player, PokerState, Suit, Symbol } from './types';

import { GIVE_CARDS, JOIN_GAME, START_GAME } from './actionTypes';
import { SUITS, SYMBOLS } from './constants';
import { assign as reduxAssign} from '../base/redux';

//workaround for https://github.com/facebook/flow/issues/4312?
export function assign<T: Object>(target: T, source: $Shape<T>) : T {
    return reduxAssign(target, source)
}

export function getDeck() : Array<Card> {
    return Object.keys(SUITS)
        .flatMap((suit) => Object.keys(SYMBOLS)
            .map((symbol) => {
                const x: Card = {
                    suit: (suit: Suit),
                    symbol: (symbol: Symbol)
                };
                return x;
            }));
}

export function update(state : PokerState) {
    return updateAction(assign<PokerState>(state, {
        common: {
            ...state.common,
            lastModifiedBy: state.nick,
        }
    }));
}

export function updateAction(state : PokerState) {
    switch (state.common.game.state) {
    case 'none': {
        // return mapPlayers(state, (_) => ({actions: [JOIN_GAME]}));
        return mapPlayers(state, (nick) => ({actions: state.common.players[nick] ? [START_GAME] : [JOIN_GAME]}));
    }
    case 'running': {
        return mapPlayers(state, (nick) => ({actions: state.common.game.dealer === nick ? [GIVE_CARDS] : []}));
    }
    default: {
        return state;
    }
    }
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

export function getCardsFromDeck(state : PokerState, n : number) : {| cards: ?Array<Card>, newState : PokerState|} {
    return {
        cards: (state.common.game.deck && state.common.game.deck.splice(0, n)),
        newState: assign(state, {
            common: {
                ...state.common,
                game: {
                    ...state.common.game,
                    deck: state.common.game.deck
                }
            }
        })
    };
}

export function chooseDealer(players : { [string]: Player }) {
    const nicks = Object.keys(players)
    return nicks[Math.floor(Math.random() * nicks.length)]
}
