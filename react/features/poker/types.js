// @flow

// import {
//     JOIN_GAME,
//     START_GAME,
//     GIVE_CARDS,
//     TURN_FLOP,
//     NEW_STATE_RECEIVED,
// } from './actionTypes';
import * as actions from './actionTypes';

import { SUITS, SYMBOLS } from './constants'

type GameState = "none" | "running";
export type Suit = $Keys<typeof SUITS>;
export type Symbol = $Keys<typeof SYMBOLS>;
export type Action = $Values<typeof actions>

export type Game = {|
    id: string,
    ticks: ?number,
    state: GameState,
    start_amount: number,
    current_player: ?string,
    dealer: ?string,
    deck: ?Array<Card>
|}

export type CommonState = {|
    game: Game,
    table: Array<Card>,
    players: { [string]: Player },
    lastModifiedBy: ?string
|}

export type Card = {|
    suit: Suit,
    symbol: Symbol
|}

export type Player = {|
    amount: number,
    card1: ?Card,
    card2: ?Card,
    actions: Array<Action>,
|}

export type PokerState = {
    common: CommonState,
    nick: ?string
}
