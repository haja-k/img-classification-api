'use strict'

module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define(
    'Model',
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'model',
      tableName: 'models',
      createdAt: false,
      updatedAt: false
    }
  )
  Model.associate = (models) => {
    Model.hasMany(models.Pv_Model, {
      foreignKey: 'model_id'
    })
  }
  return Model
}
