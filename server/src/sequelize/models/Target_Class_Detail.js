'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Target_Class_Detail = sequelize.define(
    'Target_Class_Detail',
    {
      pv_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      directory: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'target_class_detail',
      tableName: 'target_class_details',
      createdAt: false,
      updatedAt: false
    }
  )
  Target_Class_Detail.associate = (models) => {
    Target_Class_Detail.belongsTo(models.Project_Version, {
      foreignKey: 'pv_id'
    });
    Target_Class_Detail.hasMany(models.Image, {
        foreignKey: 'target_class_id'
      });
  }

  return Target_Class_Detail
}
