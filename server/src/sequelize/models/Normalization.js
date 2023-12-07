'use strict'

module.exports = (sequelize, DataTypes) => {
  const Normalization = sequelize.define(
    'Normalization',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'normalization',
      tableName: 'normalizations',
      createdAt: false,
      updatedAt: false
    }
  )
  Normalization.associate = (models) => {
    Normalization.hasMany(models.Pv_Norm, {
      foreignKey: 'normalization_id'
    })
  }
  return Normalization
}
