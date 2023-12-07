'use strict'

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      user_id: DataTypes.INTEGER,
      notification_type_id: DataTypes.INTEGER,
      message_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'notifications',
      createdAt: true,
      updatedAt: false
    }
  )
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id'
    })

    Notification.belongsTo(models.NotificationMessage, {
      foreignKey: 'notification_message_id'
    })

    Notification.belongsTo(models.NotificationType, {
      foreignKey: 'notification_type_id'
    })

    Notification.hasMany(models.UserNotification, {
      foreignKey: 'notification_id'
    })
  }
  return Notification
}
