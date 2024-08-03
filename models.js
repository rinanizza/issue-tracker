'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Issue Schema
const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on:  Date,
  updated_on:  Date, 
  created_by: { type: String, required: true },
  assigned_to: String,
  open:  Boolean,
  status_text: String, 
});

// Define the Project Schema
const projectSchema = new Schema({
  name: { type: String, required: true }, 
  issues: [issueSchema] // Embeds the Issue Schema as an array
});

// Create and export the models
const Issue = mongoose.model('Issue', issueSchema);
const Project = mongoose.model('Project', projectSchema);

module.exports = { Issue, Project };

