// @flow

import type { Action, Card as CardType } from '../types';

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { getParticipantDisplayName } from '../../base/participants';
import { translate } from '../../base/i18n';
import Tooltip from '@atlaskit/tooltip';
import { GIVE_CARDS } from '../../poker/actionTypes';
import { giveCards } from '../../poker/actions';
import { cards, currentPlayer, pokerActionTypes } from '../functions';
import Card from './Card';

export type Props = {
    participantID: string,
    dispatch: Function,
    t: Function,
    _actions: Array<Action>,
    _amount: number,
    _cards: Array<CardType>,
    _state: string,
    _isCurrentPlayer: boolean
}

type State = {

}

export const DEFAULT_SIZE = 65;

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
            <div className = { `player ${this.props._isCurrentPlayer ? 'current' : ''}` }>
                <div>{this.props._amount}</div>
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
        default:
            console.log('unknown action');
        }
    }
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const { players } = state['features/poker'].common;
    const { participantID } = ownProps;

    const nick = getParticipantDisplayName(state, participantID);
    const player = players[nick];

    return {
        _amount: player ? player.amount : null,
        _actions: pokerActionTypes(state, nick),
        _cards: cards(state, nick),
        _state: JSON.stringify(state['features/poker']),
        _isCurrentPlayer: currentPlayer(state, nick)
    };
}

export default translate(connect(_mapStateToProps)(Poker));
