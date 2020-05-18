// @flow

import type { Action } from '../types'

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { getParticipantDisplayName } from '../../base/participants';
import { translate } from '../../base/i18n';
import Tooltip from '@atlaskit/tooltip';
import { GIVE_CARDS, giveCards } from '../../poker';
import { Icon, IconAdd } from '../../base/icons';

export type Props = {
    participantID: String,
    _amount: number,
    dispatch: Function,
    t: Function,
    _actions: Array<Action>,
    _state: string
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
        this._onGiveCards = this._onGiveCards.bind(this);
    }

    render() {
        const {t} = this.props;
        return (
            <div>
                <div>{this.props._amount}</div>
                {this.props._actions.includes(GIVE_CARDS)
                    && <div
                        aria-label={t('poker.accessibilityLabel.poker')}
                        className='poker-button play-cards'
                        onClick={this._onGiveCards}>
                        <Tooltip content={t('poker.accessibilityLabel.poker')}>
                            <div
                                className={`poker-icon`}>
                                <Icon src={IconAdd}/>
                            </div>
                        </Tooltip>
                    </div>
                }
                <div> {this.props._state}</div>
            </div>
        );
    }

    _onGiveCards: () => void;
    _onGiveCards() {
        this.props.dispatch(giveCards())
    }
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const { game, players } = state['features/poker'].common;
    const { participantID } = ownProps;

    const nick = getParticipantDisplayName(state, participantID)
    const player = players[nick]

    return {
        _amount: player ? player.amount : null,
        _actions: player ? player.actions : [],
        _state: JSON.stringify(state['features/poker'])
    };
}

export default translate(connect(_mapStateToProps)(Poker));
