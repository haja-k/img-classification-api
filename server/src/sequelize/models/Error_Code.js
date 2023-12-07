'use strict'

module.exports = (sequelize, DataTypes) => {
  const ErrorCode = sequelize.define(
    'ErrorCode',
    {
      code: DataTypes.STRING,
      module: DataTypes.STRING,
      description: DataTypes.STRING,
      severity: DataTypes.ENUM('INFO', 'WARNING', 'LOW', 'MEDIUM', 'HIGH')
    },
    {
      sequelize,
      modelName: 'error_codes',
      createdAt: false,
      updatedAt: false
    }
  )
  ErrorCode.associate = (models) => {
    ErrorCode.hasMany(models.ErrorCode, {
      foreignKey: 'error_code_id'
    })
  }
  return ErrorCode
}
