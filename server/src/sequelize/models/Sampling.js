'use strict'

module.exports = (sequelize, DataTypes) => {
  const Sampling = sequelize.define(
    'Sampling',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'sampling',
      tableName: 'samplings',
      createdAt: false,
      updatedAt: false
    }
  )
  Sampling.associate = (models) => {
    Sampling.hasMany(models.Pv_Sampling, {
      foreignKey: 'sampling_id'
    })
  }
  return Sampling
}
