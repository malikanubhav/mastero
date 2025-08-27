import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./auth/login";
import Register from "./auth/register";
import Protected from "./auth/Protected";
import Dashboard from "./pages/Dashboard";
import SkillList from "./pages/Skills/List";
import SkillCreate from "./pages/Skills/Create";
import SkillEdit from "./pages/Skills/Edit";
import QuestionList from "./pages/Questions/List";
import QuestionCreate from "./pages/Questions/Create";
import QuestionEdit from "./pages/Questions/Edit";
import QuizStart from "./pages/Quiz/Start";
import QuizTake from "./pages/Quiz/Take";
import QuizResult from "./pages/Quiz/Result";
import MySummary from "./pages/Reports/MySummary";
import MyGaps from "./pages/Reports/MyGaps";
import AdminUsers from "./pages/Reports/AdminUsers";

function Nav() {
  const nav = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem("token") || "");
      try { setUser(JSON.parse(localStorage.getItem("user") || "null")); } catch { setUser(null); }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAuthed = Boolean(token);
  const isAdmin = isAuthed && user?.role === "admin";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    nav("/login");
  };

  return (
    <nav className="flex items-center gap-3 px-3 py-2 border-b bg-white">
      <Link to="/" className="font-semibold">Home</Link>

      {isAuthed && (
        <>
          <Link to="/skills" className="text-gray-700 hover:text-blue-600">Skills</Link>
          <Link to="/quiz/start" className="text-gray-700 hover:text-blue-600">Start Quiz</Link>
          <Link to="/reports/me" className="text-gray-700 hover:text-blue-600">My Summary</Link>
          <Link to="/reports/gaps" className="text-gray-700 hover:text-blue-600">My Gaps</Link>
        </>
      )}

      {isAdmin && (
        <>
          <Link to="/questions" className="text-gray-700 hover:text-blue-600">Questions</Link>
          <Link to="/admin/users" className="text-gray-700 hover:text-blue-600">Admin Users</Link>
        </>
      )}

      <div className="ml-auto flex items-center gap-3">
        {!isAuthed ? (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-600">
              {user?.name ? `Hi, ${user.name}` : "Signed in"}{isAdmin ? " (admin)" : ""}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />

      <Routes>
        <Route path="/" element={<Protected><Dashboard/></Protected>} />

        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />

        <Route path="/skills" element={<Protected><SkillList/></Protected>} />
        <Route path="/skills/new" element={<Protected role="admin"><SkillCreate/></Protected>} />
        <Route path="/skills/:id/edit" element={<Protected role="admin"><SkillEdit/></Protected>} />

        <Route path="/questions" element={<Protected role="admin"><QuestionList/></Protected>} />
        <Route path="/questions/new" element={<Protected role="admin"><QuestionCreate/></Protected>} />
        <Route path="/questions/:id/edit" element={<Protected role="admin"><QuestionEdit/></Protected>} />

        <Route path="/quiz/start" element={<Protected><QuizStart/></Protected>} />
        <Route path="/quiz/take/:attemptId" element={<Protected><QuizTake/></Protected>} />
        <Route path="/quiz/result/:attemptId" element={<Protected><QuizResult/></Protected>} />

        <Route path="/reports/me" element={<Protected><MySummary/></Protected>} />
        <Route path="/reports/gaps" element={<Protected><MyGaps/></Protected>} />
        <Route path="/admin/users" element={<Protected role="admin"><AdminUsers/></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}
