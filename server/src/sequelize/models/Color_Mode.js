'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Color_Mode = sequelize.define(
    'Color_Mode',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'color_mode',
      tableName: 'color_modes',
      createdAt: false,
      updatedAt: false
    }
  )
  Color_Mode.associate = (models) => {
    Color_Mode.hasMany(models.Project_Version, {
      foreignKey: 'color_mode_id'
    })
  }
  return Color_Mode
}
