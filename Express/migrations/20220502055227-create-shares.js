"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("shares", {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING(38),
        allowNull: false,
      },
      url_uuid: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      s3_key: {
        type: DataTypes.STRING(1023),
        allowNull: false,
      },
      expiry: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      download_counter: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable("shares");
  },
};
