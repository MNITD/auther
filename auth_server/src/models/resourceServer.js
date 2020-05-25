import {DataTypes} from 'sequelize'

import db from '../db'

const ResourceServer = db.define(
  'resource_server',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  })

export default ResourceServer
