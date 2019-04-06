// <script src="http://yaca-web.herokuapp.com/client/bundle.js" async></script>

import React from 'react';
import ReactDom from 'react-dom';
import Yaca from './app';

const host = document.createElement('div');
document.querySelector('script[src*="yaca-web"]').after(host);

ReactDom.render(
  <Yaca
    host={window.location.host}
    path={window.location.path || '/'}
    socket={new WebSocket('wss://yaca-web.herokuapp.com')}
  />,
  host
);
