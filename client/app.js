import React, { useState, useEffect } from 'react';

export default ({ host, path, socket }) => {
  const [ time, setTime ] = useState(null);

  useEffect(() => {
    const listener = event => { setTime(event.data); };
    socket.addEventListener('message', listener);
    return () => socket.removeEventListener('message', listener);
  }, [socket]);

  const [ state, setState ] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `https://yaca-web.herokuapp.com/latest?host=${
        encodeURIComponent(host)
      }&path=${
        encodeURIComponent(path)
      }`,
      {
        signal: controller.signal,
        credentials: 'include'
      }
    ).then(res => {
      if (res.ok) {
        return res.json();
      }
    }).then(initialState => {
      setState(initialState);
    });

    return () => { controller.abort(); };
  }, [host, path]);

  return (
    !time 
      ? <div>Connecting to the server...</div>
      : <div>The server says the time is {time}</div>
  );
};