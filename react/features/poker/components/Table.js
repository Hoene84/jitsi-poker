// @flow

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n';
import { cards } from '../functions';
import Card from './Card';
import type { Card as CardType } from '../types';

export type Props = {
    dispatch: Function,
    t: Function,
    _cards: Array<CardType>
}

type State = {

}

/**
 * Implements a class to render poker in the app.
 */
class Table extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            // value: false
        };

        // Bind event handlers so they are only bound once for every instance.
        // this._onAction = this._onAction.bind(this);
    }

    render() {
        return (
            <div className = 'poker-table'>
                {this.props._cards.map((card, i) => (<Card
                    card = { card }
                    key = { i } />))}
            </div>
        );
    }

}

export function _mapStateToProps(state: Object) {
    return {
        _cards: cards(state, 'table')
    };
}

export default translate(connect(_mapStateToProps)(Table));
