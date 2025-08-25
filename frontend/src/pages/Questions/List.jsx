import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const apiQL = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiQL.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function QuestionList() {
  const [rows, setRows] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillId, setSkillId] = useState("");
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, q] = await Promise.all([
          apiQL.get("/skills"),
          apiQL.get("/questions"),
        ]);
        const skillsArr = Array.isArray(s.data) ? s.data : s.data.data || [];
        setSkills(skillsArr);
        setRows(q.data?.data || q.data || []);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refetch = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (skillId) params.skill_id = Number(skillId);
      if (search) params.search = search;
      const { data } = await apiQL.get("/questions", { params });
      setRows(data?.data || data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Questions (Admin)</h2>
        <Link to="/questions/new" className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          + New Question
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          className="border px-3 py-2 rounded-md"
          value={skillId}
          onChange={(e) => setSkillId(e.target.value)}
        >
          <option value="">All skills</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          className="border px-3 py-2 rounded-md"
          placeholder="Search question text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={refetch} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">
          Filter
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-600">No questions found.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Text</th>
                <th className="text-left p-3">Skill</th>
                <th className="text-left p-3">Difficulty</th>
                <th className="text-left p-3">Active</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="p-3">{q.id}</td>
                  <td className="p-3">{q.text}</td>
                  <td className="p-3">{q.skill_id}</td>
                  <td className="p-3">{q.difficulty}</td>
                  <td className="p-3">{q.is_active ? "Yes" : "No"}</td>
                  <td className="p-3 text-right">
                    <Link className="text-blue-600 hover:underline" to={`/questions/${q.id}/edit`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
