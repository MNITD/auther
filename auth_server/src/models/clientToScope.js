import db from '../db'
import Client from '../models/client'
import Scope from '../models/scope'

const ClientToScope = db.define('client_to_scope', {}, {timestamps: false, underscored: true})

Client.belongsToMany(Scope, {through: ClientToScope})
Scope.belongsToMany(Client, {through: ClientToScope})

export default ClientToScope
