const { Sequelize } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL?.trim();

let sequelize = null;

if (databaseUrl) {
  const useSsl = process.env.DATABASE_SSL === "true"
    || (process.env.DATABASE_SSL !== "false" && process.env.NODE_ENV === "production");

  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
          },
        }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  console.warn("DATABASE_URL is not set. PostgreSQL is disabled until a valid DATABASE_URL is configured.");
}

module.exports = sequelize;
