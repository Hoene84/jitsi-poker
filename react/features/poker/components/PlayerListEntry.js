// @flow

import React, { Component } from 'react';
import type { CommonState, Player, PlayerState } from '../types';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { playerState, playerStateI18nParams } from '../functions';

export type Props = {
    nick: string,
    t: Function,
    _amount: number,
    _bet: number,
    _state: PlayerState,
    _playerStateI18nParams: Object,
    _dealer: boolean
}

export class PlayerListEntry extends Component<Props> {

    render() {

        const { t } = this.props;

        return (
            <div className = 'player-list-entry table-row'>
                <div className = 'table-cell dealer'>
                    {this.props._dealer
                    && <span className = 'dealer-button'><span>Dealer</span></span>}
                </div>
                <div className = 'table-cell nick'>{ this.props.nick }</div>
                <div className = 'table-cell amount'>{ this.props._amount }</div>
                <div className = 'table-cell bet'>{ this.props._bet }</div>
                <div className = { `table-cell state ${this.props._state}` }>
                    { t(`poker.state.${this.props._state}`, this.props._playerStateI18nParams) }
                </div>
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
        _playerStateI18nParams: playerStateI18nParams(state, ownProps.nick),
        _dealer: common.game.dealer === ownProps.nick
    };
}

export default translate(connect(_mapStateToProps)(PlayerListEntry));
