'use strict'

module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    target_class_id: DataTypes.INTEGER,
    key: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'image',
    tableName: 'images',
    createdAt: false,
    updatedAt: false
  }
  )

  Image.associate = (models) => {
    Image.belongsTo(models.Target_Class_Detail, {
      foreignKey: 'target_class_id',
      as: 'targetClassID'
    })
  }

  return Image
}
