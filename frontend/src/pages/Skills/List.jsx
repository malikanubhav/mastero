
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function SkillList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get("/skills", q ? { params: { search: q } } : undefined);
        setRows(Array.isArray(data) ? data : data.data || []);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load skills");
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Skills</h2>
        <Link className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" to="/skills/new">
          + New Skill
        </Link>
      </div>

      <div className="mb-4">
        <input
          className="w-full max-w-md border px-3 py-2 rounded-md"
          placeholder="Search skills..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-600">No skills found.</div>
      ) : (
        <ul className="divide-y border rounded-lg bg-white">
          {rows.map((s) => (
            <li key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                {s.description ? <div className="text-sm text-gray-600">{s.description}</div> : null}
              </div>
              <Link to={`/skills/${s.id}/edit`} className="text-blue-600 hover:underline text-sm">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
