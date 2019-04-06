// <script src="http://server.foo/client/dist/comments" async></script>

const host = document.createElement('div');
document.querySelector('script[src*="yaca-web"]').after(host);

const socket = new WebSocket('ws://yaca-web.herokuapp.com');

socket.addEventListener('open', function (event) {
    console.log('Connected to server!')
});

socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});