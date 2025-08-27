'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(120), allowNull: false, unique: true }
    });
    await queryInterface.addIndex('groups', ['name'], { unique: true, name: 'groups_name_uq' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('groups');
  }
};
