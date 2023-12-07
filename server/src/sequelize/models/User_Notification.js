'use strict'

module.exports = (sequelize, DataTypes) => {
  const UserNotification = sequelize.define(
    'UserNotification',
    {
      notification_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      is_read: DataTypes.BOOLEAN,
      is_dismissed: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'user_notifications',
      createdAt: false,
      updatedAt: false
    }
  )
  UserNotification.associate = (models) => {
    UserNotification.belongsTo(models.User, {
      foreignKey: 'user_id'
    })

    UserNotification.belongsTo(models.Notification, {
      foreignKey: 'notification_id'
    })
  }
  return UserNotification
}
