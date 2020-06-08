// @flow

import { CALL, CHECK, FOLD, GIVE_CARDS, JOIN_GAME, RAISE } from './actionTypes';
import { joinGame, startGame, stopGame, takeOver } from './actions';
import type { Card, CommonState, PlayerState, PokerState } from './types';
import type { Dispatch } from 'redux';
import {
    dominantSpeakerChanged,
    getLocalParticipant,
    getParticipantDisplayName,
    getParticipants
} from '../base/participants';
import { isNotInSeatControl } from './logic/helpers';
import { getCurrentConference } from '../base/conference';

const POKER_ACTIONS = [ GIVE_CARDS, CHECK, CALL, RAISE, FOLD ];

export function toolboxAction(state: Object) {
    const nick = getNick(state);
    const pokerState = state['features/poker'];

    if (isNotInSeatControl(pokerState, nick)) {
        return takeOver(nick);
    }

    const players = pokerState.common.players;
    const player = players[nick] || { actions: [ JOIN_GAME ] };

    return [ startGame(), joinGame(nick), stopGame() ].filter(action => player.actions.includes(action.type))[0];
}

export function pokerActionTypes(state: Object, nick: string): Array<string> {
    const localNick = getParticipantDisplayName(state, getLocalParticipant(state).id);
    const pokerState = state['features/poker'];
    const player = pokerState.common.players[nick] || { actions: [] };

    if (isNotInSeatControl(pokerState, localNick)) {
        return [];
    }

    return POKER_ACTIONS.filter(action => player.actions.includes(action));
}

export function cards(state: Object, nick: string, flippedOnly: boolean = false): Array<Card> {
    const pokerState: PokerState = state['features/poker'];
    const deck = pokerState.common.game.round.deck;

    if (!deck) {
        return [];
    }

    // eslint-disable-next-line arrow-body-style
    return deck.cards.filter(cardSlot => {
        return cardSlot.owner === nick && (!flippedOnly || cardSlot.flipped);
    }).map(cardSlot => cardSlot.card);
}

export function setDominantSpeaker(state: Object, pokerState: CommonState, dispatch: Dispatch<any>): ?Array<string> {
    const conference = getCurrentConference(state);
    const participantId = getParticipantId(state, pokerState.game.round.currentPlayer);

    if (participantId && conference) {
        dispatch(dominantSpeakerChanged(participantId, conference));
    }
}

export function getParticipantId(state: Object, nick: ?string): ?Array<string> {
    return getParticipants(state).filter(participant => participant.name === nick)[0]?.id;
}

export function getNick(state: Object): string {
    return getParticipantDisplayName(state, getLocalParticipant(state).id);
}

export function currentPlayer(state: Object, nick: string): boolean {
    const pokerState: PokerState = state['features/poker'];

    return pokerState.common.game.round.currentPlayer === nick;
}

export function playerState(state: Object, nick: string): PlayerState {
    const pokerState: PokerState = state['features/poker'];

    if (pokerState.common.game.round.bettingRound.raisePlayer === nick) {
        return 'raiser';
    }
    if (pokerState.common.game.round.currentPlayer === nick) {
        return 'current';
    }
    if (pokerState.common.players[nick].fold) {
        return 'folded';
    }

    return 'none';
}
