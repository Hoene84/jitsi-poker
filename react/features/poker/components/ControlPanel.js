// @flow

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n';
import type { Action, Card as CardType, CommonState } from '../types';
import { cards, playerState, playerStateI18nParams, pokerActionTypes } from '../functions';
import { getParticipantDisplayName } from '../../base/participants';
import { SYMBOLS } from '../constants';
import GenericAction from './action/GenericAction';
import { RAISE } from '../actionTypes';
import RaiseAction from './action/RaiseAction';
import { getCurrentLayout } from '../../video-layout';

type Props = {
    participantId: string,
    dispatch: Function,
    t: Function,
    _cards: Array<CardType>,
    _actions: Array<Action>,
    _nick: Array<Action>,
    _dealer: boolean,
    _amount: number,
    _bet: number,
    _playerState: string,
    _playerStateI18nParams: Object,
    _currentLayout: string
}

type State = {

}

/**
 * Implements a class to render poker in the app.
 */
class ControlPanel extends Component<Props, State> {

    render() {
        const { t, _actions } = this.props;

        return (
            <div className = { `poker-control-panel ${this.props._currentLayout}` }>
                <div className = 'info'>

                    {this.props._dealer
                    && <span className = 'dealer-button'><span>Dealer</span></span>}

                    {this.props._amount > 0
                    && <div>{ t('poker.stack') }: {this.props._amount}</div>}

                    {this.props._bet > 0
                    && <div>{ t('poker.bet') }: {this.props._bet}</div>}

                    <div className = { `state ${this.props._playerState}` }>
                        { t(`poker.state.${this.props._playerState}`, this.props._playerStateI18nParams) }
                    </div>
                </div>
                <div className = 'poker-buttons'>
                    {_actions.map(action => this._action(action))}
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


    _action(action) {
        switch (action) {
        case RAISE:
            return (<RaiseAction
                key = { action }
                nick = { this.props._nick } />);
        }

        return (<GenericAction
            action = { action }
            key = { action } />);
    }
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const commonState: CommonState = state['features/poker'].common;
    const { players } = commonState;

    const { participantId } = ownProps;
    const nick = getParticipantDisplayName(state, participantId);
    const player = players[nick];

    return {
        _actions: pokerActionTypes(state, nick),
        _cards: cards(state, nick),
        _nick: nick,
        _dealer: commonState.game.dealer === nick,
        _amount: player ? player.amount : null,
        _bet: player ? player.bet : null,
        _playerState: playerState(state, nick),
        _playerStateI18nParams: playerStateI18nParams(state, nick),
        _currentLayout: getCurrentLayout(state)
    };
}

export default translate(connect(_mapStateToProps)(ControlPanel));
