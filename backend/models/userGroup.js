import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class UserGroup extends Model { }

    UserGroup.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelName: "UserGroup",
            tableName: "user_groups",
            underscored: true,
        }
    );

    return UserGroup;
};
