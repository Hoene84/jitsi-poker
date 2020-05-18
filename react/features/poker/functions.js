// @flow

import { getParticipantDisplayName } from '../base/participants'
import { JOIN_GAME } from './actionTypes'
import { startGame, joinGame, stopGame } from './actions'

export function toolboxAction(state: Object, participantId : string) {
    const players = state['features/poker'].common.players;
    const nick = getParticipantDisplayName(state, participantId)
    const player = players[nick] || {actions: [JOIN_GAME]}
    const action = [startGame(), joinGame(nick), stopGame()].filter(action => player.actions.includes(action.type))[0]
    return action;
}
