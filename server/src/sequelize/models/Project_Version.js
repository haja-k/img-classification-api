'use strict'
/* eslint-disable */
module.exports = (sequelize, DataTypes) => {
  const Project_Version = sequelize.define(
    'Project_Version',
    {
      project_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      color_mode_id: DataTypes.INTEGER,
      ppd_task_id: DataTypes.TEXT,
      preprocess_status: DataTypes.INTEGER,
      training_status: DataTypes.INTEGER,
      fully_passed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      train_history: DataTypes.JSON,
      train_curve_key: DataTypes.STRING,
      validation_results: DataTypes.JSON,
      roc_plot_key: DataTypes.STRING,
      cm_plot_key: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'project_version',
      tableName: 'project_versions',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  )
  Project_Version.associate = (models) => {
    Project_Version.belongsTo(models.Project, {
      foreignKey: 'project_id'
    });
    Project_Version.belongsTo(models.Color_Mode, {
      foreignKey: 'color_mode_id'
    });
    Project_Version.hasMany(models.Target_Class_Detail, {
      foreignKey: 'pv_id'
    });
    Project_Version.hasMany(models.Augment_Detail, {
      foreignKey: 'pv_id'
    });
    Project_Version.hasMany(models.Pv_Norm, {
      foreignKey: 'pv_id'
    });
    Project_Version.hasMany(models.Pv_Sampling, {
      foreignKey: 'pv_id'
    });
    Project_Version.hasMany(models.Pv_Resize, {
      foreignKey: 'pv_id'
    });
    Project_Version.hasMany(models.Pv_Split, {
      foreignKey: 'pv_id'
    });
  }

  return Project_Version
}
