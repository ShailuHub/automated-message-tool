"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
console.log(username, password);
if (!username || !password)
    throw new Error("Invalid database username or password");
// Create seqelize object
const sequelize = new sequelize_1.Sequelize("reachinbox", username, password, {
    host: "localhost",
    dialect: "mysql",
});
exports.default = sequelize;
