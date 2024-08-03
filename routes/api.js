'use strict';

const mongoose = require('mongoose');
const IssueModel = require('../models').Issue;
const ProjectModel = require('../models').Project;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
  app.route('/api/issues/:project')
    
    // Handle GET requests
    .get(async function (req, res) {
      const projectName = req.params.project;
      const { 
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.query;

      try {
        const project = await ProjectModel.findOne({ name: projectName }).exec();

        if (!project) {
          return res.json({ project: projectName, issues: [] });
        }

        let query = { $match: {} };
        if (_id) query = { $match: { _id: ObjectId(_id) } };
        if (open) query = { $match: { open: open === 'true' } };
        if (issue_title) query = { $match: { issue_title } };
        if (issue_text) query = { $match: { issue_text } };
        if (created_by) query = { $match: { created_by } };
        if (assigned_to) query = { $match: { assigned_to } };
        if (status_text) query = { $match: { status_text } };

        const issues = project.issues.filter(issue => {
          return (
            (!query.$match._id || issue._id.toString() === query.$match._id.toString()) &&
            (!query.$match.open || issue.open === query.$match.open) &&
            (!query.$match.issue_title || issue.issue_title === query.$match.issue_title) &&
            (!query.$match.issue_text || issue.issue_text === query.$match.issue_text) &&
            (!query.$match.created_by || issue.created_by === query.$match.created_by) &&
            (!query.$match.assigned_to || issue.assigned_to === query.$match.assigned_to) &&
            (!query.$match.status_text || issue.status_text === query.$match.status_text)
          );
        });

        res.json({ project: projectName, issues });
      } catch (err) {
        res.status(500).json({ error: 'Error retrieving issues' });
      }
    })
    
    // Handle POST requests
    .post(async function (req, res) {
      const projectName = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new IssueModel({
        issue_title,
        issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by,
        assigned_to: assigned_to || '',
        open: true,
        status_text: status_text || '',
      });

      try {
        let project = await ProjectModel.findOne({ name: projectName }).exec();

        if (!project) {
          project = new ProjectModel({ name: projectName });
        }

        project.issues.push(newIssue);
        await project.save();
        res.json(newIssue);
      } catch (err) {
        res.status(500).json({ error: 'There was an error saving the issue' });
      }
    })
    
    // Handle PUT requests
    .put(async function (req, res) {
      const projectName = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        open === undefined
      ) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      try {
        let project = await ProjectModel.findOne({ name: projectName }).exec();

        if (!project) {
          return res.json({ error: 'could not update', _id });
        }

        const issue = project.issues.id(_id);

        if (!issue) {
          return res.json({ error: 'could not update', _id });
        }

        if (issue_title) issue.issue_title = issue_title;
        if (issue_text) issue.issue_text = issue_text;
        if (created_by) issue.created_by = created_by;
        if (assigned_to) issue.assigned_to = assigned_to;
        if (status_text) issue.status_text = status_text;
        if (open !== undefined) issue.open = open === 'true';

        issue.updated_on = new Date();
        await project.save();
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })
    
   // Handle DELETE requests
app.delete('/api/issues/:projectName', async function (req, res) {
  const { projectName } = req.params; // Correctly extract projectName from params
  const { _id } = req.body;

  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  try {
    // Find the project by name
    let project = await ProjectModel.findOne({ name: projectName }).exec();

    if (!project) {
      return res.json({ error: 'could not delete', _id });
    }

    // Find the issue by _id in the project
    const issueIndex = project.issues.findIndex(issue => issue._id.toString() === _id);

    if (issueIndex === -1) {
      return res.json({ error: 'could not delete', _id });
    }

    // Remove the issue
    project.issues.pull({ _id });

    // Save the updated project
    await project.save();

    // Send success response
    res.json({ result: 'successfully deleted', _id });
  } catch (err) {
    // Handle errors and send appropriate response
    res.json({ error: 'could not delete', _id });
  }
});
};
