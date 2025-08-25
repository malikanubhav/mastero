import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const apiQT = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiQT.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function QuizTake() {
  const { attemptId } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const questions = useMemo(() => loc.state?.questions || [], [loc.state]);
  const [answers, setAnswers] = useState({});
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If user refreshes and we lost questions, we can fetch detail later; for now, send them back to start.
    if (!questions || questions.length === 0) {
      nav("/quiz/start");
    }
  }, [questions, nav]);

  const choose = (qid, idx) => setAnswers({ ...answers, [qid]: idx });

  const submit = async () => {
    setErr("");
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([qid, idx]) => ({
          question_id: Number(qid),
          selected_index: Number(idx),
        })),
      };
      const { data } = await apiQT.post(`/quizzes/${attemptId}/submit`, payload);
      nav(`/quiz/result/${attemptId}`, { state: { result: data?.result } });
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Take Quiz</h2>
      {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{err}</div>}

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Q{idx + 1}</div>
            <div className="font-medium mb-2">{q.text}</div>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === i}
                    onChange={() => choose(q.id, i)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={submit}
          disabled={submitting || Object.keys(answers).length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}