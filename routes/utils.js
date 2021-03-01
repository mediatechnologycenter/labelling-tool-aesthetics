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

const _ = require('lodash');
const mongoose = require('mongoose');

const articles = require(`../models/articles`);
const labelledentries = require(`../models/labelledentries`);
const labellers = getCorrectLabellersSchema();
const labellingstatuses = require(`../models/labellingstatuses`);


function getAllData() {
    const queryPromises = [];
    queryPromises.push(articles.find({}, {articleID: 1}).then(results => {
        return {articles: results}
    }));
    queryPromises.push(labelledentries.find({}).then(results => {
        return {labelledentries: results}
    }));
    queryPromises.push(labellers.find({}).then(results => {
        return {labellers: results}
    }));
    queryPromises.push(labellingstatuses.find({}).then(results => {
        return {labellingstatuses: results}
    }));

    return Promise.all(queryPromises)
        .then(arrOfObjects => Object.assign({}, ...arrOfObjects)); //just flattens the objects
}

function millisecToString(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours !== "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}

function getTokenFromRequest(req, res) {
    let labellerID = _.get(req, "query.labellerID", null);
    if(!labellerID) {
        console.log("Please provide labellerID in query");
        res.status(400).send({message: "Bitte geben Sie die labellerID in der Anfrage"});
        return null;
    }

    //convert to mongooseID and check it is valid id
    let _labellerID;
    try {
        _labellerID = mongoose.Types.ObjectId(labellerID)
    } catch (err) {
        console.log("labellerID is not a valid mongoose ID");
        res.status(400).send({message: "labellerID ist keine gültige mongoose ID", error: err});
        return null;
    }
    return _labellerID;
}

function getQuerysetFromRequest(req, res) {
    let queryset_name = _.get(req, "query.queryset", null);
    if(!queryset_name) {
        console.log("Please provide queryset in query");
        res.status(400).send({message: "Please provide queryset in query"});
        return null;
    }
    return queryset_name;
}

function getCorrectLabellersSchema() {
    if(process.env.REACT_APP_AUTOMATIC_REGISTRATION) {
        console.log("Using labellers with info");
        return require('../models/labellerswithinfo.js');
    }
    console.log("Using labellers without info");
    return require('../models/labellers.js');
}

module.exports.getAllData = getAllData;
module.exports.millisecToString = millisecToString;
module.exports.getTokenFromRequest = getTokenFromRequest;
module.exports.getCorrectLabellersSchema = getCorrectLabellersSchema;

module.exports.getQuerysetFromRequest = getQuerysetFromRequest;