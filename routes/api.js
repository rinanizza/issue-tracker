"use strict";
const mongoose = require("mongoose");
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(async function (req, res) {
  let projectName = req.params.project;
  //?open=true&assigned_to=Joe
  const {
    _id,
    open,
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text,
  } = req.query;

  const pipeline = [
    { $match: { name: projectName } },
    { $unwind: "$issues" },
  ];

  if (_id!= undefined) {
    pipeline.push({ $match: { "issues._id": ObjectId(_id) } });
  }
  if (open!= undefined) {
    pipeline.push({ $match: { "issues.open": open } });
  }
  if (issue_title!= undefined) {
    pipeline.push({ $match: { "issues.issue_title": issue_title } });
  }
  if (issue_text!= undefined) {
    pipeline.push({ $match: { "issues.issue_text": issue_text } });
  }
  if (created_by!= undefined) {
    pipeline.push({ $match: { "issues.created_by": created_by } });
  }
  if (assigned_to!= undefined) {
    pipeline.push({ $match: { "issues.assigned_to": assigned_to } });
  }
  if (status_text!= undefined) {
    pipeline.push({ $match: { "issues.status_text": status_text } });
  }

  try {
    const data = await ProjectModel.aggregate(pipeline).exec();
    if (!data) {
      res.json([]);
    } else {
      const mappedData = data.map((item) => item.issues);
      res.json(mappedData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

    .post(function (req, res) {
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      const newIssue = new IssueModel({
        issue_title: issue_title || "",
        issue_text: issue_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by || "",
        assigned_to: assigned_to || "",
        open: true,
        status_text: status_text || "",
      });
      ProjectModel.findOne({ name: project }, (err, projectdata) => {
        if (!projectdata) {
          const newProject = new ProjectModel({ name: project });
          newProject.issues.push(newIssue);
          newProject.save((err, data) => {
            if (err || !data) {
              res.send("There was an error saving in post");
            } else {
              res.json(newIssue);
            }
          });
        } else {
          projectdata.issues.push(newIssue);
          projectdata.save((err, data) => {
            if (err || !data) {
              res.send("There was an error saving in post");
            } else {
              res.json(newIssue);
            }
          });
        }
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
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
        res.json({ error: "missing _id" });
        return;
      }
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }

      ProjectModel.findOne({ name: project }, (err, projectdata) => {
        if (err || !projectdata) {
          res.json({ error: "could not update", _id: _id });
        } else {
          const issueData = projectdata.issues.id(_id);
          if (!issueData) {
            res.json({ error: "could not update", _id: _id });
            return;
          }
          issueData.issue_title = issue_title || issueData.issue_title;
          issueData.issue_text = issue_text || issueData.issue_text;
          issueData.created_by = created_by || issueData.created_by;
          issueData.assigned_to = assigned_to || issueData.assigned_to;
          issueData.status_text = status_text || issueData.status_text;
          issueData.updated_on = new Date();
          issueData.open = open;
          projectdata.save((err, data) => {
            if (err || !data) {
              res.json({ error: "could not update", _id: _id });
            } else {
              res.json({ result: "successfully updated", _id: _id });
            }
          });
        }
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      ProjectModel.findOne({ name: project }, (err, projectdata) => {
        if (!projectdata || err) {
          res.send({ error: "could not delete", _id: _id });
        } else {
          const issueData = projectdata.issues.id(_id);
          if (!issueData) {
            res.send({ error: "could not delete", _id: _id });
            return;
          }
          issueData.remove();

          projectdata.save((err, data) => {
            if (err || !data) {
              res.json({ error: "could not delete", _id: issueData._id });
            } else {
              res.json({ result: "successfully deleted", _id: issueData._id });
            }
          });
        }
      });
    });
};