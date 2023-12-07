'use strict'

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    'Project',
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      group_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'project',
      tableName: 'projects',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  )

  Project.associate = (models) => {
    Project.hasMany(models.Project_Version, {
      foreignKey: 'project_id'
    })

    Project.belongsToMany(models.User, {
      through: models.Project_Member,
      foreignKey: 'project_id'
    })

    Project.belongsTo(models.Group, {
      foreignKey: 'group_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  }

  return Project
}
