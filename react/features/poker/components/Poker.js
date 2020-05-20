// @flow

import type { Action } from '../types'

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { getParticipantDisplayName } from '../../base/participants';
import { translate } from '../../base/i18n';
import Tooltip from '@atlaskit/tooltip';
import { GIVE_CARDS } from '../../poker/actionTypes';
import { giveCards } from '../../poker/actions';
import { pokerActionTypes } from '../functions';

export type Props = {
    participantID: string,
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
        this._onAction = this._onAction.bind(this);
    }

    render() {
        const {t} = this.props;
        return (
            <div>
                <div>{this.props._amount}</div>
                {this.props._actions.map(action => {
                    return (<div
                        key={action}
                        aria-label={t(`poker.action.${action}`)}
                        className='poker-button'
                        onMouseDown={e => this._onAction(e, action)}>
                        <Tooltip content={t(`poker.action.${action}`)}>
                            <div className={`poker-action`}>
                                { t(`poker.action.${action}`) }
                            </div>
                        </Tooltip>
                    </div>)
                })}
                <div> {this.props._state}</div>
            </div>
        );
    }

    _onAction: (Object, string) => void;
    _onAction(event, action) {

        switch (action.type) {
        case GIVE_CARDS:
            this.props.dispatch(giveCards())
            break;
        default:
            console.log('unknown action')
        }

        event.preventDefault();
        event.stopPropagation();
        return false;
    }
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const { game, players } = state['features/poker'].common;
    const { participantID } = ownProps;

    const nick = getParticipantDisplayName(state, participantID)
    const player = players[nick]

    return {
        _amount: player ? player.amount : null,
        _actions: pokerActionTypes(state, (participantID)),
        _state: JSON.stringify(state['features/poker'])
    };
}

export default translate(connect(_mapStateToProps)(Poker));
