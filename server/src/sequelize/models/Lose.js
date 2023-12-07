'use strict'

module.exports = (sequelize, DataTypes) => {
  const Lose = sequelize.define(
    'Lose',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'lose',
      tableName: 'losses',
      createdAt: false,
      updatedAt: false
    }
  )
  Lose.associate = (models) => {
    Lose.hasMany(models.Pv_Model, {
      foreignKey: 'loss_id'
    })
  }
  return Lose
}
