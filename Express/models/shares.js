"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Shares extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Users }) {
      // define association here
      this.belongsTo(Users, { foreignKey: "username" });
    }
  }
  Shares.init(
    {
      username: { type: DataTypes.STRING(38), allowNull: false },
      url_uuid: { type: DataTypes.STRING, allowNull: false },
      s3_key: { type: DataTypes.STRING(1023), allowNull: false },
      expiry: { type: DataTypes.DATE, allowNull: false },
      download_counter: { type: DataTypes.INTEGER, allowNull: false },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "shares",
      modelName: "Shares",
    }
  );
  return Shares;
};
