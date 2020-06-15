// @flow

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n';
import Table from './Table';
import type { CommonState } from '../types';
import PlayerListEntry from './PlayerListEntry';
import { getCurrentLayout } from '../../video-layout';

export type Props = {
    dispatch: Function,
    t: Function,
    _nicks: Array<string>,
    _currentLayout: string
}

type State = {

}

/**
 * Implements a class to render poker in the app.
 */
class Game extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            // value: false
        };

        // Bind event handlers so they are only bound once for every instance.
        // this._onAction = this._onAction.bind(this);
    }

    render() {
        return (
            <div className = { `game ${this.props._currentLayout}` }>
                <div className = 'player-list table'>
                    <div className = 'table-row'>
                        <div className = 'table-cell nick'>Name</div>
                        <div className = 'table-cell'>Amount</div>
                        <div className = 'table-cell'>Bet</div>
                        <div className = 'table-cell'>State</div>
                    </div>
                    {this.props._nicks.map(nick => (<PlayerListEntry
                        key = { nick }
                        nick = { nick } />))}
                </div>
                <div className = 'gameTable'>
                    <Table />
                </div>
            </div>
        );
    }

}

export function _mapStateToProps(state: Object) {
    const commonState: CommonState = state['features/poker'].common;
    const nicks: Array<string> = Object.keys(commonState.players);

    return {
        _nicks: nicks,
        _currentLayout: getCurrentLayout(state)
    };
}

export default translate(connect(_mapStateToProps)(Game));
