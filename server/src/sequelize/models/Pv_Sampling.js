'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Pv_Sampling = sequelize.define(
    'Pv_Sampling',
    {
      pv_id: DataTypes.INTEGER,
      sampling_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'pv_sampling',
      tableName: 'pv_samplings',
      createdAt: false,
      updatedAt: false
    }
  )
  Pv_Sampling.associate = (models) => {
    Pv_Sampling.belongsTo(models.Project_Version, {
      foreignKey: 'pv_id'
    }),
    Pv_Sampling.belongsTo(models.Pv_Sampling, {
      foreignKey: 'sampling_id'
    })
  }
  return Pv_Sampling
}
