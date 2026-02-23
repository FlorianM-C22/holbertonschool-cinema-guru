const DataTypes = require("sequelize").DataTypes
const sequelize = require('../config/database')
const User = require("./User")

const UserActivity = sequelize.define('UserActivity', {
    tmdbId: { type: DataTypes.INTEGER, allowNull: false },
    mediaType: { type: DataTypes.STRING, allowNull: false },
    activityType: {
        type: DataTypes.ENUM(["favorite", "watchLater", "removeFavorited", "removeWatchLater"]),
        allowNull: false,
    },
})

UserActivity.belongsTo(User, { as: "user", foreignKey: "userId" })

module.exports = UserActivity
