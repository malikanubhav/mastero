import { useEffect, useState } from "react";
import axios from "axios";

const apiRG = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiRG.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function MyGaps() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiRG.get("/reports/me/skill-gaps");
        setRows(data.skills || []);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load");
      }
    })();
  }, []);

  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Skill Gaps</h2>
      {rows.length === 0 ? (
        <div className="text-gray-600">No data yet.</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Skill</th>
                <th className="text-left p-3">Attempts</th>
                <th className="text-left p-3">Avg Score</th>
                <th className="text-left p-3">Avg %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.skill_id} className="border-t">
                  <td className="p-3">{r.skill_name}</td>
                  <td className="p-3">{r.attempts}</td>
                  <td className="p-3">{r.avg_score}</td>
                  <td className="p-3">{(Number(r.avg_pct || 0) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}