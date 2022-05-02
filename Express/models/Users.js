"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Credits, Shares, Storage }) {
      // define association here
      Users.hasMany(Credits, { foreignKey: "username", as: "credits" });
      Users.hasMany(Shares, { foreignKey: "username", as: "shares" });
      Users.hasMany(Storage, { foreignKey: "username", as: "storages" });
    }
  }
  Users.init(
    {
      username: { type: DataTypes.STRING(38), allowNull: false },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      date_joined: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "Users",
    }
  );
  return Users;
};
