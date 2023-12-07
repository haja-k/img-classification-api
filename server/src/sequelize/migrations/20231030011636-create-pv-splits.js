'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pv_splits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pv_id: {
        type: Sequelize.INTEGER
      },
      test_ratio: {
        type: Sequelize.FLOAT
      },
      val_ratio: {
        type: Sequelize.FLOAT
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('pv_splits')
  }
}
