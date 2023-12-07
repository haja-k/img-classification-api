'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      full_name: {
        type: Sequelize.STRING
      },
      role_id: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      login_type: {
        type: Sequelize.ENUM('ldap', 'local'),
        defaultValue: 'ldap'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users')
  }
}
