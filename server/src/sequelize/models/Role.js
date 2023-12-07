'use strict'

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    'Role',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'role',
      tableName: 'roles',
      createdAt: false,
      updatedAt: false
    }
  )
  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id'
    })
  }
  return Role
}
