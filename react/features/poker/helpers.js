// @flow

import { START_GAME, JOIN_GAME, GIVE_CARDS } from './actionTypes';
import { assign } from '../base/redux';

export function getDeck() {

    const suits = ['club', 'diamond', 'heart', 'spade']
    const symbols = ['2', '3', '4', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']

    const set = suits.flatMap((suit) => symbols.map((symbol) => [suit, symbol]))
    return set;
}

export function updatePossibleActions(state : Object) {
    switch (state.game.state) {
    case 'none': {
        // return mapPlayers(state, (_) => ({actions: [JOIN_GAME]}));
        return mapPlayers(state, (nick) => ({actions: state.players[nick] ? [START_GAME] : [JOIN_GAME]}));
    }
    case 'running': {
        return mapPlayers(state, (nick) => ({actions: state.game.dealer === nick ? [GIVE_CARDS] : []}));
    }
    default: {
        return state;
    }
    }
}

export function mapPlayers(state, mappingFunction){
    return assign(state, {
        players: Object.fromEntries(Object.entries(state.players).map(([nick, player]) => {
            const x = mappingFunction(nick)
            return [ nick, {...player, ...x } ];
        })),
    });
}

export function getCardsFromDeck(state, n) {
    return {
        cards: state.game.deck.splice(0, n),
        newState: assign(state, {
            game: {
                ...state.game,
                deck: state.game.deck
            }
        })
    };
}

export function chooseDealer(players) {
    const nicks = Object.keys(players)
    return nicks[Math.floor(Math.random() * nicks.length)]
}
