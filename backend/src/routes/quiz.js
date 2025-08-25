import express from "express";
import { auth } from "../routes/middlewares/auth.js";
import {startQuiz,submitQuiz,listMyQuizzes,getQuizDetail} from "../controllers/quizController.js";

const router = express.Router();

router.post("/start", auth, startQuiz);
router.post("/:attemptId/submit", auth, submitQuiz);
router.get("/my", auth, listMyQuizzes);
router.get("/:attemptId", auth, getQuizDetail);

export default router;
