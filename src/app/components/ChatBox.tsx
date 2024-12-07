import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";
import { useFirebaseAuth } from '@/app/hooks/useFirebaseAuth';
import { db } from '@/app/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, limitToLast, onSnapshot } from 'firebase/firestore';
import { FaTimes } from 'react-icons/fa';

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: Date;
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBox = ({ isOpen, onClose }: ChatBoxProps) => {
  const { theme } = useTheme();
  const { user } = useFirebaseAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt'), limitToLast(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as ChatMessage[];
      
      setMessages(newMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden z-50">
      <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
        <h3 className="font-semibold">Community Chat</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start gap-3 ${
              message.userId === user?.uid ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`flex flex-col ${message.userId === user?.uid ? 'items-end' : ''}`}>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.userName}
              </span>
              <div className={`mt-1 px-4 py-2 rounded-2xl shadow-sm ${
                message.userId === user?.uid
                  ? 'bg-blue-500 text-white'
                  : theme === 'light'
                    ? 'bg-gray-100'
                    : 'bg-gray-700'
              }`}>
                {message.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              newMessage.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
