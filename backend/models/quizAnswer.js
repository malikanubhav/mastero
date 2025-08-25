import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class QuizAnswer extends Model { }

    QuizAnswer.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            selected_index: { type: DataTypes.INTEGER, allowNull: false },
            is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        {
            sequelize,
            modelName: "QuizAnswer",
            tableName: "quiz_answers",
            underscored: true,
            indexes: [{ fields: ["quiz_attempt_id", "question_id"] }],
        }
    );

    return QuizAnswer;
};
