// @flow

import React, { Component } from 'react';
import type { CommonState, Player, PlayerState } from '../types';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { playerState } from '../functions';

export type Props = {
    nick: string,
    _amount: number,
    _bet: number,
    _state: PlayerState,
    _dealer: boolean
}

export class PlayerListEntry extends Component<Props> {

    render() {
        return (
            <div className = 'player-list-entry table-row'>
                <div className = 'table-cell nick'>
                    <span className = 'nick'>{ this.props.nick }
                        {this.props._dealer
                        && <span className = 'dealer'><span>Dealer</span></span>}
                    </span>
                </div>
                <div className = 'table-cell amount'>{ this.props._amount }</div>
                <div className = 'table-cell bet'>{ this.props._bet }</div>
                <div className = 'table-cell state'>{ this.props._state }</div>
            </div>
        );
    }
}

export function _mapStateToProps(state: Object, ownProps: Props) {
    const common: CommonState = state['features/poker'].common;
    const player: Player = common.players[ownProps.nick];

    return {
        _amount: player.amount,
        _bet: player.bet,
        _state: playerState(state, ownProps.nick),
        _dealer: common.game.dealer === ownProps.nick
    };
}

export default translate(connect(_mapStateToProps)(PlayerListEntry));
