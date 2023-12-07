'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('project_versions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      ppd_task_id: {
        type: Sequelize.TEXT
      },
      preprocess_status: {
        type: Sequelize.INTEGER
      },
      training_status: {
        type: Sequelize.INTEGER
      },
      fully_passed: {
        type: Sequelize.BOOLEAN
      },
      color_mode_id: {
        type: Sequelize.INTEGER
      },
      train_history: {
        type: Sequelize.JSON
      },
      train_curve_key: {
        type: Sequelize.STRING
      },
      validation_results: {
        type: Sequelize.JSON
      },
      roc_plot_key: {
        type: Sequelize.STRING
      },
      cm_plot_key: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE
      },
      created_by: {
        type: Sequelize.INTEGER
      },
      updated_at: {
        type: Sequelize.DATE
      },
      updated_by: {
        type: Sequelize.INTEGER
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('project_versions')
  }
}
