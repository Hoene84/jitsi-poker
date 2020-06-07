// @flow

import type { Card as CardType, CommonState } from '../types';

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { getParticipantDisplayName } from '../../base/participants';
import { translate } from '../../base/i18n';
import { cards, currentPlayer } from '../functions';
import Card from './Card';

export type Props = {
    participantId: string,
    dispatch: Function,
    t: Function,
    _amount: number,
    _bet: number,
    _folded: boolean,
    _cards: Array<CardType>,
    _state: string,
    _isCurrentPlayer: boolean
}

type State = {

}

/**
 * Implements a class to render poker in the app.
 */
class Poker extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            // value: false
        };
    }

    render() {
        return (
            <div className = { this._pokerClasses() }>
                <div>Amount: {this.props._amount}</div>
                <div>Bet: {this.props._bet}</div>
                {this.props._cards.map((card, i) => (<Card
                    card = { card }
                    key = { i } />))}
                {/* <div> {this.props._state}</div>*/}
            </div>
        );
    }

    // _pokerClasses: () => string;
    _pokerClasses() {
        const classes = [ 'player' ];

        if (this.props._isCurrentPlayer) {
            classes.push('current');
        }
        if (this.props._folded) {
            classes.push('folded');
        }

        return classes.join(' ');
    }
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const commonState: CommonState = state['features/poker'].common;
    const { players } = commonState;
    const { participantId } = ownProps;

    const nick = getParticipantDisplayName(state, participantId);
    const player = players[nick];

    return {
        _amount: player ? player.amount : null,
        _bet: player ? player.bet : null,
        _folded: player ? player.fold : null,
        _cards: cards(state, nick, true),
        _state: JSON.stringify(state['features/poker']),
        _isCurrentPlayer: currentPlayer(state, nick)
    };
}

export default translate(connect(_mapStateToProps)(Poker));
