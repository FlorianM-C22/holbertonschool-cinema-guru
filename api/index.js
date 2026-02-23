const express = require('express');
const sequelize = require('./config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/auth')
const userActivitiesRouter = require('./routes/userActivities')
const tmdbRouter = require('./routes/tmdb')
const fanartRouter = require('./routes/fanart')
const meRouter = require('./routes/me')
require('./models/UserListEntry')
require('dotenv').config()

const app = express();
const corsOptions = {
    origin: 'http://localhost:3000',
}
app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/activity', userActivitiesRouter);
app.use('/api/tmdb', tmdbRouter);
app.use('/api/fanart', fanartRouter);
app.use('/api/me', meRouter);

function errorMiddleware(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    if (statusCode >= 500) console.error(err);
    res.status(statusCode).json({ message, code: statusCode });
}
app.use(errorMiddleware);

const isDev = process.env.NODE_ENV !== 'production';
const forceSync = isDev && (process.env.DB_SYNC_FORCE === 'true' || process.env.DB_SYNC_FORCE === '1');

sequelize.sync({ force: forceSync })
    .then(() => {
        console.log(forceSync ? 'Database & tables created!' : 'Database connected');
        console.log('Postgres Connected');
    })
    .catch(err => console.error(err));

const port = process.env.PORT || 8000;

app.listen(port, () => console.log('Server running...'));
