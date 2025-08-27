import { useEffect, useState } from "react";
import {api} from "../../utils/api.jsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

export default function MySummary() {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        (async () => {
            const { data } = await api.get("/reports/me/summary");
            setSummary(data?.summary || null);
        })();
    }, []);

    if (!summary) {
        return <div className="p-6">Loading…</div>;
    }

    const chartData = [
        { name: "Attempts", value: Number(summary.attempts || 0) },
        { name: "Total Questions", value: Number(summary.total_questions || 0) },
        { name: "Total Score", value: Number(summary.total_score || 0) },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">My Summary</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-xl p-4 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                label
                                outerRadius="80%"
                            >
                                {chartData.map((_, idx) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white border rounded-xl p-4">
                    <div className="text-sm text-gray-600">Totals</div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        <Stat label="Attempts" value={summary.attempts} />
                        <Stat label="Total Questions" value={summary.total_questions} />
                        <Stat label="Total Score" value={summary.total_score} />
                        <Stat label="Avg Score" value={Number(summary.avg_score || 0).toFixed(2)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-gray-50 border rounded-lg p-4">
            <div className="text-gray-500 text-sm">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
        </div>
    );
}
