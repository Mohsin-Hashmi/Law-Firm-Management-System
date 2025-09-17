require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: null,
    database: "mydb_dev",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: null,
    database: "mydb_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    use_env_variable: "DB_URL", // Railway injects this
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // important for Railway
      },
    },
  },
};
