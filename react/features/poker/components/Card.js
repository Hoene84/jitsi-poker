// @flow

import type { Card as CardType } from '../types';

import React, { Component } from 'react';
import { SYMBOLS } from '../constants';

export type Props = {
    card: CardType,
}

export default class Card extends Component<Props> {

    render() {
        return (
            <div className = 'poker-card'>
                <div className = 'suite'>
                    { this.props.card.suit === 'club' && <span>&clubs;</span> }
                    { this.props.card.suit === 'diamond' && <span>&diams;</span> }
                    { this.props.card.suit === 'heart' && <span>&hearts;</span> }
                    { this.props.card.suit === 'spade' && <span>&spades;</span> }
                </div>
                <div className = 'symbol'>
                    <span>{SYMBOLS[this.props.card.symbol]}</span>
                </div>
            </div>
        );
    }
}
