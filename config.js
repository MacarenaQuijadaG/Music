const { Pool } = require('pg');

const pool = new Pool({
    //user: 'xxx', // usuario de postgres
    user: 'postgres', // usuario macarena
    host: 'localhost',
    database: 'always_music_db', //nombre sugerido de la base de datos creada en tu pc
    //password: 'xxx', // pass de postgres
    password: 'desarrollo',// pass macarena
    port: 5432,
});

module.exports = pool;
