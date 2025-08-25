import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class Skill extends Model { }

    Skill.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
            description: { type: DataTypes.STRING(400) },
        },
        {
            sequelize,
            modelName: "Skill",
            tableName: "skills",
            underscored: true,
        }
    );

    return Skill;
};
