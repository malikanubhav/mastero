import express from "express";
import { auth } from "./middlewares/auth.js";
import { rbac } from "./middlewares/rbac.js";
import {mySummary,mySkillGaps,adminUserReport} from "../controllers/reportController.js";

const router = express.Router();

router.get("/me/summary", auth, mySummary);
router.get("/me/skill-gaps", auth, mySkillGaps);
router.get("/admin/users", auth, rbac("admin"), adminUserReport);

export default router;
