import { useEffect, useState } from "react";
import axios from "axios";

const apiRA = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiRA.interceptors.request.use((c) => {
    const t = localStorage.getItem("token");
    if (t) c.headers.Authorization = `Bearer ${t}`;
    return c;
});

export default function AdminUsers() {
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [err, setErr] = useState("");

    const fetchIt = async (p = page) => {
        try {
            const { data } = await apiRA.get("/reports/admin/users", { params: { page: p, limit } });
            setRows(data.data || []);
            setTotal(data.totalUsers || 0);
            setPage(data.page || p);
        } catch (e) {
            setErr(e?.response?.data?.error || "Failed to load");
        }
    };

    useEffect(() => {
        fetchIt(1);
    }, []);

    const canPrev = page > 1;
    const canNext = rows.length === limit && page * limit < total;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Admin: Users Report</h2>
            {err && <div className="text-red-600 mb-2">{err}</div>}

            <div className="overflow-x-auto border rounded-lg bg-white mb-3">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3">User</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Role</th>
                            <th className="text-left p-3">Attempts</th>
                            <th className="text-left p-3">Avg Score</th>
                            <th className="text-left p-3">Avg %</th>
                            <th className="text-left p-3">Total Score</th>
                            <th className="text-left p-3">Total Qs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} className="border-t">
                                <td className="p-3">{r.name}</td>
                                <td className="p-3">{r.email}</td>
                                <td className="p-3">{r.role}</td>
                                <td className="p-3">{r.attempts}</td>
                                <td className="p-3">{Number(r.avg_score || 0).toFixed(2)}</td>
                                <td className="p-3">{Number(r.avg_pct || 0).toFixed(2)}</td>
                                <td className="p-3">{r.total_score}</td>
                                <td className="p-3">{r.total_questions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-2">
                <button
                    className="px-3 py-1.5 bg-gray-100 rounded-md disabled:bg-gray-200"
                    disabled={!canPrev}
                    onClick={() => fetchIt(page - 1)}
                >
                    Prev
                </button>
                <div className="text-sm">Page {page}</div>
                <button
                    className="px-3 py-1.5 bg-gray-100 rounded-md disabled:bg-gray-200"
                    disabled={!canNext}
                    onClick={() => fetchIt(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}