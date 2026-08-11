const dotenv = require("dotenv");

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
}
dotenv.config();

const getConnectionUrlVariable = () => {
  if (process.env.DB_URL) return "DB_URL";
  if (process.env.DATABASE_URL) return "DATABASE_URL";
  if (process.env.MYSQL_URL) return "MYSQL_URL";
  return null;
};

const buildConfig = () => {
  const config = {
    username: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASS || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  };

  const connectionUrlVariable = getConnectionUrlVariable();
  if (connectionUrlVariable) {
    config.use_env_variable = connectionUrlVariable;
  }

  if (process.env.DB_SSL === "true") {
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
      },
    };
  }

  return config;
};

module.exports = {
  development: buildConfig(),
  test: buildConfig(),
  production: buildConfig(),
};
