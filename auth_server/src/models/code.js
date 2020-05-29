import {Sequelize, DataTypes} from 'sequelize'

import db from '../db'
import Client from '../models/client'

const Code = db.define(
  'code',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    redirect_uri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code_challenge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code_challenge_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.UUID,
      references: {
        model: Client,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  },
  {
    timestamps: false,
  })

export default Code
