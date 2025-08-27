import { Op } from "sequelize";
import { sequelize, Skill, Question, QuizAttempt, QuizAnswer} from "../../models/index.js";

const isInt = (v) => Number.isInteger(Number(v));


export const startQuiz = async (req, res) => {
    try {
        const { skill_id, limit } = req.body ?? {};
        if (!isInt(skill_id)) {
            return res.status(400).json({ error: "skill_id must be an integer" });
        }

        const skill = await Skill.findByPk(Number(skill_id));
        if (!skill) return res.status(404).json({ error: "Skill not found" });

        const questions = await Question.findAll({
            where: { skill_id: Number(skill_id), is_active: true },
            order: [["id", "ASC"]],
            limit: 10,
            attributes: ["id", "text", "options"], // do NOT send correct_index here
        });

        if (questions.length === 0) {
            return res.status(400).json({ error: "No active questions for this skill" });
        }

        const attempt = await QuizAttempt.create({
            user_id: req.user.id,
            skill_id: Number(skill_id),
            status: "in_progress",
            score: 0,
            total_questions: questions.length,
            started_at: new Date(),
            duration_seconds: 0,
        });

        return res.status(201).json({
            message: "Quiz started",
            attempt: {
                id: attempt.id,
                skill_id: attempt.skill_id,
                started_at: attempt.started_at,
                total_questions: attempt.total_questions,
                status: attempt.status,
            },
            questions,
        });
    } catch (err) {
        console.error("startQuiz error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


export const submitQuiz = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { attemptId } = req.params;
        const body = req.body ?? {};
        const answers = Array.isArray(body.answers) ? body.answers : [];

        if (!isInt(attemptId)) {
            await t.rollback();
            return res.status(400).json({ error: "attemptId must be an integer" });
        }
        if (answers.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: "answers array required" });
        }

        const attempt = await QuizAttempt.findByPk(Number(attemptId), { transaction: t });
        if (!attempt) {
            await t.rollback();
            return res.status(404).json({ error: "Attempt not found" });
        }
        if (attempt.user_id !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ error: "Not your attempt" });
        }
        if (attempt.status !== "in_progress") {
            await t.rollback();
            return res.status(400).json({ error: "Attempt already submitted" });
        }

        const qids = answers
            .map((a) => Number(a.question_id))
            .filter((id) => Number.isInteger(id));

        if (qids.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: "answers are malformed" });
        }

        const qs = await Question.findAll({
            where: { id: { [Op.in]: qids } },
            transaction: t,
        });

        const qMap = new Map(qs.map((q) => [q.id, q]));

        let score = 0;
        const answerRows = [];

        for (const a of answers) {
            const qid = Number(a.question_id);
            const selectedIndex = Number(a.selected_index);

            const q = qMap.get(qid);
            if (!q) {
                await t.rollback();
                return res.status(400).json({ error: `Question ${qid} not found` });
            }
            if (q.skill_id !== attempt.skill_id) {
                await t.rollback();
                return res.status(400).json({ error: `Question ${qid} does not belong to this skill` });
            }
            if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= q.options.length) {
                await t.rollback();
                return res.status(400).json({ error: `selected_index out of range for question ${qid}` });
            }

            const isCorrect = selectedIndex === q.correct_index;
            if (isCorrect) score += 1;

            answerRows.push({
                quiz_attempt_id: attempt.id,
                question_id: qid,
                selected_index: selectedIndex,
                is_correct: isCorrect,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        await QuizAnswer.bulkCreate(answerRows, { transaction: t });

        const completedAt = new Date();
        const durationSeconds = Math.max(
            0,
            Math.floor((completedAt.getTime() - new Date(attempt.started_at).getTime()) / 1000)
        );

        attempt.status = "submitted";
        attempt.score = score;
        attempt.completed_at = completedAt;
        attempt.duration_seconds = durationSeconds;

        await attempt.save({ transaction: t });

        await t.commit();

        return res.json({
            message: "Quiz submitted",
            result: {
                attempt_id: attempt.id,
                score,
                total_questions: attempt.total_questions,
                completed_at: attempt.completed_at,
                duration_seconds: attempt.duration_seconds,
            },
        });
    } catch (err) {
        console.error("submitQuiz error:", err);
        await t.rollback();
        return res.status(500).json({ error: "Server error" });
    }
};


export const listMyQuizzes = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit ?? "10", 10), 1), 100);
        const offset = (page - 1) * limit;

        const { rows, count } = await QuizAttempt.findAndCountAll({
            where: { user_id: req.user.id },
            order: [["id", "DESC"]],
            limit,
            offset,
        });

        return res.json({
            data: rows,
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        console.error("listMyQuizzes error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


export const getQuizDetail = async (req, res) => {
    try {
        const { attemptId } = req.params;
        if (!isInt(attemptId)) return res.status(400).json({ error: "attemptId must be an integer" });

        const attempt = await QuizAttempt.findByPk(Number(attemptId));
        if (!attempt) return res.status(404).json({ error: "Attempt not found" });
        if (attempt.user_id !== req.user.id) {
            return res.status(403).json({ error: "Not your attempt" });
        }

        const answers = await QuizAnswer.findAll({
            where: { quiz_attempt_id: attempt.id },
            order: [["id", "ASC"]],
        });

        const qids = answers.map((a) => a.question_id);
        const questions = await Question.findAll({
            where: { id: { [Op.in]: qids } },
            attributes: ["id", "text", "options", "correct_index", "skill_id"],
        });
        const qMap = new Map(questions.map((q) => [q.id, q]));

        const details = answers.map((a) => {
            const q = qMap.get(a.question_id);
            return {
                question_id: a.question_id,
                text: q?.text,
                options: q?.options,
                correct_index: q?.correct_index,
                selected_index: a.selected_index,
                is_correct: a.is_correct,
            };
        });

        return res.json({
            attempt: {
                id: attempt.id,
                skill_id: attempt.skill_id,
                status: attempt.status,
                score: attempt.score,
                total_questions: attempt.total_questions,
                started_at: attempt.started_at,
                completed_at: attempt.completed_at,
                duration_seconds: attempt.duration_seconds,
            },
            answers: details,
        });
    } catch (err) {
        console.error("getQuizDetail error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
