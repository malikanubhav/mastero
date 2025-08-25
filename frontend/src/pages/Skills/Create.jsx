import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const apiC = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiC.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function SkillCreate() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim()) return setErr("Name is required");
    setLoading(true);
    try {
      await apiC.post("/skills/create-skill", form);
      nav("/skills");
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to create skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Create Skill</h2>
        <Link className="text-sm text-gray-600 hover:underline" to="/skills">
          Back
        </Link>
      </div>

      {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{err}</div>}

      <form onSubmit={submit} className="space-y-4 bg-white p-4 border rounded-lg">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="JavaScript"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded-md"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Core language for web development"
          />
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
