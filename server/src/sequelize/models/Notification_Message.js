'use strict'

module.exports = (sequelize, DataTypes) => {
  const NotificationMessage = sequelize.define(
    'NotificationMessage',
    {
      message: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'notification_messages',
      createdAt: false,
      updatedAt: false
    }
  )
  NotificationMessage.associate = (models) => {
    NotificationMessage.hasMany(models.Notification, {
      foreignKey: 'message_id'
    })
  }
  return NotificationMessage
}
