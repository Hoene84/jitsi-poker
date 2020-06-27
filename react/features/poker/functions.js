// @flow

import {
    CALL,
    CHECK,
    COLLECT,
    FOLD,
    GIVE_CARDS,
    JOIN_GAME,
    RAISE,
    SHOW_CARDS,
    START_GAME,
    TAKE_OVER,
    THROW_AWAY_CARDS
} from './actionTypes';
import { joinGame, startGame, stopGame, takeOver } from './actions';
import type { Card, PlayerState, PokerState } from './types';
import {
    dominantSpeakerChanged,
    getLocalParticipant,
    getParticipantCount,
    getParticipantDisplayName,
    getParticipants
} from '../base/participants';
import { activePlayers, cardSlotsOf, isNotInSeatControl } from './logic/helpers';
import { getCurrentConference } from '../base/conference';
import { getCurrentLayout, LAYOUTS } from '../video-layout';

const POKER_ACTIONS = [
    GIVE_CARDS,
    CHECK,
    CALL,
    RAISE,
    FOLD,
    SHOW_CARDS,
    THROW_AWAY_CARDS,
    COLLECT,
    TAKE_OVER,
    JOIN_GAME,
    START_GAME ];

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
    const player = pokerState.common.players[nick] || { actions: [ JOIN_GAME ] };

    if (isNotInSeatControl(pokerState, localNick)) {
        return [ TAKE_OVER ];
    }

    return POKER_ACTIONS.filter(action => player.actions.includes(action));
}

export function cards(state: Object, nick: string, flippedOnly: boolean = false): Array<Card> {
    const pokerState: PokerState = state['features/poker'];
    const nicksCards = cardSlotsOf(pokerState, nick).filter(cardSlot => !flippedOnly || cardSlot.flipped);

    return nicksCards.map(cardSlot => cardSlot.card);
}

export function setDominantSpeaker(state: Object): ?Array<string> {
    const pokerState: PokerState = state.getState()['features/poker'];
    const conference = getCurrentConference(state);

    if (pokerState.common.stagePerformances.length > 0) {
        const performance = pokerState.common.stagePerformances.splice(0, 1)[0];
        const participantId = getParticipantId(state, performance.nick) || performance.nick;

        if (participantId && conference) {
            state.dispatch(dominantSpeakerChanged(participantId, conference));
        }

        setTimeout(() => {
            setDominantSpeaker(state);
        }, performance.durationMillis);

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

    if (!pokerState.common.players[nick]) {
        return 'spectator';
    }
    if (pokerState.common.game.state === 'none') {
        return 'joined';
    }
    if (pokerState.common.game.round.bettingRound.raisePlayer === nick) {
        return 'raiser';
    }
    if (pokerState.common.game.round.currentPlayer === nick) {
        return 'current';
    }
    if (pokerState.common.players[nick].fold) {
        return 'folded';
    }

    return 'waiting';
}

export function playerStateI18nParams(state: Object, nick: string): Object {
    const pokerState: PokerState = state['features/poker'];
    const activeNicks = activePlayers(pokerState);

    const indexCurrent = activeNicks.indexOf(pokerState.common.game.round.currentPlayer);
    const indexNick = activeNicks.indexOf(nick);

    return {
        cue: (indexNick - indexCurrent + activeNicks.length) % activeNicks.length
    };
}

export function getFontPercentage(state: Object): number {
    const participantCount = getParticipantCount(state);
    const currentLayout = getCurrentLayout(state);

    return currentLayout === LAYOUTS.TILE_VIEW ? 200 / Math.ceil(Math.sqrt(participantCount)) : 100;
}
