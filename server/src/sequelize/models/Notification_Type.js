'use strict'

module.exports = (sequelize, DataTypes) => {
  const NotificationType = sequelize.define(
    'NotificationType',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'notification_types',
      createdAt: false,
      updatedAt: false
    }
  )
  NotificationType.associate = (models) => {
    NotificationType.hasMany(models.Notification, {
      foreignKey: 'notification_type_id'
    })
  }
  return NotificationType
}
