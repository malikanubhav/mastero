import { Op, fn, col, literal, where, cast } from "sequelize";
import { sequelize, User, Skill, QuizAttempt, QuizAnswer, Question } from "../../models/index.js";

const parseDate = (s) => (s ? new Date(s) : null);
const clampInt = (v, min, max, d) => {
    const n = Number.parseInt(v ?? d, 10);
    if (Number.isNaN(n)) return d;
    return Math.max(min, Math.min(n, max));
};

const buildTimeWhere = (start, end) => {
    const w = {};
    const startAt = parseDate(start);
    const endAt = parseDate(end);
    if (startAt && endAt) {
        w.started_at = { [Op.between]: [startAt, endAt] };
    } else if (startAt) {
        w.started_at = { [Op.gte]: startAt };
    } else if (endAt) {
        w.started_at = { [Op.lte]: endAt };
    }
    return w;
};


export const mySummary = async (req, res) => {
    try {
        const { start, end } = req.query || {};
        const timeWhere = buildTimeWhere(start, end);

        const stats = await QuizAttempt.findAll({
            where: { user_id: req.user.id, ...timeWhere },
            attributes: [
                [fn("COUNT", col("id")), "attempts"],
                [fn("SUM", col("score")), "total_score"],
                [fn("SUM", col("total_questions")), "total_questions"],
                [fn("AVG", col("score")), "avg_score"],
                [fn("AVG", col("duration_seconds")), "avg_duration_seconds"],
            ],
            raw: true,
        });

        const limit = clampInt(req.query.limit, 1, 50, 10);
        const recent = await QuizAttempt.findAll({
            where: { user_id: req.user.id, ...timeWhere },
            include: [{ model: Skill, attributes: ["id", "name"] }],
            order: [["id", "DESC"]],
            limit,
        });

        return res.json({
            window: { start: start || null, end: end || null },
            summary: stats?.[0] ?? {},
            recent,
        });
    } catch (err) {
        console.error("mySummary error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const mySkillGaps = async (req, res) => {
    try {
        const { start, end } = req.query || {};
        const timeWhere = buildTimeWhere(start, end);

        const rows = await QuizAttempt.findAll({
            where: { user_id: req.user.id, ...timeWhere },
            attributes: [
                "skill_id",
                [fn("AVG", col("score")), "avg_score"],
                [fn("AVG", literal("score / NULLIF(total_questions,0)")), "avg_pct"],
                [fn("COUNT", col("QuizAttempt.id")), "attempts"],
            ],
            include: [{ model: Skill, attributes: ["name"] }],
            group: ["skill_id", "QuizAttempt.id"],
            order: [[literal("avg_pct"), "ASC"]],
            raw: true,
        });

        return res.json({
            window: { start: start || null, end: end || null },
            skills: rows.map((r) => ({
                skill_id: r.skill_id,
                skill_name: r["Skill.name"],
                avg_score: Number(r.avg_score ?? 0),
                avg_pct: Number(r.avg_pct ?? 0),
                attempts: Number(r.attempts ?? 0),
            })),
        });
    } catch (err) {
        console.error("mySkillGaps error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


export const adminUserReport = async (req, res) => {
    try {
        const { start, end } = req.query || {};
        const page = clampInt(req.query.page, 1, 100000, 1);
        const limit = clampInt(req.query.limit, 1, 100, 20);
        const offset = (page - 1) * limit;
        const timeWhere = buildTimeWhere(start, end);

        const rows = await QuizAttempt.findAll({
            where: { ...timeWhere },
            attributes: [
                "user_id",
                [fn("COUNT", col("QuizAttempt.id")), "attempts"],
                [fn("SUM", col("score")), "total_score"],
                [fn("SUM", col("total_questions")), "total_questions"],
                [fn("AVG", col("score")), "avg_score"],
                [fn("AVG", literal("score / NULLIF(total_questions,0)")), "avg_pct"],
            ],
            include: [{ model: User, attributes: ["name", "email", "role"] }],
            group: ["user_id", "User.id"],
            order: [[literal("avg_pct"), "DESC"]],
            limit,
            offset,
            raw: true,
        });

        const totalUsers = await QuizAttempt.count({
            where: { ...timeWhere },
            distinct: true,
            col: "user_id",
        });

        return res.json({
            window: { start: start || null, end: end || null },
            page,
            limit,
            totalUsers,
            data: rows.map((r) => ({
                user_id: r.user_id,
                name: r["User.name"],
                email: r["User.email"],
                role: r["User.role"],
                attempts: Number(r.attempts ?? 0),
                avg_score: Number(r.avg_score ?? 0),
                avg_pct: Number(r.avg_pct ?? 0),
                total_score: Number(r.total_score ?? 0),
                total_questions: Number(r.total_questions ?? 0),
            })),
        });
    } catch (err) {
        console.error("adminUserReport error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
