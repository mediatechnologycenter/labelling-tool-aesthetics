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
const _ = require('lodash');
const mongoose = require('mongoose');
const {getCorrectLabellersSchema} = require("./utils");

const labellers = getCorrectLabellersSchema();


//get the next article to be tagged
router.route('/valid').get((req, res) => {
    const token = _.get(req, "query.token", null);
    console.log("authenticatelabeller/valid queried, with token = " + token);

    if(!token) {
        console.log("No token provided.");
        return res.status(400).send({error: "Please provide token in query"});
    }
    //convert to mongooseID and check it is valid id
    let _labellerID;
    try {
        _labellerID = mongoose.Types.ObjectId(token);
    } catch (err) {
        console.log("Not a mongoose id.");
        return res.json({valid: false, message: "Das Token ist kein gültiger Bezeichner." +
                " Überprüfen Sie seine Richtigkeit und versuchen Sie es erneut."});
    }

    return labellers.findOne({_id: _labellerID}).exec()
        .then(queryRes => {
            if(!queryRes) {
                console.log("Labeller not registered or not found.");
                return res.json({valid: false, message: "Beschrifter nicht registriert oder nicht " +
                        "gefunden, bitte versuchen Sie es erneut."});
            }
            console.log("Labeller found. OK.");
            return res.json({valid: true, message: "OK."});
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


//----------------------------------------

module.exports = router;