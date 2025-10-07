import { Sequelize } from "sequelize";
//import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../config.js'


const DB_NAME = process.env.DB_NAME
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT


const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: console.log // Habilitar el log de consultas SQL
})

// const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
//     host: DB_HOST,
//     port: DB_PORT,
//     dialect: 'mysql',
//     pool: {
//         max: 5, // Limita el número máximo de conexiones a 5
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     },
//     logging: false // Habilitar el log de consultas SQL
// })
export default db;
