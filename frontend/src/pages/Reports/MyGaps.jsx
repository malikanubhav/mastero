import { useEffect, useState } from "react";
import {api} from "../../utils/api.jsx"; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";

export default function MyGaps() {
  const [data, setData] = useState([]);
  const [start, setStart] = useState(""); 
  const [end, setEnd] = useState("");

  const fetchData = async () => {
    const params = {};
    if (start) params.start = start;
    if (end) params.end = end;
    const { data } = await api.get("/reports/me/skill-gaps", { params });
    const mapped = (data?.skills || []).map(s => ({
      skill: s.skill_name,
      avgPct: Math.round((Number(s.avg_pct || 0)) * 100) / 100, // already fraction? if 0-1, scale *100
    }));
    setData(mapped);
  };

  useEffect(() => { fetchData(); }, []);

  const submit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">My Skill Gaps</h2>
        <p className="text-gray-600">Lower % means weaker skills. Use the date range to filter.</p>
      </div>

      <form onSubmit={submit} className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Start</label>
          <input type="date" value={start} onChange={(e)=>setStart(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">End</label>
          <input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
      </form>

      <div className="bg-white border rounded-xl p-4 h-96">
        {data.length === 0 ? (
          <div className="text-gray-600">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" angle={-20} textAnchor="end" interval={0} height={60} />
              <YAxis />
              <Tooltip formatter={(v)=>`${v}%`} />
              <Bar dataKey="avgPct" name="Avg % Correct">
                <LabelList dataKey="avgPct" position="top" formatter={(v)=>`${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
