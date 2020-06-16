// @flow

import type { Card as CardType, CommonState } from '../types';

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { getParticipantDisplayName } from '../../base/participants';
import { translate } from '../../base/i18n';
import { cards, getFontPercentage, playerState } from '../functions';
import Card from './Card';
import { getCurrentLayout } from '../../video-layout';

export type Props = {
    participantId: string,
    dispatch: Function,
    t: Function,
    _amount: number,
    _bet: number,
    _folded: boolean,
    _cards: Array<CardType>,
    _dealer: boolean,
    _state: string,
    _playerState: string,
    _currentLayout: string,
    _fontPercentage: number
}

type State = {

}

declare var interfaceConfig: Object;

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

        const { t } = this.props;

        if (this.props.participantId === 'table') {
            return <div />;
        }

        return (
            <div
                className = { this._pokerClasses() }
                style = {{ fontSize: `${this.props._fontPercentage}%` }}>
                <div
                    className = 'info'
                    style = {{ right: `${(interfaceConfig.FILM_STRIP_MAX_HEIGHT || 120) + 25 + 100}px` }}>

                    {this.props._amount > 0
                    && <div>{ t('poker.stack') }: {this.props._amount}</div>}

                    {this.props._bet > 0
                    && <div>{ t('poker.bet') }: {this.props._bet}</div>}

                    <div className = { `state ${this.props._playerState}` }>
                        { t(`poker.state.${this.props._playerState}`) }
                    </div>

                    {this.props._dealer
                    && <span className = 'dealer-button'><span>Dealer</span></span>}
                </div>
                {this.props._cards.map((card, i) => (<Card
                    card = { card }
                    key = { i } />))}
            </div>
        );
    }

    // _pokerClasses: () => string;
    _pokerClasses() {
        return [ 'player', this.props._playerState, this.props._currentLayout ].join(' ');
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
        _dealer: commonState.game.dealer === nick,
        _state: JSON.stringify(state['features/poker']),
        _playerState: playerState(state, nick),
        _currentLayout: getCurrentLayout(state),
        _fontPercentage: getFontPercentage(state)
    };
}

export default translate(connect(_mapStateToProps)(Poker));
