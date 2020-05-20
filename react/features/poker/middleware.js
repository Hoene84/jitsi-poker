// @flow

import { APP_WILL_MOUNT, APP_WILL_UNMOUNT } from '../base/app';
import {
    CONFERENCE_JOINED,
    getCurrentConference
} from '../base/conference';
import {
    JitsiConferenceEvents
} from '../base/lib-jitsi-meet';
import { MiddlewareRegistry, StateListenerRegistry } from '../base/redux';
import { playSound, registerSound, unregisterSound } from '../base/sounds';
import { new_state_received } from './actions';

import { CARD_TURN_SOUND_FILE } from './sounds';
import { CARD_TURN_SOUND_ID, GAME_STATE_CHANGED_EVENT } from './constants';

import { equals } from '../base/redux';

/**
 * Implements the middleware of the poker feature.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const { dispatch, getState } = store;

    switch (action.type) {
    case APP_WILL_MOUNT:
        dispatch(registerSound(CARD_TURN_SOUND_ID, CARD_TURN_SOUND_FILE));
        break;

    case APP_WILL_UNMOUNT:
        dispatch(unregisterSound(CARD_TURN_SOUND_ID));
        break;

    case CONFERENCE_JOINED:
        _registerGameUpdateListener(action.conference, store);
        break;
    }

    return next(action);
});

StateListenerRegistry.register(
    state => state['features/poker'],
    (currentState, { getState } = {}) => {
        const conference = getCurrentConference(getState())
        if(conference &&
            currentState.common.lastModifiedBy === currentState.nick) {
            conference.sendMessage({
                state: currentState.common,
                type: GAME_STATE_CHANGED_EVENT
            });
        }
    });

function _registerGameUpdateListener(conference, store) {
    conference.on(
        JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED,
        (id, message, timestamp, nick) => {
            if(message.type === GAME_STATE_CHANGED_EVENT)
            {
                console.log(message)
                store.dispatch(new_state_received(message.state))
            }
        }
    );
}
