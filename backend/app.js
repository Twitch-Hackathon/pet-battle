const express = require('express');
const app = express();

const pet = require('./controllers/pet.js');

const port = process.env.PORT || 5000;

pet(app);
