// Copyright 2021 ETH Zurich, Media Technology Center
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require('fs');
let path = '.env';
try {
    if (!fs.existsSync(path)) {
        path = "../.env"
    }
} catch(err) {
    console.error(err);
}

require('dotenv').config({path: path});

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || "mongodb://localhost/labelling_tool";

mongoose.connect(uri, {useNewUrlParser:true, useCreateIndex: true, useUnifiedTopology:true});

const connection = mongoose.connection;

let articlesJson = require(`../json/articles_examples`);

//insert consecutive ids for paragraphs
articlesJson = articlesJson
    .map(article => {
        article.paragraphs = article.paragraphs.map((par, index) => {
            return {consecutiveID: index, text: par};
        });

        if(!article.stanceQuestions) {
            article.stanceQuestions = [{"ID": -1, text: "Is the article in favour or against the topic it is talking about?"}]
        }

        return article;
    });

connection.once("open", () => {
    console.log("MongoDB database connection established successfully");

    const articles = require(`../models/articles`);

    console.log("Creating database");
    connection.db.listCollections({name: 'articles'})
        .next(function(err, collinfo) {
            console.log("Collection articles");
            if (collinfo) {
                console.log("already exists, updating instead");
                // articles.find({}).exec((err, res) => console.log(JSON.stringify(res)));
                const allPromises = [];
                articlesJson.forEach(art => {
                    allPromises.push(articles.findOneAndUpdate({articleID: art.articleID}, art).exec());
                });
                Promise.all(allPromises)
                    .then(() => console.log("Updated succesfully"))
                    .catch(err => console.log(err));
            } else {
                console.log("doesn't exist, creating it");

                articles.insertMany(articlesJson, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("SUCCESS, inserted " + articlesJson.length + " articles");
                    }
                });
            }
        });

    const addAlsoLabellers = false;
    if(addAlsoLabellers) {
        const {getCorrectLabellersSchema} = require("../routes/utils");
        const labellers = getCorrectLabellersSchema();
        connection.db.listCollections({name: 'labellers'})
            .next(function(err, collinfo) {
                console.log("Collection articles");
                if (collinfo) {
                    console.log("labellers already exists");
                } else {
                    console.log("labellers doesn't exist, attempting to create it");

                    try {
                        const labellersJson = require(`../json/labellers`);
                        labellers.insertMany(labellersJson, function(err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("SUCCESS, inserted " + labellersJson.length + " labellers");
                            }
                        });
                    } catch (ex) {
                        console.log("Cannot find file ./json/labellers.json, no labellers were added");
                    }
                }
            });
    }
});