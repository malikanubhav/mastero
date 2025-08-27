import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {api} from "../../utils/api.jsx";

export default function SkillList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    const { data } = await api.get("/skills", { params: { page, limit, search } });
    setRows(data?.data || []);
    setTotalPages(data?.totalPages || 1);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const apply = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Skills</h2>
        <Link to="/skills/new" className="bg-blue-600 text-white px-3 py-2 rounded">New Skill</Link>
      </div>

      <form onSubmit={apply} className="flex gap-3 mb-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search by name…"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
        <button className="bg-gray-800 text-white px-3 py-2 rounded">Search</button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b">Name</th>
              <th className="text-left p-3 border-b">Description</th>
              <th className="text-right p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.description}</td>
                <td className="p-3 text-right">
                  <Link to={`/skills/${s.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="p-4 text-gray-600" colSpan={3}>No skills found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={limit}
            onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
}
