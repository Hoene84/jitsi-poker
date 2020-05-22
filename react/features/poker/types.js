// @flow

import * as actions from './actionTypes';

import { SUITS, SYMBOLS } from './constants';

type GameState = "none" | "running";
export type Suit = $Keys<typeof SUITS>;
export type Symbol = $Keys<typeof SYMBOLS>;
export type Action = $Values<typeof actions>

export type Card = {|
    suit: Suit,
    symbol: Symbol
|}

export type CardSlot = {|
    card: Card,
    owner: ?string
|}

export type Deck = {|
    nextIndex: number,
    cards: Array<CardSlot>
|}

export type Game = {|
    id: string,
    ticks: ?number,
    state: GameState,
    startAmount: number,
    currentPlayer: ?string,
    dealer: ?string,
    deck: ?Deck,
    pot: number,
|}

export type Player = {|
    amount: number,
    actions: Array<Action>,
    bet: number,
    fold: boolean
|}

export type CommonState = {|
    game: Game,
    table: Array<Card>,
    players: { [string]: Player },
    lastModifiedBy: ?string
|}
export type PokerState = {
    common: CommonState,
    nick: ?string
}
