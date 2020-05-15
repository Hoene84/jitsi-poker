// @flow

import { START_GAME, JOIN_GAME, GIVE_CARDS } from './actionTypes';
import { assign } from '../base/redux';

export function getDeck() {

    const suits = ['club', 'diamond', 'heart', 'spade']
    const symbols = ['2', '3', '4', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']

    const set = suits.flatMap((suit) => symbols.map((symbol) => [suit, symbol]))
    return set;
}

export function update(state : Object) {
    return updateAction(assign(state, {
        common: {
            ...state.common,
            lastModifiedBy: state.nick,
        }
    }));
}

export function updateAction(state : Object) {
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

export function mapPlayers(state, mappingFunction){
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

export function getCardsFromDeck(state, n) {
    return {
        cards: state.common.game.deck.splice(0, n),
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

export function chooseDealer(players) {
    const nicks = Object.keys(players)
    return nicks[Math.floor(Math.random() * nicks.length)]
}
