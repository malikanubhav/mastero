import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {api} from "../../utils/api.jsx";

export default function QuestionList() {
  const [rows, setRows] = useState([]);
  const [skills, setSkills] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [skillId, setSkillId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [active, setActive] = useState("");

  const fetchSkills = async () => {
    const { data } = await api.get("/skills", { params: { page: 1, limit: 1000 } });
    setSkills(data?.data || []);
  };

  const fetchQuestions = async () => {
    const params = { page, limit };
    if (search) params.search = search;
    if (skillId) params.skill_id = skillId;
    if (difficulty) params.difficulty = difficulty;
    if (active) params.active = active;

    const { data } = await api.get("/questions", { params });
    setRows(data?.data || []);
    setTotalPages(data?.totalPages || 1);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [page, limit]);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Questions</h2>
        <Link className="bg-blue-600 text-white px-3 py-2 rounded" to="/questions/new">New Question</Link>
      </div>

      <form onSubmit={applyFilters} className="grid md:grid-cols-5 gap-3 bg-white border rounded-xl p-4 mb-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search text…"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
        <select className="border rounded px-3 py-2" value={skillId} onChange={(e)=>setSkillId(e.target.value)}>
          <option value="">All skills</option>
          {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select className="border rounded px-3 py-2" value={active} onChange={(e)=>setActive(e.target.value)}>
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button className="bg-gray-800 text-white rounded px-3 py-2">Apply</button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b">Text</th>
              <th className="text-left p-3 border-b">Skill</th>
              <th className="text-left p-3 border-b">Difficulty</th>
              <th className="text-left p-3 border-b">Active</th>
              <th className="text-right p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(q => (
              <tr key={q.id} className="border-b last:border-0">
                <td className="p-3">{q.text}</td>
                <td className="p-3">{q.Skill?.name || q.skill_id}</td>
                <td className="p-3 capitalize">{q.difficulty}</td>
                <td className="p-3">{q.is_active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <Link to={`/questions/${q.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-4 text-gray-600" colSpan={5}>No questions found.</td></tr>
            )}
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
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={()=>setPage(p=>Math.max(1,p-1))}
            disabled={page<=1}
          >Prev</button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
            disabled={page>=totalPages}
          >Next</button>
        </div>
      </div>
    </div>
  );
}
