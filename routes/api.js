/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const expect = require("chai").expect;
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw new Error("Couldn't connect to the database");
        else {
          db.collection("books")
            .find({})
            .toArray()
            .then(docArr => {
              res.json(docArr);
            })
            .catch(err => {
              res.status(500).send("Something went wrong! No books were found");
              throw new Error("No books were found");
            });
        }
      });
    })

    .post(function (req, res) {
      const title = req.body.title;
      if(!title) {
        res.status(500).send("Please provide a title");
        throw new Error("No title sent");
      }
      let newBook = {
        title,
        commentcount: 0,
        comments: [],
      };
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw new Error("Couldn't connect to the database");
        else {
          db.collection("books")
            .insertOne(newBook)
            .then(doc => {
              return db
                .collection("books")
                .findOne({ _id: doc.insertedId })
                .then(doc => {
                  res.json(doc);
                });
            })
            .catch(err => {
              res.status(500).send("Something went wrong! The book couldn't be created");
              throw new Error("Couldn't create the book");
            });
        }
      });
    })

    .delete(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw new Error("Couldn't connect to the database");
        else {
          db.collection("books")
            .drop()
            .then(result => {
              if(result) res.send("complete delete successful");
              else throw new Error();
            })
            .catch(err => {
              res.send("Something went wrong! The books couldn't be deleted");
              throw new Error("The book collection wasn't dropped");
            });
        }
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res, next) {
      const bookid = new ObjectId(req.params.id);
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw new Error("Couldn't connect to the database");
        else {
          db.collection("books")
            .findOne({ _id: bookid })
            .then(doc => {
              if (!doc) throw new Error();
              res.json(doc);
            })
            .catch(err => {
              res.send("no book exists");
            });
        }
      });
    })

    .post(function (req, res) {
      const bookid = new ObjectId(req.params.id);
      const comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw new Error("Couldn't connect to the database");
        else {
          db.collection("books")
            .findOneAndUpdate(
              { _id: bookid },
              { $inc: { commentcount: 1 }, $push: { comments: comment } },
              { returnOriginal: false }
            )
            .then(result => {
              if (!result.lastErrorObject.updatedExisting) throw new Error();
              res.json(result.value);
            })
            .catch(err => {
              res.status(500).send("Something went wrong! That book wasn't updated");
              throw new Error("No books were updated");
            });
        }
      });
    })

    .delete(function (req, res) {
      const bookid = new ObjectId(req.params.id);
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw new Error("Couldn't connect to the database");
        else {
          db.collection("books")
            .findOneAndDelete({ _id: bookid })
            .then(result => {
              if (!result.value) throw new Error();
              res.send("delete successful");
            })
            .catch(err => {
              res.send("Something went wrong! That book wasn't updated");
              throw new Error("No books were updated");
            });
        }
      });
    });
};
