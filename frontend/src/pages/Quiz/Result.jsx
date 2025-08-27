import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

const apiQR = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiQR.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function QuizResult() {
  const { attemptId } = useParams();
  const loc = useLocation();
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // If result not passed via state, fetch full detail
        if (!loc.state?.result) {
          const { data } = await apiQR.get(`/quizzes/${attemptId}`);
          setDetail(data);
        } else {
          // Fetch full detail anyway to show per-question breakdown
          const { data } = await apiQR.get(`/quizzes/${attemptId}`);
          setDetail(data);
        }
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load result");
      }
    })();
  }, [attemptId, loc.state]);

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!detail) return <div className="p-6">Loading…</div>;

  const a = detail.attempt || {};
  const answers = detail.answers || [];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Quiz Result</h2>
      <div className="text-gray-700 mb-4">
        Score: <strong>{a.score}</strong> / {a.total_questions} &nbsp;|&nbsp; Duration:{" "}
        <strong>{a.duration_seconds}s</strong>
      </div>

      <div className="space-y-4">
        {answers.map((x, i) => (
          <div key={i} className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Q{i + 1}</div>
            <div className="font-medium mb-2">{x.text}</div>
            <div className="space-y-1">
              {x.options.map((opt, idx) => {
                const isCorrect = idx === x.correct_index;
                const isChosen = idx === x.selected_index;
                return (
                  <div
                    key={idx}
                    className={[
                      "px-3 py-2 rounded-md border",
                      isCorrect ? "border-green-500 bg-green-50" : "border-gray-200",
                      isChosen && !isCorrect ? "border-red-500 bg-red-50" : "",
                    ].join(" ")}
                  >
                    {opt}
                    {isCorrect ? <span className="ml-2 text-green-700 text-xs">(correct)</span> : null}
                    {isChosen && !isCorrect ? <span className="ml-2 text-red-700 text-xs">(your answer)</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
