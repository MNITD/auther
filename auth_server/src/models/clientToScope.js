import db from '../db'
import Client from '../models/client'
import Scope from '../models/scope'
import {DataTypes, Sequelize} from 'sequelize'

const ClientToScope = db.define('clients_to_scopes', {
  id: { // temp solution as belongsToMany isn't currently work
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  client_id: {
    type: DataTypes.UUID,
    references: {
      model: Client,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
  scope_id: {
    type: DataTypes.UUID,
    references: {
      model: Scope,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },
}, {timestamps: false})

// Client.belongsToMany(Scope, {through: ClientToScope})
// Scope.belongsToMany(Client, {through: ClientToScope})

export default ClientToScope
