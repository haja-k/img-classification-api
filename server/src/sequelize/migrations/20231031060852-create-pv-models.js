'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pv_models', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pv_id: {
        type: Sequelize.INTEGER
      },
      training_task_id: {
        type: Sequelize.TEXT
      },
      model_id: {
        type: Sequelize.INTEGER
      },
      loss_id: {
        type: Sequelize.INTEGER
      },
      optimizer_id: {
        type: Sequelize.INTEGER
      },
      dense_neurons: {
        type: Sequelize.INTEGER
      },
      input_shape: {
        type: Sequelize.TEXT
      },
      epoch: {
        type: Sequelize.INTEGER
      },
      learning_rate: {
        type: Sequelize.FLOAT
      },
      batch_size: {
        type: Sequelize.INTEGER
      },
      model_key: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('pv_models')
  }
}
