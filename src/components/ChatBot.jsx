import React, { useState, useRef, useEffect } from 'react';
import { Send, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import axios from 'axios';
import Select from './comps/Select';

const ChatbotUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setMessages([]);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (!inputValue.trim() && selectedOption !== "Check Fares") ||
      (selectedOption === "Check Fares" && (!source || !destination))
    ) return;

    let payload = { query: '', location: '', stations: '' };

    if (selectedOption === "Check Fares") {
      if (!source || !destination) return;
      payload.stations = [source, destination];
    } else if (selectedOption === "Nearest Places") {
      payload.location = inputValue;
    } else {
      payload.query = inputValue;
    }

    const userMessage = { id: messages.length + 1, text: inputValue, isBot: false };
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log(payload);
      const response = await axios.post("https://neo-metro-flask.vercel.app/chat", payload);
      console.log(response.data);
      switch (selectedOption) {
        case "Check Fares":
          var botResponse = { id: messages.length + 2, text: `The fare from ${source} to ${destination} is ₹${response.data.fare}`, isBot: true };
          break;
        case "Nearest Places":
          var botResponse = { id: messages.length + 2, text: response.data.response, isBot: true };
          break;
        default:
          var botResponse = { id: messages.length + 2, text: response.data.response, isBot: true };
      }
  
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col">
      <button
        onClick={toggleChat}
        className="ml-auto mb-2 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all duration-300"
      >
        {isOpen ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl flex flex-col w-80 md:w-96 h-96 overflow-hidden transition-all duration-300 border border-gray-200">
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">Chat Support</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>

          {/* Option Selection */}
          <div className="p-4 border-b bg-gray-50 flex justify-around">
            {["Check Fares", "Nearest Places", "Other Queries"].map(option => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${selectedOption === option ? "bg-indigo-600 text-white" : "bg-gray-200"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-3 flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${message.isBot
                    ? 'bg-white border border-gray-200 text-gray-800'
                    : 'bg-indigo-600 text-white'
                    }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center">
              {selectedOption === "Check Fares" ? (
                <div className="flex w-full space-x-2">
                  <Select label="Source" value={source} setValue={setSource} />
                  <Select label="Destination" value={destination} setValue={setDestination} />
                </div>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={selectedOption ? "Type your message..." : "Select an option first"}
                  className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none"
                  disabled={!selectedOption}
                />
              )}

              <button
                type="submit"
                disabled={!selectedOption || (!inputValue.trim() && selectedOption !== "Check Fares")}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-lg p-2 ${(!selectedOption || (!inputValue.trim() && selectedOption !== "Check Fares")) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <Send size={20} onClick={handleSubmit} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotUI;
