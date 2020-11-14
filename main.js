require('dotenv').config();
const db = require('./db');

db.Connect().then(async _ => {
    if (process.argv[2] === 'systems') {
        await require("./systems").ImportSystems();
    }

    if (process.argv[2] === 'statics') {
        await require("./statics").UpdateStatics();
    }
});
