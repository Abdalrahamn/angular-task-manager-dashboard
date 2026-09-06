#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const tasksFile = JSON.parse(fs.readFileSync(path.join(__dirname, 'tasks.json'), 'utf8'));
const statisticsFile = JSON.parse(fs.readFileSync(path.join(__dirname, 'statistics.json'), 'utf8'));

if (!Array.isArray(tasksFile.tasks)) {
  throw new Error('tasks.json must contain a tasks array');
}

if (!Array.isArray(statisticsFile.statistics)) {
  throw new Error('statistics.json must contain a statistics array');
}

const db = {
  tasks: tasksFile.tasks,
  statistics: statisticsFile.statistics,
};

fs.writeFileSync(path.join(__dirname, 'db.json'), `${JSON.stringify(db, null, 2)}\n`, 'utf8');

console.log(
  `Prepared db.json with ${db.tasks.length} tasks and ${db.statistics.length} statistics.`,
);
