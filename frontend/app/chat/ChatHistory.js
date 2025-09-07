import React, { useEffect, useState } from "react";

const ChatHistory = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/chat/history/${roomId}?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.data.messages);
        setTotal(data.data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roomId, page, limit]);

  return (
    <div>
      <h2>Chat History</h2>
      {loading ? <div>Loading...</div> : (
        <ul>
          {messages.map(msg => (
            <li key={msg.id}>{msg.content}</li>
          ))}
        </ul>
      )}
      <div>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span> Page {page} of {Math.ceil(total / limit)} </span>
        <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total}>Next</button>
      </div>
    </div>
  );
};

export default ChatHistory;