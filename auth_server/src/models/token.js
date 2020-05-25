import {Sequelize, DataTypes} from 'sequelize'

import db from '../db'
import User from '../models/user'
import Client from '../models/client'
import Code from '../models/code'

const Token = db.define(
  'token',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    expires_at: {
      type: Sequelize.TIMESTAMP,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    client_id: {
      type: DataTypes.UUID,
      references: {
        model: Client,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    code_id: {
      type: DataTypes.UUID,
      references: {
        model: Code,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  },
  {
    timestamps: false,
  })

export default Token
