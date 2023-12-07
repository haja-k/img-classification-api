'use strict'

module.exports = (sequelize, DataTypes) => {
  const Augmentation = sequelize.define(
    'Augmentation',
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'augmentation',
      tableName: 'augmentations',
      createdAt: false,
      updatedAt: false
    }
  )
  Augmentation.associate = (models) => {
    Augmentation.hasMany(models.Augment_Detail, {
      foreignKey: 'augmentation_mode_id'
    })
  }
  return Augmentation
}
