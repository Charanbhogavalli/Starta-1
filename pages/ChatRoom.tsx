
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage, ConnectionRequest, StartupIdea } from '../types';

const ChatRoom: React.FC = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conn, setConn] = useState<ConnectionRequest | null>(null);
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (connectionId && user) {
        const c = await db.getRequestById(connectionId);
        if (c && (c.founderId === user.id || c.funderId === user.id)) {
          setConn(c);
          const i = await db.getIdeaById(c.ideaId);
          setIdea(i || null);
          const msgs = await db.getMessages(connectionId);
          setMessages(msgs);
        } else {
          navigate('/');
        }
      }
    };
    init();

    const interval = setInterval(async () => {
      if (connectionId) {
        const msgs = await db.getMessages(connectionId);
        setMessages(msgs);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [connectionId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !connectionId) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      connectionId,
      senderId: user.id,
      text: input,
      timestamp: new Date().toISOString()
    };

    await db.sendMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  if (!conn) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold">Chat about {idea?.title || 'Startup Idea'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {messages.map(m => {
          const isMe = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                <p>{m.text}</p>
                <p className="text-[10px] mt-1 opacity-50">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button type="submit" className="absolute right-3 top-3 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-500 transition font-bold">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
