'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Augment_Detail = sequelize.define(
    'Augment_Detail',
    {
      pv_id: DataTypes.INTEGER,
      augmentation_mode_id: DataTypes.INTEGER,
      ratio: DataTypes.FLOAT,
      value: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'augment_detail',
      tableName: 'augment_details',
      createdAt: false,
      updatedAt: false
    }
  );

  Augment_Detail.associate = (models) => {
    Augment_Detail.belongsTo(models.Project_Version, {
      foreignKey: 'pv_id'
    });
    Augment_Detail.belongsTo(models.Augmentation, {
      foreignKey: 'augmentation_mode_id'
    });
  };

  return Augment_Detail;
};
