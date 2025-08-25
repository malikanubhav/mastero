import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class Group extends Model { }

    Group.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
        },
        {
            sequelize,
            modelName: "Group",
            tableName: "groups",
            underscored: true,
        }
    );

    return Group;
};
