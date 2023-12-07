'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('error_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING
      },
      module: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      severity: {
        type: Sequelize.ENUM('INFO', 'WARNING', 'LOW', 'MEDIUM', 'HIGH')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('error_codes')
  }
}
