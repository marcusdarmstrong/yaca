// <script src="http://server.foo/client/dist/comments" async></script>

const host = document.createElement('div');
document.querySelector('script[src*="yaca-web"]').after(host);

const socket = new WebSocket('wss://yaca-web.herokuapp.com');

socket.addEventListener('open', function (event) {
  host.insertAdjacentHTML('beforeend', `<p>Connected to server from ${document.location}.</p>`);
});

socket.addEventListener('message', function (event) {
  host.insertAdjacentHTML('beforeend', '<p>Message from server ' + event.data + '</p>');
});