import { useEffect, useState } from "react";
import axios from "axios";

const apiRS = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiRS.interceptors.request.use((c) => {
    const t = localStorage.getItem("token");
    if (t) c.headers.Authorization = `Bearer ${t}`;
    return c;
});

export default function MySummary() {
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiRS.get("/reports/me/summary");
                setData(data);
            } catch (e) {
                setErr(e?.response?.data?.error || "Failed to load");
            }
        })();
    }, []);

    if (err) return <div className="p-6 text-red-600">{err}</div>;
    if (!data) return <div className="p-6">Loading…</div>;

    const s = data.summary || {};
    const recent = data.recent || [];

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">My Summary</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Stat label="Attempts" value={num(s.attempts)} />
                <Stat label="Total Score" value={num(s.total_score)} />
                <Stat label="Total Questions" value={num(s.total_questions)} />
                <Stat label="Avg Score" value={fix(s.avg_score)} />
            </div>

            <h3 className="text-lg font-semibold mb-2">Recent Attempts</h3>
            {recent.length === 0 ? (
                <div className="text-gray-600">No attempts yet.</div>
            ) : (
                <div className="overflow-x-auto border rounded-lg bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-3">ID</th>
                                <th className="text-left p-3">Skill</th>
                                <th className="text-left p-3">Score</th>
                                <th className="text-left p-3">Questions</th>
                                <th className="text-left p-3">Duration (s)</th>
                                <th className="text-left p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((r) => (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3">{r.id}</td>
                                    <td className="p-3">{r.Skill?.name || r.skill_id}</td>
                                    <td className="p-3">{r.score}</td>
                                    <td className="p-3">{r.total_questions}</td>
                                    <td className="p-3">{r.duration_seconds}</td>
                                    <td className="p-3">{r.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fix = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};