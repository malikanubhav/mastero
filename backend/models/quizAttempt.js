import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class QuizAttempt extends Model { }

    QuizAttempt.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            status: {
                type: DataTypes.ENUM("in_progress", "submitted"),
                defaultValue: "in_progress",
            },
            score: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
            total_questions: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
            started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            completed_at: { type: DataTypes.DATE, allowNull: true },
            duration_seconds: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
        },
        {
            sequelize,
            modelName: "QuizAttempt",
            tableName: "quiz_attempts",
            underscored: true,
            indexes: [{ fields: ["user_id", "skill_id", "created_at"] }],
        }
    );

    return QuizAttempt;
};
