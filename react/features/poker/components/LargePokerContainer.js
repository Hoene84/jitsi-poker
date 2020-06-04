// @flow

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n';
import Table from './Table';
import Game from './Game';
import Poker from './Poker';
import { getCurrentLayout } from '../../video-layout';
import { LAYOUTS } from '../../video-layout/constants';

export type Props = {
    participantId: string,
    t: Function,
    _currentLayout: string,
}

type State = {

}

/**
 * Implements a class to render poker in the app.
 */
class LargePokerContainer extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            // value: false
        };
    }

    render() {
        return (
            <div>
                {this.props._currentLayout !== LAYOUTS.TILE_VIEW
                && <div className = 'largePokerContainer'>
                    <Poker participantID = { this.props.participantId } />
                    <div className = 'poker-table-container'>
                        <Table />
                    </div>
                    {this.props.participantId === 'table'
                    && <Game />}
                </div>}
            </div>
        );
    }
}

export function _mapStateToProps(state: Object) {
    return {
        _currentLayout: getCurrentLayout(state)
    };
}

export default translate(connect(_mapStateToProps)(LargePokerContainer));
