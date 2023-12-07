'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Pv_Model = sequelize.define(
    'Pv_Model',
    {
      pv_id: DataTypes.INTEGER,
      model_id: DataTypes.INTEGER,
      training_task_id: DataTypes.TEXT,
      loss_id: DataTypes.INTEGER,
      optimizer_id: DataTypes.INTEGER,
      dense_neurons: DataTypes.INTEGER,
      input_shape: DataTypes.TEXT,
      epoch: DataTypes.INTEGER,
      learning_rate: DataTypes.FLOAT,
      batch_size: DataTypes.INTEGER,
      model_key: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'pv_model',
      tableName: 'pv_models',
      createdAt: 'created_at',
      updatedAt: false
    }
  )
  Pv_Model.associate = (models) => {
    Pv_Model.belongsTo(models.Project_Version, {
      foreignKey: 'pv_id'
    });
    Pv_Model.belongsTo(models.Normalization, {
      foreignKey: 'normalization_id'
    })
  }
  return Pv_Model
}
