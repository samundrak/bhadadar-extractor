// This CLI will ask for translation of every nepali place and geo coordinates
const json = require('./dats.json');
const flatmap = require('lodash.flatmap');
var inquirer = require('inquirer');
const fs = require('fs');

const places = Object.values(json);
const values = [...new Set(flatmap(places.map(item => Object.keys(item))))];

const questions = [];
values.forEach((place, index) => {
  questions.push(`${place},`);
});
fs.writeFileSync('placenames.csv', questions.join('\n'));
