// @flow

import type { Card as CardType} from '../types';

import React, { Component } from 'react';

export type Props = {
    card: CardType,
}

export default class Card extends Component<Props> {

    render() {
        return (
            <div>
                <span>
                    {this.props.card.suit}
                </span>
                <span>
                    {this.props.card.symbol}
                </span>
            </div>
        );
    }
}
