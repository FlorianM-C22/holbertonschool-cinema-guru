const DataTypes = require("sequelize").DataTypes
const sequelize = require('../config/database')
const User = require("./User")

const UserActivity = sequelize.define('UserActivity', {
    tmdbId: { type: DataTypes.INTEGER, allowNull: false, field: 'tmdb_id' },
    mediaType: { type: DataTypes.STRING, allowNull: false, field: 'media_type' },
    activityType: {
        type: DataTypes.ENUM(["favorite", "watchLater", "removeFavorited", "removeWatchLater"]),
        allowNull: false,
        field: 'activity_type',
    },
}, {
    underscored: true,
})

UserActivity.belongsTo(User, { as: "user", foreignKey: "userId" })

module.exports = UserActivity
