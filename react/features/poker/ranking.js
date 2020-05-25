// @flow

import type { APokerState, Card, Suit, Symbol } from './types';
import { Hand } from 'pokersolver';
import { activePlayers, cards } from './helpers';

export function winners(state: APokerState): Array<string> {
    const hands = _hands(state);
    const winningHands = Hand.winners(hands.map(nickWithHands => nickWithHands.solvedCards).filter(Boolean));

    return hands
        .filter(nickWithHands => winningHands.includes(nickWithHands.solvedCards))
        .map(nickWithHands => nickWithHands.nick);
}

export function _hands(state: APokerState): Array<{nick: string, solvedCards: Hand}> {
    return activePlayers(state).map(nick => {
        const playerCards = cards(state, nick).map(card => _toPokerSolverCard(card));

        return {
            nick,
            solvedCards: playerCards.length > 0 ? Hand.solve(playerCards) : null
        };
    });
}

function _toPokerSolverCard(card: Card): string {
    return _toPokerSolverSymbol(card.symbol) + _toPokerSolverSuite(card.suit);
}

function _toPokerSolverSuite(suit: Suit): string {
    switch (suit) {
    case 'club': return 'c';
    case 'diamond': return 'd';
    case 'heart': return 'h';
    case 'spade': return 's';
    }
    throw new Error(`Unknown: ${suit}`);
}

function _toPokerSolverSymbol(symbol: Symbol): string {
    switch (symbol) {
    case 'ace': return 'A';
    case 'queen': return 'Q';
    case 'king': return 'K';
    case 'jack': return 'J';
    case '_2': return '2';
    case '_3': return '3';
    case '_4': return '4';
    case '_5': return '5';
    case '_6': return '6';
    case '_7': return '7';
    case '_8': return '8';
    case '_9': return '9';
    case '_10': return 'T';
    }
    throw new Error(`Unknown: ${symbol}`);
}
