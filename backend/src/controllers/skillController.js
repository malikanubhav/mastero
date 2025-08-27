import { Op } from "sequelize";
import { Skill } from "../../models/index.js";
import { pagination } from "../routes/middlewares/pagination.js";



const createSkill = async (req, res) => {
    try {
        console.log(req.body);
        const { name, description } = req.body;

        if (name == "") return res.status(400).json({ error: "name is required" });

        const exists = await Skill.findOne({
            where: { name: { [Op.eq]: name } },
        });
        console.log(name, description);
        if (exists) return res.status(409).json({ error: "skill already exists" });
        const skill = await Skill.create({ name: name, description: description });
        return res.status(201).json({ message: "skill created successfully", skill });
    } catch (err) {
        console.error("createSkill :", err);
        return res.status(500).json({ error: "Server error" });
    }
};


const listSkills = async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        console.log(search);
        const where = search ? { name: { [Op.like]: `%${search}%` } } : undefined;

        const offset = (req.page - 1) * req.limit;
        const { rows, count } = await Skill.findAndCountAll({
            where,
            limit: req.limit,
            offset: req.offset,
            order: [["name", "ASC"]],
        });

        return res.json({
            data: rows, page: req.page,
            limit: req.limit,
            total: count,
            totalPages: Math.ceil(count / req.limit),
        });
    } catch (err) {
        console.error("listSkills error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};



const getSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await Skill.findByPk(id);
        if (!skill) return res.status(404).json({ error: "Skill not found" });
        return res.json({ skill });
    } catch (err) {
        console.error("getSkill error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};



const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const skill = await Skill.findByPk(id);
        if (!skill) return res.status(404).json({ error: "Skill not found" });

        if (name && name == "") return res.status(400).json({ error: "Name cannot be empty" });

        if (name && name.trim() !== skill.name) {
            const dup = await Skill.findOne({ where: { name: name.trim() } });
            if (dup) return res.status(409).json({ error: "Another skill with this name exists" });
        }

        skill.name = name;
        skill.description = description;
        await skill.save();

        return res.json({ message: "Skill updated", skill });
    } catch (err) {
        console.error("updateSkill error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await Skill.findByPk(id);
        if (!skill) return res.status(404).json({ error: "Skill not found" });

        await skill.destroy();
        return res.json({ message: "Skill deleted" });
    } catch (err) {
        console.error("deleteSkill error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


export { createSkill, listSkills, deleteSkill, updateSkill, getSkill };