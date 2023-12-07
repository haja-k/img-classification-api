'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Pv_Norm = sequelize.define(
    'Pv_Norm',
    {
      pv_id: DataTypes.INTEGER,
      normalization_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'pv_norm',
      tableName: 'pv_norms',
      createdAt: false,
      updatedAt: false
    }
  )
  Pv_Norm.associate = (models) => {
    Pv_Norm.belongsTo(models.Project_Version, {
      foreignKey: 'pv_id'
    });
    Pv_Norm.belongsTo(models.Normalization, {
      foreignKey: 'normalization_id'
    })
  }
  return Pv_Norm
}
