const DataTypes = require('sequelize').DataTypes
const sequelize = require('../config/database')
const User = require('./User')

const UserListEntry = sequelize.define('UserListEntry', {
    tmdbId: { type: DataTypes.INTEGER, allowNull: false },
    mediaType: { type: DataTypes.STRING, allowNull: false },
    listType: { type: DataTypes.STRING, allowNull: false },
}, {
    indexes: [
        { unique: true, fields: ['UserId', 'tmdbId', 'mediaType', 'listType'] },
    ],
})

UserListEntry.belongsTo(User, { foreignKey: 'UserId' })
User.hasMany(UserListEntry, { foreignKey: 'UserId' })

module.exports = UserListEntry
