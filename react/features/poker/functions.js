// @flow

import { getParticipantDisplayName } from '../base/participants'
import { GIVE_CARDS, JOIN_GAME } from './actionTypes';
import { startGame, joinGame, stopGame } from './actions'

const POKER_ACTIONS = [GIVE_CARDS];

export function toolboxAction(state: Object, participantId : string) {
    const players = state['features/poker'].common.players;
    const nick = getParticipantDisplayName(state, participantId)
    const player = players[nick] || {actions: [JOIN_GAME]}
    const action = [startGame(), joinGame(nick), stopGame()].filter(action => player.actions.includes(action.type))[0]
    return action;
}

export function pokerActionTypes(state: Object, participantId : string) : Array<string> {
    const nick = getParticipantDisplayName(state, participantId)
    const player = state['features/poker'].common.players[nick] || { actions: [] };
    return POKER_ACTIONS.filter(action => player.actions.includes(action));
}

function _getPlayer(state: Object, participantId : string) {
    const players = state['features/poker'].common.players;
    return players[getParticipantDisplayName(state, participantId)]
}
