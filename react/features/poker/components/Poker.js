// @flow

import type { Action, Card as CardType, CommonState } from '../types';

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { getParticipantDisplayName } from '../../base/participants';
import { translate } from '../../base/i18n';
import Tooltip from '@atlaskit/tooltip';
import { CHECK, FOLD, GIVE_CARDS, RAISE } from '../../poker/actionTypes';
import { giveCards, check, raise, fold } from '../actions';
import { cards, currentPlayer, pokerActionTypes } from '../functions';
import Card from './Card';

export type Props = {
    participantID: string,
    dispatch: Function,
    t: Function,
    _actions: Array<Action>,
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

        // Bind event handlers so they are only bound once for every instance.
        this._onAction = this._onAction.bind(this);
    }

    render() {
        const { t } = this.props;

        return (
            <div className = { this._pokerClasses() }>
                <div>Amount: {this.props._amount}</div>
                <div>Bet: {this.props._bet}</div>
                {this.props._actions.map(action => (<button
                    aria-label = { t(`poker.action.${action}`) }
                    className = 'poker-button'
                    key = { action }
                    /* eslint-disable-next-line react/jsx-no-bind */
                    onClick = { e => this._onAction(e, action) }>
                    <Tooltip content = { t(`poker.action.${action}`) }>
                        <div className = { 'poker-action' }>
                            { t(`poker.action.${action}`) }
                        </div>
                    </Tooltip>
                </button>))}
                {this.props._cards.map((card, i) => (<Card
                    card = { card }
                    key = { i } />))}
                {/* <div> {this.props._state}</div>*/}
            </div>
        );
    }

    _onAction: (Object, string) => void;
    _onAction(event, action) {
        switch (action) {
        case GIVE_CARDS:
            this.props.dispatch(giveCards());
            break;
        case CHECK:
            this.props.dispatch(check());
            break;
        case RAISE:
            this.props.dispatch(raise(100));
            break;
        case FOLD:
            this.props.dispatch(fold());
            break;
        default:
            console.log('unknown action');
        }
    }

    // _pokerClasses: () => string;
    _pokerClasses() {
        const classes = [ 'player' ];

        if (this.props._isCurrentPlayer) classes.push('current');
        if (this.props._folded) classes.push('folded');

        return classes.join(' ');
    }
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const { players } = (state['features/poker'].common: CommonState);
    const { participantID } = ownProps;

    const nick = getParticipantDisplayName(state, participantID);
    const player = players[nick];

    return {
        _amount: player ? player.amount : null,
        _bet: player ? player.bet : null,
        _folded: player ? player.fold : null,
        _actions: pokerActionTypes(state, nick),
        _cards: cards(state, nick),
        _state: JSON.stringify(state['features/poker']),
        _isCurrentPlayer: currentPlayer(state, nick)
    };
}

export default translate(connect(_mapStateToProps)(Poker));
