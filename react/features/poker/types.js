// @flow

import * as actions from './actionTypes';

import { SUITS, SYMBOLS } from './constants';

type GameState = "none" | "running";
type BettingRoundState = "preflop" | "flop" | "turn" | "river";
export type PlayerState = "folded" | "raiser" | "current" | "none";
export type Suit = $Keys<typeof SUITS>;
export type Symbol = $Keys<typeof SYMBOLS>;
export type Action = $Values<typeof actions>

export type Card = {|
    suit: Suit,
    symbol: Symbol
|}

export type CardSlot = {|
    card: Card,
    owner: ?string,
    flipped: boolean
|}

export type Deck = {|
    nextIndex: number,
    cards: Array<CardSlot>
|}

export type Blind = {|
    small: number,
    big: number
|}

export type BettingRound = {|
    raisePlayer: ?string,
|}

export type Round = {|
    state: BettingRoundState,
    currentPlayer: ?string,
    deck: ?Deck,
    pot: number,
    bet: number,
    raiseAmount: number,
    bettingRound: BettingRound
|}

export type Game = {|
    id: string,
    ticks: ?number,
    state: GameState,
    startAmount: number,
    dealer: ?string,
    blind: Blind,
    round: Round
|}

export type Player = {|
    amount: number,
    actions: Array<Action>,
    bet: number,
    fold: boolean
|}

export type PlayerEntry = {|
    nick: string,
    player: Player
|}

export type StagePerformance = {|
    nick: string,
    durationMillis: number
|}

export type CommonState = {|
    game: Game,
    table: Array<Card>,
    players: { [string]: Player },
    stagePerformances: Array<StagePerformance>,
    lastModifiedBy: ?string
|}

export type PokerState = {|
    common: CommonState,
    nick: ?string,
|}

export interface APokerState {
    common: CommonState,
    nick: ?string,
}

export type ChainablePokerState = {|
    ...PokerState,
    then: ((APokerState) => ChainablePokerState) => ChainablePokerState
|}
