import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const apiE = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:777" });
apiE.interceptors.request.use((c) => {
    const t = localStorage.getItem("token");
    if (t) c.headers.Authorization = `Bearer ${t}`;
    return c;
});

export default function SkillEdit() {
    const { id } = useParams();
    const nav = useNavigate();
    const [form, setForm] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiE.get(`/skills/${id}`);
                setForm({ name: data.skill?.name || "", description: data.skill?.description || "" });
            } catch (e) {
                setErr(e?.response?.data?.error || "Failed to load skill");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        if (!form.name.trim()) return setErr("Name is required");
        try {
            await apiE.put(`/skills/${id}`, form);
            nav("/skills");
        } catch (e) {
            setErr(e?.response?.data?.error || "Failed to update skill");
        }
    };

    const del = async () => {
        if (!confirm("Delete this skill?")) return;
        try {
            await apiE.delete(`/skills/${id}`);
            nav("/skills");
        } catch (e) {
            setErr(e?.response?.data?.error || "Failed to delete skill");
        }
    };

    if (loading) return <div className="p-6">Loading…</div>;

    return (
        <div className="max-w-xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Edit Skill</h2>
                <Link className="text-sm text-gray-600 hover:underline" to="/skills">
                    Back
                </Link>
            </div>

            {err && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{err}</div>}

            <form onSubmit={submit} className="space-y-4 bg-white p-4 border rounded-lg">
                <div>
                    <label className="block text-sm mb-1">Name</label>
                    <input
                        className="w-full border px-3 py-2 rounded-md"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Description</label>
                    <textarea
                        className="w-full border px-3 py-2 rounded-md"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                    <button type="button" onClick={del} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </form>
        </div>
    );
}