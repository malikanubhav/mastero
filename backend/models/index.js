import { Sequelize } from "sequelize";
import "dotenv/config";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const configJson = require("../config/config.json");

const env = process.env.NODE_ENV || "development";
const cfg = configJson?.[env] ?? {};

let sequelize;

if (process.env.DB_URL) {
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "mysql",
    logging: false,
    timezone: "+00:00",
    define: { underscored: true },
  });
} else if (cfg.use_env_variable && process.env[cfg.use_env_variable]) {
  sequelize = new Sequelize(process.env[cfg.use_env_variable], {
    dialect: cfg.dialect || "mysql",
    logging: false,
    timezone: "+00:00",
    define: { underscored: true },
  });
} else {
  sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
    host: cfg.host || "127.0.0.1",
    port: cfg.port ?? 3306,
    dialect: cfg.dialect || "mysql",
    logging: false,
    timezone: "+00:00",
    define: { underscored: true },
  });
}

// import models explicitly
import UserModel from "./user.js";
import SkillModel from "./skill.js";
import QuestionModel from "./question.js";
import QuizAttemptModel from "./quizAttempt.js";
import QuizAnswerModel from "./quizAnswer.js";
import GroupModel from "./group.js";
import UserGroupModel from "./userGroup.js";

const User = UserModel(sequelize);
const Skill = SkillModel(sequelize);
const Question = QuestionModel(sequelize);
const QuizAttempt = QuizAttemptModel(sequelize);
const QuizAnswer = QuizAnswerModel(sequelize);
const Group = GroupModel(sequelize);
const UserGroup = UserGroupModel(sequelize);

// associations (same as before) …
Question.belongsTo(Skill, { foreignKey: { name: "skill_id", allowNull: false } });
Skill.hasMany(Question,   { foreignKey: { name: "skill_id", allowNull: false } });
QuizAttempt.belongsTo(User,  { foreignKey: { name: "user_id",  allowNull: false } });
QuizAttempt.belongsTo(Skill, { foreignKey: { name: "skill_id", allowNull: false } });
User.hasMany(QuizAttempt,    { foreignKey: "user_id" });
Skill.hasMany(QuizAttempt,   { foreignKey: "skill_id" });
QuizAnswer.belongsTo(QuizAttempt, { foreignKey: { name: "quiz_attempt_id", allowNull: false } });
QuizAnswer.belongsTo(Question,    { foreignKey: { name: "question_id",     allowNull: false } });
QuizAttempt.hasMany(QuizAnswer,   { foreignKey: "quiz_attempt_id" });
Question.hasMany(QuizAnswer,      { foreignKey: "question_id" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "group_id", otherKey: "user_id" });
User.belongsToMany(Group, { through: UserGroup, foreignKey: "user_id",  otherKey: "group_id" });

export { sequelize, User, Skill, Question, QuizAttempt, QuizAnswer, Group, UserGroup };
