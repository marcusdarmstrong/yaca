// <script src="http://server.foo/client/dist/comments" async></script>

const host = document.createElement('div');
document.querySelector('script[src*="yaca-web"]').after(host);

const socket = new WebSocket('wss://yaca-web.herokuapp.com');

socket.addEventListener('open', function (event) {
  host.insertAdjacentHTML('beforeend', 'Connected to server.');
});

socket.addEventListener('message', function (event) {
  host.insertAdjacentHTML('beforeend', 'Message from server ' + event.data);
});