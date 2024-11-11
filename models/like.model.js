let { DataTypes, sequelize } = require("../lib/");

let { user } = require("./user.model");
let { movie } = require("./movie.model");

let like = sequelize.define("like", {
  userId: {
    type: DataTypes.INTEGER,
    references: {
        model: user,
        key: "id",
    },
  },

  movieId: {
    type: DataTypes.INTEGER,
    references: {
        model: movie,
        key: "id",
    },
  },
});

user.belongsToMany(movie, { through: like });
movie.belongsToMany(user, { through: like });

module.exports = {
    like
};
