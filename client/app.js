import React, { useState, useEffect } from 'react';

const Timestamp = React.memo(({ time }) => {
  // This should self-update with the time.
  return time.toString();
});

const Message = React.memo(({ author, timestamp, body }) => {
  return (
    <div>
      <div>
        <span>{author.name}</span>
        <span><Timestamp time={timestamp} /></span>
      </div>
      <div>
        {body.map(i => {
          if (typeof i === 'string') {
            return i;
          }
          return null;
        })}
      </div>
    </div>
  );
});

const Pingback = React.memo(({ socket }) => {
  const [ time, setTime ] = useState(null);

  useEffect(() => {
    const listener = event => { setTime(event.data); };
    const closeListener = evt => { setTime(null); };
    socket.addEventListener('message', listener);
    socket.addEventListener('close', closeListener);
    return () => {
      socket.removeEventListener('message', listener);
      socket.removeEventListener('close', closeListener);
    }
  }, [socket, setTime]);

  const [ isHidden, setHidden ] = useState(false);
  useEffect(() => {
    const listener = (e) => {
      setHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  }, [setHidden]);

  return (
    <div>
      {
        !time 
          ? <div>Connecting to the server...</div>
          : <div>The server says the time is {time}</div>
      }
      <div>
        <span>Document is {isHidden ? "hidden" : "visible"}</span>
      </div>
    </div>
  );
});

export default ({ host, path, socket }) => {
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
    <>
      <Pingback socket={socket} />
      {state && state.payload &&
        <Message author={state.payload[0].author} timestamp={new Date()} body={state.payload[0].body} />}
    </>
  );
};