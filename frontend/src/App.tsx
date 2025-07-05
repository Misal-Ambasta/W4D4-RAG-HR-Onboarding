import "./App.css";
import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import ChatInterface from "./components/ChatInterface";

function App() {
  const [tab, setTab] = useState<'admin' | 'chat'>('chat');
  return (
    <div className="min-h-screen">
      <nav className="flex justify-center gap-6 py-4 bg-teal-600 text-white shadow sticky top-0 z-50">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-150 ${
            tab === 'chat' ? 'bg-white text-teal-700 shadow' : 'hover:bg-teal-500'
          }`}
          onClick={() => setTab('chat')}
        >
          HR Assistant Chat
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-150 ${
            tab === 'admin' ? 'bg-white text-teal-700 shadow' : 'hover:bg-teal-500'
          }`}
          onClick={() => setTab('admin')}
        >
          Admin Dashboard
        </button>
      </nav>
      <div className="bg-teal-50 min-h-[calc(100vh-56px)]">
        {tab === 'chat' ? <ChatInterface /> : <AdminDashboard />}
      </div>
    </div>
  );
}

export default App;
