'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      skill_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'skills', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      text: { type: Sequelize.TEXT, allowNull: false },
      options: { type: Sequelize.JSON, allowNull: false }, // ["A","B","C","D"]
      correct_index: { type: Sequelize.INTEGER, allowNull: false }, // 0..n-1
      difficulty: { type: Sequelize.ENUM('easy','medium','hard'), allowNull: false, defaultValue: 'medium' },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('questions', ['skill_id','is_active','difficulty'], { name: 'questions_skill_active_diff_idx' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('questions');
  }
};
