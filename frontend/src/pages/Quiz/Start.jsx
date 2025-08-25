import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiQS = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiQS.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function QuizStart() {
  const nav = useNavigate();
  const [skills, setSkills] = useState([]);
  const [skillId, setSkillId] = useState("");
  const [limit, setLimit] = useState(10);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await apiQS.get("/skills");
      setSkills(Array.isArray(data) ? data : data.data || []);
    })();
  }, []);

  const start = async (e) => {
    e.preventDefault();
    setErr("");
    if (!skillId) return setErr("Select a skill");
    setLoading(true);
    try {
      const { data } = await apiQS.post("/quizzes/start", { skill_id: Number(skillId), limit: Number(limit) });
      // navigate to take with returned attempt id and pass questions via state
      nav(`/quiz/take/${data.attempt.id}`, { state: { questions: data.questions } });
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Start a Quiz</h2>
      {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{err}</div>}
      <form onSubmit={start} className="space-y-4 bg-white p-4 border rounded-lg">
        <div>
          <label className="block text-sm mb-1">Skill</label>
          <select className="w-full border px-3 py-2 rounded-md" value={skillId} onChange={(e) => setSkillId(e.target.value)}>
            <option value="">Select skill…</option>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="hidden">
          <label className="block text-sm mb-1">Number of Questions</label>
          <input
            type="number"
            min={1}
            max={50}
            className="w-full border px-3 py-2 rounded-md"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={loading}>
          {loading ? "Starting…" : "Start"}
        </button>
      </form>
    </div>
  );
}
