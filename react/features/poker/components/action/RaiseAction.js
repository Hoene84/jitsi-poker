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
        this._raise = this._raise.bind(this);
    }

    render() {

        const { t } = this.props;

        return (
            <span className = 'poker-button'>
                <input
                    autoFocus = { true }
                    onChange = { this._onChange }
                    placeholder = { t('poker.raise.amount') }
                    type = 'number'
                    value = { this.state.amount } />
                <button
                    aria-label = { t(`poker.action.RAISE`) }
                    onClick = { this._raise }>
                    <div className = { 'poker-action' }>
                        {t(`poker.action.RAISE`)}
                    </div>
                </button>
            </span>
        );
    }

    _raise: () => void;
    _raise() {
        this.props.dispatch(raise(this.state.amount));
    }

    _onChange: () => void;
    _onChange(event) {
        this.setState({
            amount: parseInt(event.target.value)
        });
    }
}

export function _mapStateToProps() {
    return {};
}

export default translate(connect(_mapStateToProps)(RaiseAction));
