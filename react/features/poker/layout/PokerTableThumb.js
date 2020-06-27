/* global $, APP */

import SmallVideo from '../../../../modules/UI/videolayout/SmallVideo';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import Game from '../components/Game';


export default class PokerTableThumb extends SmallVideo {

    constructor(videoLayout) {
        super(videoLayout);
        this.id = 'table';
        this.container = this.createContainer();
        this.$container = $(this.container);
        this._setThumbnailSize();
        this.container.onclick = this._onContainerClick;
    }

    createContainer() {
        const container = document.createElement('span');
        const remoteVideosContainer
            = document.getElementById('filmstripRemoteVideosContainer');
        const localVideoContainer
            = document.getElementById('localVideoTileViewContainer');

        container.className = 'tableThumb videocontainer';
        remoteVideosContainer.insertBefore(container, localVideoContainer);
        ReactDOM.render(
            <Provider store = { APP.store }>
                <I18nextProvider i18n = { i18next }>
                    <Game />
                </I18nextProvider>
            </Provider>,
            container
        );

        return container;
    }
}
