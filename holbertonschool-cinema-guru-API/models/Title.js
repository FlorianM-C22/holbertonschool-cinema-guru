const DataTypes = require("sequelize").DataTypes;
const sequelize = require('../config/database');
const User = require('./User')

const Title = sequelize.define('Title', {
    title: {
        type: DataTypes.STRING,
        defaultValue: "Title not available"
    },
    imdbId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    synopsis: {
        type: DataTypes.TEXT,
    },
    imageurls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    imdbrating: {
        type: DataTypes.FLOAT,
        defaultValue: -1
    },
    released: {
        type: DataTypes.INTEGER,
        defaultValue: -1
    },
    type: {
        type: DataTypes.STRING
    },
    genres: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
});

const UserFavorites = sequelize.define('UserFavorites', {}, {});
const UserWatchLater = sequelize.define('UserWatchLater', {}, {});

User.belongsToMany(Title, { as: 'favorite', through: "UserFavorites" })
User.belongsToMany(Title, { as: 'watchLater', through: "UserWatchLater" })
Title.belongsToMany(User, { as: 'favorite', through: "UserFavorites" })
Title.belongsToMany(User, { as: 'watchLater', through: "UserWatchLater" })


module.exports = { Title, UserFavorites, UserWatchLater };