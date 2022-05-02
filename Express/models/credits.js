"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Credits extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      // define association here
      Credits.belongsTo(Users, { foreignKey: "username" });
    }
  }
  Credits.init(
    {
      username: { type: DataTypes.STRING(38), allowNull: false },
      credit_adjustment: { type: DataTypes.INTEGER, allowNull: false },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      adjustment_type: { type: DataTypes.STRING, allowNull: false },
      bill_month: { type: DataTypes.DATEONLY, allowNull: true },
    },
    {
      sequelize,
      tableName: "credits",
      modelName: "Credits",
    }
  );
  return Credits;
};
