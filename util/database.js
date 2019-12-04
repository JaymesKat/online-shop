const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete-db', 'root', '', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;
