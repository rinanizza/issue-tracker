'use strict';

const mongoose = require('mongoose');
const IssueModel = require('../models').Issue;
const ProjectModel = require('../models').Project;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(async function (req, res) {
      const projectName = req.params.project;
      const query = req.query;

      try {
        const project = await ProjectModel.findOne({ name: projectName }).exec();

        if (!project) {
          return res.json({ project: projectName, issues: [] });
        }

        const filter = {};
        Object.keys(query).forEach(key => {
          filter[key] = query[key];
        });

        const issues = await IssueModel.find(filter).exec();

        res.json({ project: projectName, issues });
      } catch (err) {
        res.status(500).json({ error: 'Error retrieving issues' });
      }
    })

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

    .put(async function (req, res) {
      const projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

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

        const updateFields = {};
        if (issue_title) updateFields.issue_title = issue_title;
        if (issue_text) updateFields.issue_text = issue_text;
        if (created_by) updateFields.created_by = created_by;
        if (assigned_to) updateFields.assigned_to = assigned_to;
        if (status_text) updateFields.status_text = status_text;
        if (open !== undefined) updateFields.open = open === 'true';

        issue.set(updateFields);
        issue.updated_on = new Date();
        await project.save();
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    .delete(async function (req, res) {
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