"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Storage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      // define association here
      Storage.belongsTo(Users, { foreignKey: "username" });
    }
  }
  Storage.init(
    {
      username: { type: DataTypes.STRING(38), allowNull: false },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      storage_used: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "storages",
      modelName: "Storage",
    }
  );
  return Storage;
};
