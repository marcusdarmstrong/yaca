import React, { useState, useEffect } from 'react';
import guid from './guid';
import Timestamp from './timestamp';

const Message = React.memo(({ author, timestamp, body }) => {
  return (
    <div>
      <div>
        <span>{author.name}</span>
        <span><Timestamp time={timestamp} /></span>
      </div>
      <p>
        {body.map(i => {
          if (typeof i === 'string') {
            return i;
          }
          return null;
        })}
      </p>
    </div>
  );
});

const Pingback = React.memo(({ socket }) => {
  const [ time, setTime ] = useState(null);

  const [ comments, setComments] = useState([]);

  useEffect(() => {
    const listener = event => { 
      const message = JSON.parse(event.data);
      if (message.type === 'ping') {
        setTime(message.value);
      } else if (message.type === 'comment') {
        setComments([message.value, ...comments]);
      } else {
        console.log(message);
      }
    };

    const closeListener = evt => { setTime(null); };

    socket.addEventListener('message', listener);
    socket.addEventListener('close', closeListener);
    return () => {
      socket.removeEventListener('message', listener);
      socket.removeEventListener('close', closeListener);
    }
  }, [socket, comments, setComments, setTime]);

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
      <div>
        {
          comments.map(comment => (
            <Message
              key={comment.clientId}
              author={{name: comment.username}}
              body={[comment.comment]}
              timestamp={parseInt(comment.timestamp, 10)}
            />
          ))
        }
      </div>
    </div>
  );
});



const submit = (username, comment) => {
  const params = new URLSearchParams();
  params.set("username", username);
  params.set("comment", comment);
  params.set("clientId", guid());
  params.set("timestamp", Date.now());
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
        setComment('');
      }}>
        <textarea name="comment" onChange={e => setComment(e.target.value)} value={comment} />
        <input type="text" name="username" placeholder="username" onChange={e => setUsername(e.target.value)} value={username} />
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
      <Form />
      <Pingback socket={socket} />
      {/*state && state.payload &&
        <Message author={state.payload[0].author} timestamp={new Date()} body={state.payload[0].body} />*/}
    </>
  );
};