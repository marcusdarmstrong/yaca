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

const guid = () => {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const submit = (username, comment) => {
  const params = new URLSearchParams();
  params.username = username;
  params.comment = comment;
  params.clientId = guid();
  params.timestamp = Date.now();
  fetch(`https://yaca-web.herokuapp.com/api/add-comment`, {
    method: 'POST',
    body: params
  });
};

const Form = () => {
  const [ comment, setComment ] = useState("");
  const [ username, setUsername ] = useState("");
  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault();
        submit(username, comment);
      }}>
        <textarea name="comment" onChange={e => setComment(e.target.value)} />
        <input type="text" name="username" onChange={e => setUsername(e.target.value)} />
        <input type="submit" name="submit" value="Add Comment" />
      </form>
    </div>
  );
}

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
      <Form />
      {state && state.payload &&
        <Message author={state.payload[0].author} timestamp={new Date()} body={state.payload[0].body} />}
    </>
  );
};