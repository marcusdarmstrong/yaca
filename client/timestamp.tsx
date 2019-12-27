import React, { useState, useEffect } from "react";

const getNextTimeout = (ms: number): number | null => {
  if (ms < 1000 * 60 * 60) {
    return 1000 * 31;
  }
  if (ms < 1000 * 60 * 60 * 12) {
    return 1000 * 60 * 31;
  }
  return null;
};

const Timestamp = ({ time }: { time: number }): JSX.Element => {
  const [ms, setMs] = useState(Date.now() - time);
  useEffect(() => {
    const nextTimeout = getNextTimeout(ms);
    if (nextTimeout) {
      const timeout = setTimeout(() => {
        setMs(Date.now() - time);
      }, nextTimeout);

      return (): void => {
        clearTimeout(timeout);
      };
    }
  }, [ms, setMs, time]);

  if (ms < 1000 * 60) {
    return <>Just now</>;
  }
  if (ms < 1000 * 60 * 1.5) {
    return <>1 minute ago</>;
  }
  if (ms < 1000 * 60 * 60) {
    return <>{Math.round(ms / (1000 * 60))} minutes ago</>;
  }
  if (ms < 1000 * 60 * 60 * 1.5) {
    return <>1 hour ago</>;
  }
  if (ms < 1000 * 60 * 60 * 12) {
    return <>{Math.round(ms / (1000 * 60 * 60))} hours ago</>;
  }

  return <>{new Date(time).toLocaleString()}</>;
};

export default Timestamp;
