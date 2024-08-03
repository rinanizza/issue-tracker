'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Issue Schema
const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: '' }
});

// Define the Project Schema
const projectSchema = new Schema({
  name: { type: String, required: true, unique: true },
  issues: [issueSchema] // Embeds the Issue Schema as an array
});

// Create and export the models
const Issue = mongoose.model('Issue', issueSchema);
const Project = mongoose.model('Project', projectSchema);

module.exports = { Issue, Project };


