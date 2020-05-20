// @flow

import { GIVE_CARDS, JOIN_GAME } from './actionTypes';
import { startGame, joinGame, stopGame } from './actions'
import type { PokerState, Card } from './types';

const POKER_ACTIONS = [GIVE_CARDS];

export function toolboxAction(state: Object, nick : string) {
    const players = state['features/poker'].common.players;
    const player = players[nick] || {actions: [JOIN_GAME]}
    const action = [startGame(), joinGame(nick), stopGame()].filter(action => player.actions.includes(action.type))[0]
    return action;
}

export function pokerActionTypes(state: Object, nick : string) : Array<string> {
    const player = state['features/poker'].common.players[nick] || { actions: [] };
    return POKER_ACTIONS.filter(action => player.actions.includes(action));
}

export function cards(state: Object, nick : string) : ?Array<Card> {
    const pokerState = (state['features/poker'] : PokerState)
    if (!pokerState.common.game.deck) {
        return [];
    }
    return pokerState.common.game.deck.cards.filter(cardSlot => cardSlot.owner === nick).map(cardSlot => cardSlot.card)
}
