import React, { useState, useEffect } from "react";
import guid from "./guid";
import Timestamp from "./timestamp";

// eslint-disable-next-line react/display-name
const Message = React.memo(
  ({
    author,
    timestamp,
    body
  }: {
    author: { name: string };
    timestamp: number;
    body: Array<string>;
  }) => {
    return (
      <div>
        <div>
          <span>{author.name}</span>
          <span>
            <Timestamp time={timestamp} />
          </span>
        </div>
        <p>
          {body.map(i => {
            if (typeof i === "string") {
              return i;
            }
            return null;
          })}
        </p>
      </div>
    );
  }
);

// eslint-disable-next-line react/display-name
const Pingback = React.memo(({ socket }: { socket: WebSocket }) => {
  const [time, setTime] = useState(null);

  const [comments, setComments] = useState<
    { clientId: string; username: string; comment: string; timestamp: string }[]
  >([]);

  useEffect(() => {
    const listener = (event: MessageEvent): void => {
      const message = JSON.parse(event.data);
      if (message.type === "ping") {
        setTime(message.value);
      } else if (message.type === "comment") {
        setComments([message.value, ...comments]);
      } else {
        console.log(message);
      }
    };

    const closeListener = (): void => {
      setTime(null);
    };

    socket.addEventListener("message", listener);
    socket.addEventListener("close", closeListener);
    return (): void => {
      socket.removeEventListener("message", listener);
      socket.removeEventListener("close", closeListener);
    };
  }, [socket, comments, setComments, setTime]);

  const [isHidden, setHidden] = useState(false);
  useEffect(() => {
    const listener = (): void => {
      setHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", listener);
    return (): void => {
      document.removeEventListener("visibilitychange", listener);
    };
  }, [setHidden]);

  return (
    <div>
      {!time ? (
        <div>Connecting to the server...</div>
      ) : (
        <div>The server says the time is {time}</div>
      )}
      <div>
        <span>Document is {isHidden ? "hidden" : "visible"}</span>
      </div>
      <div>
        {comments.map(comment => (
          <Message
            key={comment.clientId}
            author={{ name: comment.username }}
            body={[comment.comment]}
            timestamp={parseInt(comment.timestamp, 10)}
          />
        ))}
      </div>
    </div>
  );
});

const submit = (username: string, comment: string): void => {
  const params = new URLSearchParams();
  params.set("username", username);
  params.set("comment", comment);
  params.set("clientId", guid());
  params.set("timestamp", Date.now().toString());
  fetch(`https://yaca-web.herokuapp.com/api/add-comment`, {
    method: "POST",
    body: params
  });
};

const Form = (): JSX.Element => {
  const [comment, setComment] = useState("");
  const [username, setUsername] = useState("");
  return (
    <div>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
          e.preventDefault();
          submit(username, comment);
          setComment("");
        }}
      >
        <textarea
          name="comment"
          onChange={(e): void => {
            setComment(e.target.value);
          }}
          value={comment}
        />
        <input
          type="text"
          name="username"
          placeholder="username"
          onChange={(e): void => {
            setUsername(e.target.value);
          }}
          value={username}
        />
        <input type="submit" name="submit" value="Add Comment" />
      </form>
    </div>
  );
};

const App = ({
  host,
  path,
  socket
}: {
  host: string;
  path: string;
  socket: WebSocket;
}): JSX.Element => {
  const [state, setState] = useState<null | {
    next: string;
    payload: Array<{
      id: string;
      clientId: string;
      author: {
        id: string;
        name: string;
        avatar: string;
      };
      body: string[];
      timestamp: string;
    }>;
  }>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `https://yaca-web.herokuapp.com/latest?host=${encodeURIComponent(
        host
      )}&path=${encodeURIComponent(path)}`,
      {
        signal: controller.signal,
        credentials: "include"
      }
    )
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(initialState => {
        setState(initialState);
      });

    return (): void => {
      controller.abort();
    };
  }, [host, path]);

  return (
    <>
      <Form />
      <Pingback socket={socket} />
      {state && state.payload && (
        <Message
          author={state.payload[0].author}
          timestamp={Date.now()}
          body={state.payload[0].body}
        />
      )}
    </>
  );
};

export default App;
