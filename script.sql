CREATE DATABASE always_music_db;

\c always_music_db;

CREATE TABLE registro_actual (
    Rut VARCHAR(14) PRIMARY KEY,
    Nombre VARCHAR(25),
    Curso VARCHAR(25),
    Nivel INTEGER
);