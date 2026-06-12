"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, Send, BookOpen, Target,
  Layers, MessageCircle, KeyRound, UploadCloud, Trash2, ChevronRight
} from "lucide-react";

type Source = { name: string; type: string; base64: string };
type Message = { role: "user" | "model"; content: string };
type Quiz = { question: string; options: string[]; answer: string; explanation: string };
type Flashcard = { front: string; back: string };

const PERSONAS = {
  "Study Buddy": "You are StudyBuddy, a warm, encouraging AI study assistant. You celebrate correct answers, gently correct mistakes, and always keep the user engaged. Keep responses concise.",
  "Socratic Tutor": "You are a Socratic tutor. You NEVER directly answer questions. You only respond with thoughtful questions that guide the student.",
  "Exam Coach": "You are a strict but fair exam coach. Speak formally. Give precise structured answers. After every concept, give one MCQ.",
  "Simple Explainer": "You are an expert at explaining complex topics simply. Use analogies. Explain as if to a curious 15-year-old."
};

const MarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-4 mb-2 text-[#FF758C]" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-4 mb-2 text-[#FF758C]" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-3 mb-2 text-[#FF9A9E]" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-3 leading-relaxed" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-bold text-inherit" {...props} />,
  code: ({ node, inline, ...props }: any) =>
    inline ? <code className="bg-pink-50 text-[#FF758C] px-1.5 py-0.5 rounded-md text-sm font-semibold" {...props} />
      : <pre className="bg-pink-50 p-3 rounded-xl overflow-x-auto text-sm my-3 border border-pink-100"><code {...props} /></pre>,
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("Chat");
  const [persona, setPersona] = useState<keyof typeof PERSONAS>("Study Buddy");

  const [sources, setSources] = useState<Source[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const getGenAI = () => new GoogleGenerativeAI(apiKey);

  const getSystemInstruction = () => {
    let instruction = PERSONAS[persona];
    if (sources.length > 0) {
      instruction += `\n\nThe user uploaded these sources: ${sources.map(s => s.name).join(", ")}. Use them as context.`;
    }
    return instruction;
  };

  const getModel = () => {
    return getGenAI().getGenerativeModel({
      // FIXED: Updated to an active model alias to bypass the 404 Not Found error
      model: "gemini-2.0-flash", // you can also try "gemini-1.5-flash-latest"
      systemInstruction: getSystemInstruction(),
    });
  };

  const getSourceParts = () => {
    return sources.map((s) => ({
      inlineData: { data: s.base64, mimeType: s.type }
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) setIsAuthenticated(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newSources = [...sources];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const base64 = await fileToBase64(file);
      if (!newSources.find(s => s.name === file.name)) {
        newSources.push({ name: file.name, type: file.type, base64 });
      }
    }
    setSources(newSources);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const model = getModel();
      const parts: any[] = [...getSourceParts(), userMessage];
      const result = await model.generateContent(parts);
      setChatHistory((prev) => [...prev, { role: "model", content: result.response.text() }]);
    } catch (err: any) {
      setChatHistory((prev) => [...prev, { role: "model", content: `⚠️ **Google API Error:** ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    setSummary("");
    try {
      const model = getModel();
      const result = await model.generateContent([...getSourceParts(), "Analyse the uploaded content. Provide: 1. Overview 2. Key Topics 3. Key Takeaways. Use markdown."]);
      setSummary(result.response.text());
    } catch (err: any) {
      setSummary(`⚠️ **Google API Error:** ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const model = getModel();
      const prompt = `Generate exactly 5 multiple choice questions based on the uploaded content. Return ONLY a valid JSON array format: [{"question":"...","options":["A...","B...","C...","D..."],"answer":"A","explanation":"..."}]`;
      const result = await model.generateContent([...getSourceParts(), prompt]);
      let text = result.response.text().trim();
      if (text.startsWith("```")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      setQuiz(JSON.parse(text));
    } catch (err: any) {
      alert(`⚠️ Google API Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const model = getModel();
      const prompt = `Generate 6 flashcards based on the uploaded content. Return ONLY a valid JSON array: [{"front":"...","back":"..."}]`;
      const result = await model.generateContent([...getSourceParts(), prompt]);
      let text = result.response.text().trim();
      if (text.startsWith("```")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      setFlashcards(JSON.parse(text));
    } catch (err: any) {
      alert(`⚠️ Google API Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFDFD] to-[#FFEAF0] p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2rem] shadow-[0_10px_40px_rgba(255,154,158,0.2)] max-w-md w-full text-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="inline-block bg-pink-50 p-4 rounded-full mb-6">
            <Sparkles className="text-[#FF9A9E] w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-[#FF758C] mb-2">StudyBuddy AI 🎀</h1>
          <p className="text-[#a89b9f] mb-8 font-medium">Your cozy, smart study companion 🧸</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Enter REAL Gemini API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#FFFDFD] border-2 border-[#FFEAF0] focus:border-[#FF9A9E] outline-none transition-all shadow-sm text-[#5C4D53] placeholder-gray-400 font-medium"
              />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 bg-[#FF9A9E] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all">
              Start Studying ✨
            </motion.button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FFFDFD]">
      <aside className="w-72 bg-white border-r border-[#FFEAF0] p-6 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="text-[#FF9A9E] w-6 h-6" />
          <h2 className="text-xl font-bold text-[#FF758C]">StudyBuddy 🎀</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-500 mb-2 block">AI Persona 🧸</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as keyof typeof PERSONAS)}
              className="w-full p-3 rounded-xl bg-pink-50 border-none outline-none text-[#5C4D53] font-medium"
            >
              {Object.keys(PERSONAS).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-500 mb-2 block">Sources 📚</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#FF9A9E] bg-[#FFEAF0]/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-[#FFEAF0] transition-colors"
            >
              <UploadCloud className="w-6 h-6 text-[#FF9A9E] mx-auto mb-2" />
              <span className="text-sm font-medium text-[#FF758C]">Upload PDFs, Images...</span>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>

            <div className="mt-3 space-y-2">
              {sources.map((s, i) => (
                <div key={i} className="text-xs bg-white border border-pink-100 p-2 rounded-lg flex items-center justify-between shadow-sm">
                  <span className="truncate max-w-[180px] font-medium text-gray-600">📄 {s.name}</span>
                  <button onClick={() => setSources(sources.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 text-red-300 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          <div className="flex space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-pink-50 w-fit mb-8">
            {[
              { id: "Chat", icon: MessageCircle },
              { id: "Summary", icon: BookOpen },
              { id: "Quiz", icon: Target },
              { id: "Flashcards", icon: Layers }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === tab.id ? "bg-[#FF9A9E] text-white shadow-md" : "text-gray-400 hover:bg-pink-50"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </div>

          {activeTab === "Chat" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] shadow-sm border border-pink-50 p-6 h-[70vh] flex flex-col relative">

              <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                    <Sparkles className="w-8 h-8 text-pink-200" />
                    <p>Start chatting with {persona}!</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <motion.div initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 max-w-[80%] rounded-2xl ${msg.role === "user" ? "bg-[#FF9A9E] text-white rounded-br-sm" : "bg-[#FFEAF0] text-[#5C4D53] rounded-bl-sm"}`}>
                      <ReactMarkdown components={MarkdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#FFEAF0] text-[#5C4D53] p-4 rounded-2xl rounded-bl-sm animate-pulse font-medium">Thinking... 🤔</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="mt-4 flex gap-3 items-center bg-[#FFFDFD] border-2 border-pink-100 focus-within:border-[#FF9A9E] transition-colors p-2 rounded-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${persona} something...`}
                  className="flex-1 bg-transparent outline-none px-4 text-[#5C4D53] placeholder-gray-400 font-medium"
                />
                <button type="submit" disabled={loading} className="bg-[#FF9A9E] text-white p-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === "Summary" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2rem] shadow-sm border border-pink-50 p-8 min-h-[60vh]">
              {summary ? (
                <div className="text-[#5C4D53]">
                  <ReactMarkdown components={MarkdownComponents}>
                    {summary}
                  </ReactMarkdown>
                  <button onClick={generateSummary} className="mt-8 px-6 py-3 bg-pink-50 text-[#FF758C] font-bold rounded-xl hover:bg-pink-100 transition-colors">🔄 Regenerate</button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20">
                  <BookOpen className="w-12 h-12 text-pink-200" />
                  <p className="text-gray-400 font-medium">Generate a beautiful summary of your uploaded sources.</p>
                  <button onClick={generateSummary} disabled={loading} className="px-8 py-4 bg-[#FF9A9E] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {loading ? "Analysing... ✨" : "Generate Summary 📋"}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Quiz" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {quiz.length === 0 ? (
                <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 p-12 text-center space-y-6">
                  <Target className="w-12 h-12 text-pink-200 mx-auto" />
                  <button onClick={generateQuiz} disabled={loading} className="px-8 py-4 bg-[#FF9A9E] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {loading ? "Generating... 🎯" : "Generate Custom Quiz 🎯"}
                  </button>
                </div>
              ) : (
                quiz.map((q, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
                    <h3 className="font-bold text-lg mb-4 text-[#FF758C]">Q{i + 1}: {q.question}</h3>
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, j) => (
                        <div key={j} className="p-3 bg-pink-50/50 rounded-xl text-sm font-medium text-[#5C4D53]">{opt}</div>
                      ))}
                    </div>
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-bold text-[#FF9A9E] flex items-center gap-1">
                        <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" /> Show Answer
                      </summary>
                      <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl text-sm leading-relaxed">
                        <strong>Correct Answer: {q.answer}</strong><br />{q.explanation}
                      </div>
                    </details>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "Flashcards" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {flashcards.length === 0 ? (
                <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 p-12 text-center space-y-6">
                  <Layers className="w-12 h-12 text-pink-200 mx-auto" />
                  <button onClick={generateFlashcards} disabled={loading} className="px-8 py-4 bg-[#FF9A9E] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {loading ? "Creating... 🃏" : "Generate Flashcards 🃏"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {flashcards.map((card, i) => (
                    <div key={i} className="group w-full h-48 cursor-pointer" style={{ perspective: "1000px" }}>
                      <div className="relative w-full h-full transition-transform duration-500" style={{ transformStyle: "preserve-3d" }}>
                        <div className="absolute inset-0 bg-white border-2 border-pink-100 rounded-2xl p-6 flex items-center justify-center text-center shadow-sm group-hover:opacity-0 transition-opacity duration-300">
                          <h3 className="font-bold text-[#FF758C] text-lg">{card.front}</h3>
                        </div>
                        <div className="absolute inset-0 bg-[#FFEAF0] border-2 border-[#FF9A9E] rounded-2xl p-6 flex items-center justify-center text-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-sm font-medium text-[#5C4D53]">{card.back}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}