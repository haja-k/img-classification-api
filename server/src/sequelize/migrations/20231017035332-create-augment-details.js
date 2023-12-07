'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('augment_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pv_id: {
        type: Sequelize.INTEGER
      },
      augmentation_mode_id: {
        type: Sequelize.INTEGER
      },
      ratio: {
        type: Sequelize.FLOAT
      },
      value: {
        type: Sequelize.TEXT
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('augment_details')
  }
}
