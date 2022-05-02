"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addConstraint("credits", {
      fields: ["username"],
      type: "foreign key",
      name: "credits-user_association",
      references: {
        table: "users",
        field: "username",
      },
    });

    queryInterface.addConstraint("shares", {
      fields: ["username"],
      type: "foreign key",
      name: "shares-user_association",
      references: {
        table: "users",
        field: "username",
      },
    });

    queryInterface.addConstraint("storages", {
      fields: ["username"],
      type: "foreign key",
      name: "storage-user_association",
      references: {
        table: "users",
        field: "username",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeConstraint("credits", "credits-user_association");
    queryInterface.removeConstraint("shares", "shares-user_association");
    queryInterface.removeConstraint("storages", "storage-user_association");
  },
};
