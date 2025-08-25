import express from "express";
import { createSkill, listSkills, getSkill, updateSkill, deleteSkill } from "../controllers/skillController.js";
import { auth } from "./middlewares/auth.js";
import { rbac } from "./middlewares/rbac.js";

const router = express.Router();

router.get("/", listSkills);

router.get("/:id", getSkill);

router.post("/create-skill", auth, rbac("admin"), createSkill);

router.put("/:id", auth, rbac("admin"), updateSkill);

router.delete("/:id", auth, rbac("admin"), deleteSkill);

export default router;
