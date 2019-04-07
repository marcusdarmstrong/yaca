const getNextTimeout = ms => {
  if (ms < 1000*60*60) {
    return 1000*28;
  }
  if (ms < 1000*60*60*12) {
    return 1000*60*30;
  }
  return null;
}

const Timestamp = ({ time }) => {
  const [ ms, setMs ] = useState(Date.now() - time);
  useEffect(() => {
    const nextTimeout = getNextTimeout(ms);
    if (nextTimeout) {
      const timeout = setTimeout(() => {
        setMs(Date.now() - time);
      }, nextTimeout);

      return () => { clearTimeout(timeout); };
    }
  }, [ms, setMs]);


  if (ms < 1000*60) {
    return "Just now";
  }
  if (ms < 1000*60*1.5) {
    return "1 minute ago";
  }
  if (ms < 1000*60*60) {
    return `${Math.round(ms/(1000*60))} minutes ago`;
  }
  if (ms < 1000*60*60*1.5) {
    return "1 hour ago";
  } 
  if (ms < 1000*60*60*12) {
    return `${Math.round(ms/(1000*60*60))} hours ago`;
  }

  return new Date(timestamp).toLocaleString();
};

export default Timestamp;
