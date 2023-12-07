'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      full_name: DataTypes.STRING,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      role_id: {
        type: DataTypes.INTEGER,
        defaultValue: 3
      },
      login_type: DataTypes.ENUM(
        'ldap',
        'local'
      ),
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'user',
      tableName: 'users',
      createdAt: 'created_at',
      updatedAt: false
    }
  )

  User.associate = (models) => {
    User.hasMany(models.Notification, {
      foreignKey: 'user_id'
    })

    User.hasMany(models.UserNotification, {
      foreignKey: 'user_id'
    })

    User.belongsToMany(models.Project, {
      through: models.Project_Member,
      foreignKey: 'user_id'
    })

    User.belongsToMany(models.Group, {
      through: models.Group_Member,
      foreignKey: 'user_id',
      as: 'groups'
    })
  }
  return User
}
