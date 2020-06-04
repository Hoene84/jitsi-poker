// @flow

import React, { Component } from 'react';
import { connect } from '../../base/redux';
import { translate } from '../../base/i18n';
import Table from './Table';

export type Props = {
    dispatch: Function,
    t: Function,
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
            <div className = 'game'>
                <div>GAME</div>
                <div className = 'gameTable'>
                    <Table />
                </div>
            </div>
        );
    }

}

export function _mapStateToProps() {
    return {};
}

export default translate(connect(_mapStateToProps)(Game));
