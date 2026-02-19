'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Cloud, Target, Heart, RotateCcw } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 1. קומפוננטת כרטיסיות הפתיחה (Starter Cards)
  const starterCards = [
    {
      title: "אני עוד לגמרי בערפל",
      subtitle: "אשמח להתחיל מהתחלה",
      icon: <Cloud className="text-orange-400" size={24} />,
      text: "אני עוד לגמרי בערפל, אשמח להתחיל מהתחלה"
    },
    {
      title: "סגורה על הכיוון הכללי",
      subtitle: "צריכה עזרה בלדייק תקן",
      icon: <Target className="text-orange-400" size={24} />,
      text: "אני סגורה על הכיוון הכללי, צריכה עזרה בלדייק תקן"
    },
    {
      title: "אני לחוצה מהמיונים",
      subtitle: "צריכה קצת עזרה והרגעה",
      icon: <Heart className="text-orange-400" size={24} />,
      text: "אני לחוצה מהמיונים, צריכה קצת עזרה והרגעה"
    }
  ];

  const sendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה בשרת');

      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ שגיאה: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-[#FFF9F5] shadow-xl border-x border-orange-100" dir="rtl">
      {/* Header */}
      <header className="p-4 bg-white border-b border-orange-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-full">
            <Sparkles className="text-orange-400 w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg text-slate-700">צוות המומחים לשירות לאומי</h1>
        </div>
        
        {/* כפתור האיפוס החדש */}
        {messages.length > 0 && (
          <button 
            onClick={() => setMessages([])}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all"
            title="צ'אט חדש"
          >
            <RotateCcw size={16} />
            <span>צ'אט חדש</span>
          </button>
        )}
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FFF9F5] to-white">
        
        {/* Empty State with Starter Cards */}
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="py-12 flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-700 mb-2">שלום לך! 👋</h2>
                <p className="text-slate-500">אנחנו כאן כדי לעבור איתך את התהליך ברוגע.</p>
              </div>

              <div className="w-full space-y-3 px-4">
                {starterCards.map((card, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => sendMessage(undefined, card.text)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-orange-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-orange-50 transition-all text-right group"
                  >
                    <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-white transition-colors">
                      {card.icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{card.title}</div>
                      <div className="text-sm text-slate-500">{card.subtitle}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message List */}
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              m.role === 'user' 
                ? 'bg-orange-400 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-70">
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                <span className="text-xs font-medium">{m.role === 'user' ? 'את' : 'אנחנו'}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="text-slate-400 text-sm animate-pulse italic pr-4">
            אנחנו כותבים לך תשובה...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-orange-100">
        <div className="relative flex items-center gap-2">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="כתבי לנו כאן..." 
            className="flex-1 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-200 text-slate-700 outline-none transition-all" 
          />
          <button 
            type="submit" 
            className="p-3 bg-orange-400 text-white rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}