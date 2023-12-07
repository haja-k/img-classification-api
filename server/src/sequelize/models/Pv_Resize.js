'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Pv_Resize = sequelize.define(
    'Pv_Resize',
    {
      pv_id: DataTypes.INTEGER,
      resize_width: DataTypes.INTEGER,
      resize_height: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'pv_resize',
      tableName: 'pv_resizes',
      createdAt: false,
      updatedAt: false
    }
  )
  Pv_Resize.associate = (models) => {
    Pv_Resize.belongsTo(models.Project_Version, {
      foreignKey: 'pv_id'
    })
  }
  return Pv_Resize
}
