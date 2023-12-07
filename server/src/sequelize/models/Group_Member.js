'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Group_Member = sequelize.define(
    'Group_Member',
    {
      user_id: DataTypes.INTEGER,
      group_id: DataTypes.INTEGER,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      member_since: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'group_member',
      tableName: 'group_members',
      createdAt: 'member_since',
      updatedAt: false
    }
  )

  Group_Member.associate = (models) => {
    Group_Member.belongsTo(models.Group, {
      foreignKey: 'group_id'
    })
    Group_Member.belongsTo(models.User, {
      foreignKey: 'user_id'
    })
  }

  return Group_Member
}
