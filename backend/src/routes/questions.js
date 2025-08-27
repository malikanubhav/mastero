import express from "express";
import { auth } from "./middlewares/auth.js";
import { rbac } from "./middlewares/rbac.js";
import {createQuestion,listQuestions,getQuestion,updateQuestion,deleteQuestion} from "../controllers/questionsController.js";
import { pagination } from "./middlewares/pagination.js";
const router = express.Router();

router.post("/", auth, rbac("admin"), createQuestion);
router.get("/", auth, rbac("admin"), pagination(10,100), listQuestions);
router.get("/:id", auth, rbac("admin"), getQuestion);
router.put("/:id", auth, rbac("admin"), updateQuestion);
router.delete("/:id", auth, rbac("admin"), deleteQuestion);

export default router;
