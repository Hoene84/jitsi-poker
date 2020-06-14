// @flow

import React, { Component } from 'react';
import { raise } from '../../actions';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';

type Props = {
    dispatch: Function,
    t: Function,
}

type State = {
    amount: number
}

class RaiseAction extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            amount: 100
        };

        // Bind event handlers so they are only bound once for every instance.
        this._onChange = this._onChange.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    render() {

        const { t } = this.props;

        return (
            <button
                aria-label = { t('poker.action.RAISE') }
                className = 'poker-button raise'
                onClick = { this._onClick }>
                <input
                    autoFocus = { true }
                    onChange = { this._onChange }
                    onKeyDown = { this._onKeyDown }
                    placeholder = { t('poker.raise.amount') }
                    type = 'number'
                    value = { this.state.amount } />
                <div className = { 'poker-action' }>
                    {t('poker.action.RAISE')}
                </div>
            </button>
        );
    }

    _onClick: () => void;
    _onClick(event) {
        if (event.target.tagName !== 'INPUT') {
            this.raise();
        }
    }

    _onChange: () => void;
    _onChange(event) {
        const number = parseInt(event.target.value, 10);

        if (!isNaN(number) || event.target.value === '') {
            this.setState({
                amount: parseInt(event.target.value, 10)
            });
        }
    }

    _onKeyDown: () => void;
    _onKeyDown(event) {
        if (event.key === 'Enter') {
            this.raise();
        }
    }

    raise() {
        this.props.dispatch(raise(this.state.amount));
    }
}

export function _mapStateToProps() {
    return {};
}

export default translate(connect(_mapStateToProps)(RaiseAction));
