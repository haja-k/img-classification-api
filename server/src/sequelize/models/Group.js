'use strict'

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize,
    modelName: 'group',
    tableName: 'groups',
    createdAt: 'created_at',
    updatedAt: false
  })

  Group.associate = (models) => {
    Group.belongsToMany(models.User, {
      through: models.Group_Member,
      foreignKey: 'group_id',
      otherKey: 'user_id'
    })
    Group.hasMany(models.Project, {
      foreignKey: 'group_id'
    })
  }

  return Group
}
