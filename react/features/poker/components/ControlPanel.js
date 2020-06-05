// @flow

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n';
import type { Action } from '../types';
import Tooltip from '@atlaskit/tooltip';
import { CALL, CHECK, FOLD, GIVE_CARDS, RAISE } from '../actionTypes';
import { call, check, fold, giveCards, raise } from '../actions';
import { pokerActionTypes } from '../functions';
import { getParticipantDisplayName } from '../../base/participants';

export type Props = {
    participantId: string,
    dispatch: Function,
    t: Function,
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
        _actions: pokerActionTypes(state, nick)
    };
}

export default translate(connect(_mapStateToProps)(ControlPanel));
