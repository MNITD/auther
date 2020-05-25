import {Sequelize} from 'sequelize'

const {POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_USER} = process.env

const sequelize = new Sequelize(`postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}`)

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.')
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err)
    })

export default sequelize
