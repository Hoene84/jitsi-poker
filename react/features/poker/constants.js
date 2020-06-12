// @flow

import type { PokerState } from './types';
import uuid from 'uuid';

/**
 * Sound
 */
export const CARD_TURN_SOUND_ID = 'CARD_TURN_SOUND';

/**
 * Events
 */
export const GAME_STATE_CHANGED_EVENT = 'poker-state-changed';
export const REQUEST_GAME_STATE_EVENT = 'request-game-state-event';

export const OWNER_TABLE = '_table';

export const SUITS = Object.freeze({
    club: 'club',
    diamond: 'diamond',
    heart: 'heart',
    spade: 'spade'
});

export const SYMBOLS = Object.freeze({
    _2: '2',
    _3: '3',
    _4: '4',
    _5: '5',
    _6: '6',
    _7: '7',
    _8: '8',
    _9: '9',
    _10: '10',
    jack: 'J',
    queen: 'Q',
    king: 'K',
    ace: 'A'
});

export const DEFAULT_STATE: PokerState = {
    common: {
        game: {
            id: uuid.v4().toUpperCase(),
            ticks: 0,
            state: 'none',
            startAmount: 1000,
            dealer: null,
            blind: {
                small: 5,
                big: 10
            },
            round: {
                state: 'preflop',
                currentPlayer: null,
                deck: null,
                pot: 0,
                bet: 0,
                bettingRound: {
                    raisePlayer: null
                }
            }
        },
        table: [],
        players: {},
        stagePerformances: [],
        lastModifiedBy: null
    },
    nick: null
};
