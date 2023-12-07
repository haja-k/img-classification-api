'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Pv_Split = sequelize.define(
    'Pv_Split',
    {
      pv_id: DataTypes.INTEGER,
      test_ratio: DataTypes.FLOAT,
      val_ratio: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: 'pv_split',
      tableName: 'pv_splits',
      createdAt: false,
      updatedAt: false
    }
  )
  Pv_Split.associate = (models) => {
    Pv_Split.belongsTo(models.Project_Version, {
      foreignKey: 'pv_id'
    })
  }
  return Pv_Split
}
