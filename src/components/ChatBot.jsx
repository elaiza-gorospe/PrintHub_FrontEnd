import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use the environment variable or fallback to localhost
      const API_URL = 'http://localhost:3000';
      console.log('API_URL is:', API_URL);
      console.log('Sending message:', input);
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chatHistory: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error details:', error);
      console.error('Error message:', error.message);
      
      // Show a more specific error message
      let errorText = 'Sorry, I\'m having trouble connecting. ';
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorText = '❌ Cannot connect to backend. Please make sure your backend server is running on port 3000.\n\nTo fix: Open a new terminal and run:\ncd PrintHub_Backend\nnode server.js';
      } else if (error.message.includes('404')) {
        errorText = '❌ Backend endpoint not found. Make sure your server.js has the /api/chat endpoint.';
      } else if (error.message.includes('500')) {
        errorText = '❌ Backend server error. Check your backend terminal for errors.';
      } else {
        errorText = `❌ Error: ${error.message}\n\nMake sure your backend is running on port 3000.`;
      }
      
      const errorMessage = {
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>PrintHub Assistant 🤖</h3>
            <p>Ask me anything about our printing services!</p>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Hi! I'm your PrintHub AI assistant. I can help with:</p>
                <ul>
                  <li>📄 Order status and tracking</li>
                  <li>🎨 Customization options (paper, sizes, finishes)</li>
                  <li>💰 Pricing and quotes</li>
                  <li>🚚 Delivery times and shipping</li>
                  <li>📎 File upload requirements</li>
                  <li>🔄 Returns and refunds</li>
                </ul>
                <p className="example-questions">Try asking: <em>"How much for 100 business cards?"</em> or <em>"What paper types do you offer?"</em></p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  <strong>{msg.role === 'user' ? 'You' : 'PrintHub AI'}:</strong>
                  <p>{msg.content}</p>
                  <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={2}
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;