import { Op } from "sequelize";
import { Question, Skill } from "../../models/index.js";

const nonEmpty = (s) => typeof s === "string" && s.trim().length > 0;
const isArray = (v) => Array.isArray(v);
const inRange = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
const allowedDifficulties = new Set(["easy", "medium", "hard"]);


async function validatePayload(payload, { requireAll = true } = {}) {
    const errors = [];

    if (requireAll || payload.text !== undefined) {
        if (!nonEmpty(payload.text)) errors.push({ field: "text", msg: "text is required" });
    }

    if (requireAll || payload.skill_id !== undefined) {
        const sid = Number(payload.skill_id);
        if (!Number.isInteger(sid) || sid <= 0) {
            errors.push({ field: "skill_id", msg: "skill_id must be a positive integer" });
        } else {
            const skill = await Skill.findByPk(sid);
            if (!skill) errors.push({ field: "skill_id", msg: "skill not found" });
        }
    }

    if (requireAll || payload.options !== undefined) {
        if (!isArray(payload.options)) {
            errors.push({ field: "options", msg: "options must be an array" });
        } else {
            const opts = payload.options.filter((x) => typeof x === "string").map((s) => s.trim());
            if (opts.length !== payload.options.length) {
                errors.push({ field: "options", msg: "options must be strings" });
            } else if (opts.some((s) => s.length === 0)) {
                errors.push({ field: "options", msg: "options cannot contain empty strings" });
            } else if (opts.length < 2 || opts.length > 10) {
                errors.push({ field: "options", msg: "options length must be between 2 and 10" });
            }
        }
    }

    if (requireAll || payload.correct_index !== undefined) {
        const ci = Number(payload.correct_index);
        if (!Number.isInteger(ci)) {
            errors.push({ field: "correct_index", msg: "correct_index must be an integer" });
        } else if (isArray(payload.options)) {
            if (!inRange(ci, 0, payload.options.length - 1)) {
                errors.push({ field: "correct_index", msg: "correct_index out of range" });
            }
        }
    }

    if (payload.difficulty !== undefined) {
        if (!allowedDifficulties.has(String(payload.difficulty))) {
            errors.push({ field: "difficulty", msg: "difficulty must be easy|medium|hard" });
        }
    }

    if (payload.is_active !== undefined && typeof payload.is_active !== "boolean") {
        errors.push({ field: "is_active", msg: "is_active must be boolean" });
    }

    return errors;
}

export const createQuestion = async (req, res) => {
    try {
        const body = req.body;

        const errors = await validatePayload(body, { requireAll: true });
        if (errors.length) return res.status(400).json({ error: "Validation failed", errors });

        const question = await Question.create({
            text: body.text.trim(),
            skill_id: Number(body.skill_id),
            options: body.options.map((s) => s.trim()),
            correct_index: Number(body.correct_index),
            difficulty: body.difficulty,
            is_active: body.is_active,
        });

        return res.status(201).json({ message: "Question created", question });
    } catch (err) {
        console.error("createQuestion error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const listQuestions = async (req, res) => {
    try {
        const skill_id = req.query.skill_id ? Number(req.query.skill_id) : undefined;
        const search = (req.query.search || "").trim();

        const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit ?? "10", 10), 1), 100);
        const offset = (page - 1) * limit;

        const where = {};
        if (Number.isInteger(skill_id)) where.skill_id = skill_id;
        if (search) where.text = { [Op.like]: `%${search}%` };

        const { rows, count } = await Question.findAndCountAll({
            where,
            order: [["id", "DESC"]],
            limit,
            offset,
        });

        return res.json({ data: rows });
    } catch (err) {
        console.error("listQuestions error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const q = await Question.findByPk(id);
        if (!q) return res.status(404).json({ error: "Question not found" });
        return res.json({ question: q });
    } catch (err) {
        console.error("getQuestion error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const q = await Question.findByPk(id);
        if (!q) return res.status(404).json({ error: "Question not found" });

        const body = req.body;

        const errors = await validatePayload(
            {
                text: body.text !== undefined ? body.text : q.text,
                skill_id: body.skill_id !== undefined ? body.skill_id : q.skill_id,
                options: body.options !== undefined ? body.options : q.options,
                correct_index:
                    body.correct_index !== undefined ? body.correct_index : q.correct_index,
                difficulty: body.difficulty !== undefined ? body.difficulty : q.difficulty,
                is_active: body.is_active !== undefined ? body.is_active : q.is_active,
            },
            { requireAll: true }
        );
        if (errors.length) return res.status(400).json({ error: "Validation failed", errors });

        if (body.text !== undefined) q.text = String(body.text).trim();
        if (body.skill_id !== undefined) q.skill_id = Number(body.skill_id);
        if (body.options !== undefined) q.options = body.options.map((s) => String(s).trim());
        if (body.correct_index !== undefined) q.correct_index = Number(body.correct_index);
        if (body.difficulty !== undefined) q.difficulty = String(body.difficulty);
        if (body.is_active !== undefined) q.is_active = Boolean(body.is_active);

        await q.save();
        return res.json({ message: "Question updated", question: q });
    } catch (err) {
        console.error("updateQuestion error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const q = await Question.findByPk(id);
        if (!q) return res.status(404).json({ error: "Question not found" });

        await q.destroy();
        return res.json({ message: "Question deleted" });
    } catch (err) {
        console.error("deleteQuestion error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};