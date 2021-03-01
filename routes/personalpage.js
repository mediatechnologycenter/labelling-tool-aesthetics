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

const router = require('express').Router();
const config = require( "../config");

const labelledentries = require(`../models/labelledentries`);
const {getTokenFromRequest} = require("./utils");


router.route('/info').get((req, res) => {
    console.log("personalpage/info queried");
    const _labellerID = getTokenFromRequest(req, res);
    console.log(", with labellerID = " + _labellerID);

    if(_labellerID === null) {
        return; //we've already sent the reply communicating the problem
    }

    const queryPromises = [];

    queryPromises.push(labelledentries.countDocuments({labeller: _labellerID}).exec()
        .then(c => {return {nTaggedArticles: c, money: config.moneyPerArticle*c}}));
    //
    // queryPromises.push(labellers.findOne({_id: _labellerID}).exec()
    //     .then(c => {return {name: c.name, surname: c.surname}}));

    return Promise.all(queryPromises)
        .then(arrOfObjects => Object.assign({}, ...arrOfObjects)) //just flattens the objects
        .then(infos => res.json({infos}))
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


//----------------------------------------

module.exports = router;