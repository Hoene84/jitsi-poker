// @flow

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n';
import type { Action, Card as CardType } from '../types';
import Tooltip from '@atlaskit/tooltip';
import { CALL, CHECK, FOLD, GIVE_CARDS, RAISE } from '../actionTypes';
import { call, check, fold, giveCards, raise } from '../actions';
import { cards, pokerActionTypes } from '../functions';
import { getParticipantDisplayName } from '../../base/participants';
import { SYMBOLS } from '../constants';

export type Props = {
    participantId: string,
    dispatch: Function,
    t: Function,
    _cards: Array<CardType>,
    _actions: Array<Action>,
}

type State = {

}

/**
 * Implements a class to render poker in the app.
 */
class ControlPanel extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            // value: false
        };

        // Bind event handlers so they are only bound once for every instance.
        this._onAction = this._onAction.bind(this);
    }

    render() {
        const { t, _actions } = this.props;

        return (
            <div className = 'poker-control-panel'>
                <div className = 'poker-buttons'>
                    {_actions.map(action => (<button
                        aria-label = { t(`poker.action.${action}`) }
                        className = 'poker-button'
                        key = { action }
                        /* eslint-disable-next-line react/jsx-no-bind */
                        onClick = { e => this._onAction(e, action) }>
                        <Tooltip content = { t(`poker.action.${action}`) }>
                            <div className = { 'poker-action' }>
                                {t(`poker.action.${action}`)}
                            </div>
                        </Tooltip>
                    </button>))}
                </div>
                {this.props._cards.length === 2
                && <div className = 'poker-hand'>
                    <img src = 'images/hand_cropped.png' />
                    <div className = 'card card-one'>
                        <span className = { this._symbolClasses(this.props._cards[0]) }>
                            {SYMBOLS[this.props._cards[0]?.symbol]}
                        </span>
                        <span className = 'suite'>{this._suite(this.props._cards[0])}</span>
                    </div>
                    <div className = 'card card-two'>
                        <span className = { this._symbolClasses(this.props._cards[1]) }>
                            {SYMBOLS[this.props._cards[1]?.symbol]}
                        </span>
                        <span className = 'suite'>{this._suite(this.props._cards[1])}</span>
                    </div>
                </div>}
            </div>
        );
    }

    _suite(card: CardType) {
        if (card.suit === 'club') {
            return <span>&clubs;</span>;
        }
        if (card.suit === 'diamond') {
            return <span>&diams;</span>;
        }
        if (card.suit === 'heart') {
            return <span>&hearts;</span>;
        }
        if (card.suit === 'spade') {
            return <span>&spades;</span>;
        }
    }

    _symbolClasses(card: CardType) {
        if (card.suit === 'heart' || card.suit === 'diamond') {
            return 'symbol red';
        }

        return 'symbol black';
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
        case CALL:
            this.props.dispatch(call());
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
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const { participantId } = ownProps;
    const nick = getParticipantDisplayName(state, participantId);


    return {
        _actions: pokerActionTypes(state, nick),
        _cards: cards(state, nick)
    };
}

export default translate(connect(_mapStateToProps)(ControlPanel));
