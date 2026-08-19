import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { fetchConversations, fetchThread, sendMessage } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const loadConversations = () => {
    fetchConversations().then(({ data }) => setConversations(data));
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!userId) {
      setThread([]);
      return;
    }
    fetchThread(userId).then(({ data }) => setThread(data));
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  useSocket((message) => {
    if (message.sender === userId || message.recipient === userId) {
      setThread((prev) => [...prev, message]);
    }
    loadConversations();
  });

  const activeConvo = conversations.find((c) => c.user._id === userId);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    try {
      const { data } = await sendMessage({ recipientId: userId, content });
      setThread((prev) => [...prev, data]);
      loadConversations();
    } catch {
      // silently fail, message box keeps content for retry would be nicer,
      // but keep this simple for now
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 grid md:grid-cols-3 gap-0 ticket overflow-hidden" style={{ minHeight: "70vh" }}>
      {/* Conversation list */}
      <div className="border-r border-line md:col-span-1 overflow-y-auto" style={{ maxHeight: "75vh" }}>
        <div className="p-4 border-b border-line">
          <h2 className="font-display font-bold">Messages</h2>
        </div>
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-mute">No conversations yet. Message a teacher from their listing or profile.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.user._id}
              onClick={() => navigate(`/messages/${c.user._id}`)}
              className={`w-full text-left px-4 py-3 border-b border-line hover:bg-paper transition-colors ${
                userId === c.user._id ? "bg-paper" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-7 h-7 rounded-full bg-moss/10 text-moss flex items-center justify-center font-display text-xs font-bold">
                  {c.user.name?.[0]?.toUpperCase()}
                </span>
                <span className="font-display font-semibold text-sm">{c.user.name}</span>
              </div>
              <p className="text-xs text-mute truncate pl-9">{c.lastMessage.content}</p>
            </button>
          ))
        )}
      </div>

      {/* Thread */}
      <div className="md:col-span-2 flex flex-col" style={{ maxHeight: "75vh" }}>
        {!userId ? (
          <div className="flex-1 flex items-center justify-center text-mute text-sm p-8">
            Select a conversation to view messages.
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-line flex items-center gap-2">
              <Link to={`/profile/${userId}`} className="font-display font-semibold hover:text-clay">
                {activeConvo?.user.name || "Conversation"}
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {thread.map((m) => {
                const mine = m.sender === user._id || m.sender?._id === user._id;
                return (
                  <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3.5 py-2 rounded-ticket text-sm ${
                      mine ? "bg-ink text-paper" : "bg-paper border border-line"
                    }`}>
                      <p>{m.content}</p>
                      <p className={`text-[10px] mt-1 ${mine ? "text-paper/60" : "text-mute"}`}>
                        {format(new Date(m.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-line flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message…"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary !px-4">
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
