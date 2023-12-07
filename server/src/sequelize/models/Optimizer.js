'use strict'

module.exports = (sequelize, DataTypes) => {
  const Optimizer = sequelize.define(
    'Optimizer',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'optimizer',
      tableName: 'optimizers',
      createdAt: false,
      updatedAt: false
    }
  )
  Optimizer.associate = (models) => {
    Optimizer.hasMany(models.Pv_Model, {
      foreignKey: 'optimizer_id'
    })
  }
  return Optimizer
}
