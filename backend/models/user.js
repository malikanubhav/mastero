import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class User extends Model { }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { type: DataTypes.STRING(120), allowNull: false },
            email: {
                type: DataTypes.STRING(160),
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            password: { type: DataTypes.STRING(100), allowNull: false },
            role: {
                type: DataTypes.ENUM("admin", "user"),
                allowNull: false,
                defaultValue: "user",
            },
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            underscored: true,
            indexes: [{ unique: true, fields: ["email"] }],
        }
    );

    return User;
};
