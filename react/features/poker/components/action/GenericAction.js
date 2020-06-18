// @flow

import React, { Component } from 'react';
import { CALL, CHECK, FOLD, GIVE_CARDS, JOIN_GAME, RAISE, START_GAME, TAKE_OVER } from '../../actionTypes';
import { call, check, fold, giveCards, joinGame, raise, startGame, takeOver } from '../../actions';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';

export type Props = {
    nick: string,
    action: string,
    dispatch: Function,
    t: Function,
}

class GenericAction extends Component<Props> {

    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
        this._onAction = this._onAction.bind(this);
    }

    render() {

        const { t, action } = this.props;

        return (
            <button
                aria-label = { t(`poker.action.${this.props.action}`) }
                className = 'poker-button'
                /* eslint-disable-next-line react/jsx-no-bind */
                onClick = { e => this._onAction(e, this.props.action) }>
                <div className = { 'poker-action' }>
                    {t(`poker.action.${action}`)}
                </div>
            </button>
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
        case TAKE_OVER:
            this.props.dispatch(takeOver(this.props.nick));
            break;
        case JOIN_GAME:
            this.props.dispatch(joinGame(this.props.nick));
            break;
        case START_GAME:
            this.props.dispatch(startGame());
            break;
        default:
            console.log('unknown action');
        }
    }
}

export function _mapStateToProps() {
    return {};
}

export default translate(connect(_mapStateToProps)(GenericAction));
