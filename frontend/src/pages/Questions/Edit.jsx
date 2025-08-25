import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const apiQE = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiQE.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function QuestionEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    text: "",
    skill_id: "",
    options: [],
    correct_index: 0,
    difficulty: "medium",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, q] = await Promise.all([
          apiQE.get("/skills"),
          apiQE.get(`/questions/${id}`),
        ]);
        const skillsArr = Array.isArray(s.data) ? s.data : s.data.data || [];
        setSkills(skillsArr);
        const qu = q.data?.question;
        setForm({
          text: qu?.text || "",
          skill_id: qu?.skill_id || "",
          options: qu?.options || [],
          correct_index: qu?.correct_index || 0,
          difficulty: qu?.difficulty || "medium",
          is_active: !!qu?.is_active,
        });
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load question");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const setOption = (i, v) => {
    const opts = [...form.options];
    opts[i] = v;
    setForm({ ...form, options: opts });
  };
  const addOption = () => setForm({ ...form, options: [...form.options, ""] });
  const removeOption = (i) => {
    const opts = form.options.filter((_, idx) => idx !== i);
    let ci = form.correct_index;
    if (ci >= opts.length) ci = Math.max(0, opts.length - 1);
    setForm({ ...form, options: opts, correct_index: ci });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.text.trim()) return setErr("Question text is required");
    if (!form.skill_id) return setErr("Select a skill");
    if (form.options.some((o) => !o.trim())) return setErr("Options cannot be empty");
    if (form.options.length < 2) return setErr("At least two options required");
    try {
      await apiQE.put(`/questions/${id}`, {
        ...form,
        skill_id: Number(form.skill_id),
        correct_index: Number(form.correct_index),
      });
      nav("/questions");
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to update question");
    }
  };

  const del = async () => {
    if (!confirm("Delete this question?")) return;
    try {
      await apiQE.delete(`/questions/${id}`);
      nav("/questions");
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to delete question");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Edit Question</h2>
        <Link to="/questions" className="text-sm text-gray-600 hover:underline">Back</Link>
      </div>

      {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{err}</div>}

      <form onSubmit={submit} className="space-y-4 bg-white p-4 border rounded-lg">
        <div>
          <label className="block text-sm mb-1">Skill</label>
          <select
            className="w-full border px-3 py-2 rounded-md"
            value={form.skill_id}
            onChange={(e) => setForm({ ...form, skill_id: e.target.value })}
          >
            <option value="">Select skill…</option>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Question</label>
          <textarea
            className="w-full border px-3 py-2 rounded-md"
            rows={3}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Options</label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 border px-3 py-2 rounded-md"
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                />
                <input
                  type="radio"
                  name="correct"
                  checked={form.correct_index === i}
                  onChange={() => setForm({ ...form, correct_index: i })}
                  className="mt-2"
                />
                {form.options.length > 2 && (
                  <button type="button" className="px-2 bg-red-100 rounded-md" onClick={() => removeOption(i)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="mt-2 px-3 py-1.5 bg-gray-100 rounded-md" onClick={addOption}>
            + Add option
          </button>
        </div>

        <div className="flex gap-3">
          <div>
            <label className="block text-sm mb-1">Difficulty</label>
            <select
              className="border px-3 py-2 rounded-md"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option>easy</option>
              <option>medium</option>
              <option>hard</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span className="text-sm">Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
          <button type="button" onClick={del} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
