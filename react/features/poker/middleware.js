// @flow

import { APP_WILL_MOUNT, APP_WILL_UNMOUNT } from '../base/app';
import { CONFERENCE_JOINED, getCurrentConference } from '../base/conference';
import { JitsiConferenceEvents } from '../base/lib-jitsi-meet';
import { MiddlewareRegistry, StateListenerRegistry } from '../base/redux';
import { registerSound, unregisterSound } from '../base/sounds';
import { newStateReceived, sendGameState } from './actions';

import { CARD_TURN_SOUND_FILE } from './sounds';
import { CARD_TURN_SOUND_ID, GAME_STATE_CHANGED_EVENT, REQUEST_GAME_STATE_EVENT } from './constants';
import { setDominantSpeaker } from './functions';
import type { CommonState } from './types';
import { participantJoined } from '../base/participants';

/**
 * Implements the middleware of the poker feature.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const { dispatch } = store;

    switch (action.type) {
    case APP_WILL_MOUNT:
        dispatch(registerSound(CARD_TURN_SOUND_ID, CARD_TURN_SOUND_FILE));
        break;

    case APP_WILL_UNMOUNT:
        dispatch(unregisterSound(CARD_TURN_SOUND_ID));
        break;

    case CONFERENCE_JOINED:
        _requestGamesState(action.conference);
        _registerGameUpdateListener(action.conference, store);
        dispatch(participantJoined({
            conference: action.conference,
            id: 'table',
            isFakeParticipant: true,
            name: 'Table'
        }));
        break;
    }

    return next(action);
});

StateListenerRegistry.register(
    state => state['features/poker'],
    (currentState, state = {}) => {
        const conference = getCurrentConference(state.getState());

        if (conference
            && currentState.nick
            && currentState.common.lastModifiedBy === currentState.nick) {
            conference.sendMessage({
                state: currentState.common,
                type: GAME_STATE_CHANGED_EVENT
            });
            setDominantSpeaker(state);
        }
    });

function _registerGameUpdateListener(conference, store) {
    conference.on(
        JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED,
        (id, message) => {
            if (message.type === GAME_STATE_CHANGED_EVENT) {
                console.log(message);

                const newState: CommonState = message.state;

                store.dispatch(newStateReceived(newState));
                setDominantSpeaker(store);
            } else if (message.type === REQUEST_GAME_STATE_EVENT) {
                store.dispatch(sendGameState());
            }
        }
    );
}

function _requestGamesState(conference) {
    conference.sendMessage({
        type: REQUEST_GAME_STATE_EVENT
    });
}
