import {DataTypes} from 'sequelize'

import db from '../db'

const Client = db.define(
  'client',
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
    client_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_secret: {
      type: DataTypes.STRING,
    },
    redirect_url: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('public', 'confidential'),
      allowNull: false,
    }
  },
  {
    timestamps: false,
  })

export default Client
