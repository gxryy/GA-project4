"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("credits", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING(38),
        allowNull: false,
      },
      credit_adjustment: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      adjustment_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bill_month: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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
    await queryInterface.dropTable("credits");
  },
};
