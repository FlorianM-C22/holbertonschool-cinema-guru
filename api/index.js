const express = require('express');
const sequelize = require('./config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/auth')
const titlesRouter = require('./routes/titles')
const userActivitiesRouter = require('./routes/userActivities')
const fs = require("fs");
require('dotenv').config()

const app = express();
const corsOptions = {
    origin: 'http://localhost:3000',
}
app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/titles', titlesRouter);
app.use('/api/activity', userActivitiesRouter);

sequelize.sync({ force: true })
    .then(async () => {
        console.log(`Database & tables created!`);
        console.log('Postgress Connected');
        fs.readFile("dump.sql", 'utf8', async (err, data) => {
            await sequelize.query(data)
            console.log("DB Seeded");
        })
    })
    .catch(err => console.log(err));

const port = process.env.PORT || 8000;

app.listen(port, () => console.log('Server running...'));
