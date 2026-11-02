import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  BrainCircuit,
  Sparkles,
  Bot,
  User,
  Trash2,
  Lock,
  ArrowRight,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { Dataset, CalculatedKPI } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset | null;
  kpis: CalculatedKPI[];
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  dataset,
  kpis,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'model',
      content:
        "Hello! I'm your ClientReport AI Data Analyst. Ask me anything about your active dataset, KPI formulas, data cleaning recommendations, or executive summaries.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Explain my highest revenue driver',
    'Which segment carries highest risk?',
    'Recommend 3 data cleaning operations',
    'Summarize this dataset in 3 bullet points',
  ];

  const handleSend = async (contentToSend?: string) => {
    const text = contentToSend || input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model,
          datasetContext: dataset
            ? {
                name: dataset.name,
                rowCount: dataset.rowCount,
                columnCount: dataset.columnCount,
                qualityScore: dataset.qualityScore,
                columns: dataset.columns,
                kpis: kpis.map((k) => ({ label: k.label, value: k.formattedValue })),
              }
            : null,
        }),
      });

      const data = await res.json();
      const replyContent = data.reply || 'Analysis completed.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: 'I encountered an error connecting to the AI engine. Please verify network or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">Ask Gemini AI Analyst</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-300 border border-indigo-700">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[260px]">
              Grounded in: {dataset?.name || 'Workspace Dataset'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMessages([messages[0]])}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Drawer (Esc)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Selection Toolbar & Privacy Callout */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[10px] text-slate-500">Only derived metrics analyzed</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Model:</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (Balanced)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
          </select>
        </div>
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-sky-500 text-white rounded-tr-xs shadow-xs font-medium'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60 whitespace-pre-line'
                }`}
              >
                {m.content}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    isUser ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-slate-100 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Analyzing dataset with {model}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Queries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 font-medium transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Composer */}
      <div className="p-3.5 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about columns, trends, formulas... (Ctrl+J)"
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
