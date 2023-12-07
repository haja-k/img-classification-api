'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Project_Member = sequelize.define(
    'Project_Member',
    {
      user_id: DataTypes.INTEGER,
      project_id: DataTypes.INTEGER,
      last_viewed: DataTypes.DATE,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'project_member',
      tableName: 'project_members',
      createdAt: 'member_since',
      updatedAt: false
    }
  )
  Project_Member.associate = (models) => {
    Project_Member.belongsTo(models.Project, {
      foreignKey: 'project_id'
    })
    Project_Member.belongsTo(models.User, {
      foreignKey: 'user_id'
    })
  }

  return Project_Member
}
