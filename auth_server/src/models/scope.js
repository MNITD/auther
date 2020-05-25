import {Sequelize, DataTypes} from 'sequelize'

import db from '../db'
import ResourceServer from '../models/resourceServer'

const Scope = db.define(
  'scope',
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
    description: {
      type: DataTypes.STRING,
    },
    resource_server_id: {
      type: DataTypes.UUID,
      references: {
        model: ResourceServer,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  },
  {
    timestamps: false,
  })

export default Scope
