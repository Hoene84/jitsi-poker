// @flow

/**
 * Sound
 */
export const CARD_TURN_SOUND_ID = 'CARD_TURN_SOUND';

/**
 * Events
 */
export const GAME_STATE_CHANGED_EVENT = 'poker-state-changed';

export const SUITS = Object.freeze({
    club: 'club',
    diamond: 'diamond',
    heart: 'heart',
    spade: 'spade'
});

export const SYMBOLS = Object.freeze({
    _2: 2,
    _3: 3,
    _4: 4,
    _5: 5,
    _6: 6,
    _7: 7,
    _8: 8,
    _9: 9,
    _10: 10,
    jack: 11,
    queen: 12,
    king: 13,
    ace: 14
});

export const HANDS = Object.freeze({
    high: 1,
    pair: 2,
    twoPair: 3,
    three: 4,
    straight: 5,
    flush: 6,
    fullHouse: 7,
    four: 8,
    straightFlush: 9,
    royalFlush: 10
});
