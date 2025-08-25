import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const apiQC = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiQC.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function QuestionCreate() {
  const nav = useNavigate();
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    text: "",
    skill_id: "",
    options: ["", ""],
    correct_index: 0,
    difficulty: "medium",
    is_active: true,
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await apiQC.get("/skills");
      setSkills(Array.isArray(data) ? data : data.data || []);
    })();
  }, []);

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
    setLoading(true);
    try {
      await apiQC.post("/questions", {
        ...form,
        skill_id: Number(form.skill_id),
        correct_index: Number(form.correct_index),
      });
      nav("/questions");
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Create Question</h2>
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
                  placeholder={`Option ${i + 1}`}
                />
                <input
                  type="radio"
                  name="correct"
                  checked={form.correct_index === i}
                  onChange={() => setForm({ ...form, correct_index: i })}
                  className="mt-2"
                  title="Mark as correct"
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

