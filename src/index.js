const express = require('express');

const sequelize = require('./db');
const lessonsRouter = require('./routes/lessons.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', lessonsRouter);

(async function dbconnect() {
    try {
        await sequelize.sync();
    } catch (e) {
        console.log(e);
        setTimeout(() => dbconnect(), 5000);
    }
}());

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
