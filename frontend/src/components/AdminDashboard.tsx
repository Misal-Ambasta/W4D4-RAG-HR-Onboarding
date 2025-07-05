import { useState, useEffect, useRef, type ChangeEvent } from "react";

interface DocumentItem {
  filename: string;
  upload_date: string;
  status: string;
  category: string;
}

interface Stats {
  total_documents: number;
  total_queries: number;
}

const categories = ["Benefits", "Leave", "Conduct", "General"] as const;

const BASE_URL = "http://localhost:8000";

export default function AdminDashboard() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const fetchDocs = async () => {
    const res = await fetch(`${BASE_URL}/documents`);
    if (res.ok) {
      const data = await res.json();
      setDocs(data);
    }
  };

  const fetchStats = async () => {
    const res = await fetch(`${BASE_URL}/stats`);
    if (res.ok) setStats(await res.json());
  };

  useEffect(() => {
    fetchDocs();
    fetchStats();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    setUploading(true);
    const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body });
    setUploading(false);
    if (res.ok) {
      await fetchDocs();
      await fetchStats();
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      alert("Upload failed");
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;
    const res = await fetch(`${BASE_URL}/documents/${filename}`, { method: "DELETE" });
    if (res.ok) {
      await fetchDocs();
      await fetchStats();
    } else {
      alert("Delete failed");
    }
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.filename.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCategory = (idx: number, newCat: string) => {
    setDocs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], category: newCat };
      return copy;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur shadow-md mb-8">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-teal-700 tracking-tight">HR Onboarding Admin Dashboard</h1>
          <span className="text-xs text-gray-400">v1.0</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Upload Card */}
          <div className="col-span-1 bg-white rounded-xl shadow p-6 flex flex-col items-center border border-teal-100">
            <h2 className="text-lg font-semibold mb-3 text-teal-800">Upload Document</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 w-full mb-2"
            />
            {uploading && <p className="text-sm text-teal-600 mt-2 animate-pulse">Uploading…</p>}
          </div>

          {/* Search & Stats Card */}
          <div className="col-span-2 bg-white rounded-xl shadow p-6 border border-teal-100 flex flex-col gap-4">
            <label className="block font-medium text-gray-700 mb-1">Search Documents</label>
            <input
              type="text"
              placeholder="Search by filename or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-teal-200 p-2 rounded w-full focus:ring-2 focus:ring-teal-200"
            />
            {stats && (
              <div className="flex gap-8 mt-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-teal-700">{stats.total_documents}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Documents</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-teal-700">{stats.total_queries}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Queries</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents Table Card */}
        <div className="bg-white rounded-xl shadow border border-teal-100 p-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-800">Uploaded Documents</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-teal-700 font-semibold">Filename</th>
                  <th className="px-4 py-2 text-left text-teal-700 font-semibold">Upload Date</th>
                  <th className="px-4 py-2 text-left text-teal-700 font-semibold">Status</th>
                  <th className="px-4 py-2 text-left text-teal-700 font-semibold">Category</th>
                  <th className="px-4 py-2 text-left text-teal-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">No documents found.</td>
                  </tr>
                )}
                {filteredDocs.map((doc, idx) => (
                  <tr key={doc.filename} className="bg-teal-50/30 hover:bg-teal-50 rounded-lg shadow-sm">
                    <td className="px-4 py-2 rounded-l-lg font-medium text-teal-900">{doc.filename}</td>
                    <td className="px-4 py-2">{new Date(doc.upload_date).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          doc.status === "ready"
                            ? "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700"
                            : doc.status === "processing"
                            ? "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700"
                            : "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700"
                        }
                      >
                        <span className="w-2 h-2 rounded-full inline-block bg-current"></span>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={doc.category}
                        onChange={(e) => toggleCategory(idx, e.target.value)}
                        className="border border-teal-200 rounded p-1 bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 rounded-r-lg">
                      <button
                        onClick={() => handleDelete(doc.filename)}
                        className="text-red-600 hover:text-red-800 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

