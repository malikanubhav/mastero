import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:777",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Dashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/reports/me/summary");
        setSummary(data?.summary || {});
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load summary");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href="/login";
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {user ? `Welcome, ${user.name}!` : "Welcome!"}
          </h2>
          <p className="text-gray-600">Choose an action to get started.</p>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          title="Start a Quiz"
          desc="Pick a skill and begin a timed multiple-choice quiz."
          to="/quiz/start"
          cta="Start"
        />
        <Card
          title="View My Summary"
          desc="See recent attempts, average score, and trends."
          to="/reports/me"
          cta="Open"
        />
        <Card
          title="My Skill Gaps"
          desc="Find weaker skills by average % correct."
          to="/reports/gaps"
          cta="Analyze"
        />
        <Card
          title="Skills"
          desc="Browse available skills (admin can add/edit)."
          to="/skills"
          cta="Manage"
        />
        {isAdmin && (
          <Card
            title="Questions"
            desc="Admin-only: create and edit MCQ questions."
            to="/questions"
            cta="Open"
          />
        )}
        {isAdmin && (
          <Card
            title="Admin: Users Report"
            desc="Aggregate performance across users."
            to="/admin/users"
            cta="View"
          />
        )}
      </div>

      <section className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
        {loading ? (
          <div className="text-gray-600">Loading summary…</div>
        ) : err ? (
          <div className="text-red-600 text-sm">{err}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Attempts" value={toNum(summary?.attempts)} />
            <Stat label="Total Score" value={toNum(summary?.total_score)} />
            <Stat label="Total Questions" value={toNum(summary?.total_questions)} />
            <Stat label="Avg Score" value={formatNumber(summary?.avg_score)} />
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ title, desc, to, cta }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col">
      <h4 className="text-base font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-600 flex-1">{desc}</p>
      <Link
        to={to}
        className="mt-3 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
      >
        {cta}
      </Link>
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

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function formatNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2);
}
