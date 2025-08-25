import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class Question extends Model { }

    Question.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            text: { type: DataTypes.TEXT, allowNull: false },
            options: { type: DataTypes.JSON, allowNull: false },
            correct_index: { type: DataTypes.INTEGER, allowNull: false },
            difficulty: {
                type: DataTypes.ENUM("easy", "medium", "hard"),
                defaultValue: "medium",
            },
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        {
            sequelize,
            modelName: "Question",
            tableName: "questions",
            underscored: true,
            indexes: [{ fields: ["skill_id", "is_active", "difficulty"] }],
        }
    );

    return Question;
};
