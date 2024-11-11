let { DataTypes, sequelize } = require("../lib/");

let movie = sequelize.define("movie", {
  title: DataTypes.STRING,
  director: DataTypes.STRING,
  genre: DataTypes.STRING,
  year: DataTypes.INTEGER,
  summary: DataTypes.STRING,
});

module.exports = {
    movie,
};