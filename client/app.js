import React, { useState, useEffect } from 'react';

export default ({ host, path, socket }) => {
  const [ time, setTime ] = useState(null);

  useEffect(() => {
    const listener = event => { setTime(event.data); };
    socket.addEventListener('message', listener);
    return () => socket.removeEventListener('message', listener);
  }, [socket]);



  return (
    !time 
      ? <div>Connecting to the server...</div>
      : <div>The server says the time is {time}</div>
  );
};