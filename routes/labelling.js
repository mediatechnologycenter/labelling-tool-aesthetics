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
const mongoose = require('mongoose');

const articles = require(`../models/articles`);
const labellingstatuses = require(`../models/labellingstatuses`);
const {getTokenFromRequest, getCorrectLabellersSchema, getQuerysetFromRequest} = require("./utils");
const labellers = getCorrectLabellersSchema();

const labelledentries = require(`../models/labelledentries`);
const config = require('../config');

function replyWithExistingStatus(status, res) {
    console.log("Already find a status, replying with that one");
    //there is a registered status
    //lean returns an object rather than a mongoose document, needed because we want to modify it
    return articles.findOne({_id: status.article}).lean().exec()
        .then(matchingArticle => {
            if (matchingArticle) {
                return res.json({status: status, article: matchingArticle});
            } else {
                throw new Error("No matching article found for the status of this labeller");
            }
        });
}

function createAndReplyWithNewStatus(res, _labellerID) {
    console.log("Not found any status, initiating a new one");
    //we have to get the next article to be tagged
    //the article should not have been labelled (labelledentries) or in the process of being labelled (labellingstatuses)
    //more than config.interrater.labbellersPerArticle times. To check this we callect all articles who are labbelled
    //more than config.interrater.labbellersPerArticle times.
    const allArticlesNLabellersReachedPromises = [];

    allArticlesNLabellersReachedPromises.push(labellingstatuses.aggregate([
        {
            $group: {
                _id:  "$article",
                count: { "$sum": 1 }
            }
        }]).then(queryRes => queryRes.filter(el => el.count >= config.interrater.labbellersPerArticle)));
    allArticlesNLabellersReachedPromises.push(labelledentries.aggregate([
        {
            $group: {
                _id:  "$article",
                count: { "$sum": 1 }
            }
        }]).then(queryRes => queryRes.filter(el => el.count >= config.interrater.labbellersPerArticle)));

    const allNonValuableArticleIdsPromises = [];
    allNonValuableArticleIdsPromises.push(Promise.all(allArticlesNLabellersReachedPromises)
        .then(idArrays => idArrays.flat())
        .then(countArray => {
            const aggregatedCounts = {};
            countArray.forEach(el => {
                if(el._id in aggregatedCounts){
                    aggregatedCounts[el._id] += el.count;
                } else {
                    aggregatedCounts[el._id] = el.count;
                }
                }
            );
            return Object.keys(aggregatedCounts)
                .filter(articleID => aggregatedCounts[articleID] >= config.interrater.labbellersPerArticle);
        })
        .then(ids => {
            console.log("Ids who have a count bigger than " + config.interrater.labbellersPerArticle);
            console.log(ids);

            //if we want to have multilabeller for all or we have not yet multilabelled enough
            //we return the ids which have been already labelled more than config.interrater.labbellersPerArticle times
            if(config.interrater.multiLabelledArticles === null || ids.length <= config.interrater.multiLabelledArticles) {
                return ids;
            }
            else { //otherwise (we have labelled enough articles with multilabellers(
                //just return the ids which have been already labelled once
                console.log("1 labeller per article reached");
                return Promise.all([
                    labellingstatuses.find({}, {"article": 1}).exec()
                    .then(statuses => statuses.map(el => el.article)),
                    labelledentries.find({}, {"article": 1}).exec()
                        .then(statuses => statuses.map(el => el.article))])
                    .then(idArrays =>  idArrays.flat());
            }
        }));

    //also check that next article is not among the ones he / she already labelled
    //to do this we collect all the ones he already labelled
    allNonValuableArticleIdsPromises.push(labellingstatuses.find({"labeller": _labellerID}, {"article": 1}).exec()
        .then(statuses => statuses.map(el => el.article)));
    allNonValuableArticleIdsPromises.push(labelledentries.find({"labeller": _labellerID}, {"article": 1}).exec()
        .then(statuses => statuses.map(el => el.article)));

    return Promise.all(allNonValuableArticleIdsPromises)
        .then(idArrays => {
            console.log("All excluded ids:");
            console.log(JSON.stringify(idArrays));
            return idArrays.flat()
        })
        //lean returns an object rather than a mongoose document, needed because we want to modify it
        .then(ids => articles.findOne({"_id": {"$nin": ids}}).lean().exec())
        .then(newArticle => {
            if (newArticle === null) {
                return res.status(400).send({
                    message: "Kein Artikel gefunden. Entweder ist die Datenbank leer oder " +
                        "alle Artikel sind beschriftet.",
                    error: null
                });
            }
            //associate labeller to this article and write this in the labellingstatus table
            const newLabellingStatus = labellingstatuses.getDefaultEmptySchema(_labellerID, newArticle);

            return newLabellingStatus.save()
                .then(labstat => {
                    console.log('New labelling status created for ' + labstat.labeller
                        + ' and article' + labstat.article);
                    res.json({status: labstat, article: newArticle});
                })
        });
}

//get the next article to be tagged
router.route('/article').get((req, res) => {
    console.log("labelling/article queried");

    const _labellerID = getTokenFromRequest(req, res);
    console.log(", with labellerID = " + _labellerID);

    if(_labellerID === null) {
        return; //we've already sent the reply communicating the problem
    }

    //check that the labellerID exists
    labellers.findOne({_id: _labellerID})
        .then(queryRes => {
            //if he clicked on the link he confirmed the email
            if(queryRes !== null) {
                return queryRes.update({used: true}).then(() => true);
            }
            return false;
        })
        .then(exists => {
            if(!exists) {
                return res.status(400).send({message: "labellerID existiert nicht in der Datenbank, " +
                        "bitte verwenden Sie eine gültige.",
                    error: null});
            }
            //exists

            //if there is already a labelling status from this labeller we have to return that article
            return labellingstatuses.findOne({labeller: _labellerID}).exec()
                .then(status => {
                    if(status) {
                        return replyWithExistingStatus(status, res);
                    } else {
                        return createAndReplyWithNewStatus(res, _labellerID);
                    }
                });

        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

//get the the number of articles tagged by a certain labeller
router.route('/ntagged').get((req, res) => {
    console.log("labelling/ntagged queried");
    const id = getTokenFromRequest(req, res);

    if(id === null) {
        return; //we've already sent the reply communicating the problem
    }

    return labelledentries.countDocuments({labeller: id}).exec()
        .then(count => {
            console.log("Found count " + count);
            return res.json({count: count})
        })
        .catch(err => {
            console.log(err);
            return res.status(500).send(err);
        });
});

function updateStatus(req, res, updateFunction) {
    return updateFunction()
        .then(() => {
            console.log("Succesfully updated.");
            return res.send('Successfully saved.');
        }).catch(err => {
            console.log(err);
            return res.status(500).send({error: err});
        }).then(() => labellingstatuses.updateLabellingStatusesDate(req.body.labeller, req.body.article));
}

// POST an intermediate result of tagging a stance question on article
router.route('/tag/article/stance').post((req, res) => {
    console.log("labelling/tag/article/stance queried");
    return updateStatus(req, res, () => labellingstatuses.updateStanceArticleQuestionsLabel(req.body.labeller,
        req.body.article, req.body.elemID, req.body.data));
});

// POST an intermediate result of tagging emotion label article level
router.route('/tag/article/emotion').post((req, res) => {
    console.log("labelling/tag/article/emotion queried");
    return updateStatus(req, res, () => labellingstatuses.updateEmotionArticleLabel(req.body.labeller,
        req.body.article, req.body.data));
});

// POST an intermediate result of tagging a paragraph
router.route('/tag/paragraph/emotion').post((req, res) => {
    console.log("labelling/tag/paragraph/emotion queried");
    return updateStatus(req, res, () => labellingstatuses.updateParagraphsEmotionLabel(req.body.labeller,
        req.body.article, req.body.elemID, req.body.data));
});

router.route('/submit').post((req, res) => {
    console.log("labelling/submit queried");

    //reconciliation check between server status and client status
    const data = req.body;

    return labellingstatuses.findOne({
        'labeller': mongoose.Types.ObjectId(req.body.labeller),
        'article': mongoose.Types.ObjectId(req.body.article),
    }).exec().then(queryRes => {
        let newEntry = {...queryRes._doc};
        //allows us to save into the other collection
        newEntry._id = mongoose.Types.ObjectId();

        //make sure what the client posts is what we save by updating the values of the labelling status
        newEntry = Object.assign(newEntry, data);

        newEntry.finishedLabellingDate = Date.now();

        const newLabelledEntry = new labelledentries(newEntry);
        return newLabelledEntry.save().then(() => {
            console.log("Successfully saved.");
            return queryRes.remove().then(() => {
                console.log("Successfully removed labellingstatuses record.");
                res.send('Successfully saved.')
            });
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).send({error: err});
    });
});

//----------------------------------------

//New for aesthetic labelling:

const aesthSchema = new mongoose.Schema({
    labeller: { type: mongoose.Schema.Types.ObjectId, ref: 'labellers', required: true },
    queryset: String,
    rounds: Object,
    currentStart: 'Number',
    currentStop: 'Number'
},
{
    timestamps: true
});

const aesthTable = mongoose.model("aesthtable", aesthSchema);

/*
const example_obj = {"1" : [1,2,-3], "2": [[1,4,6]]};
const example_key = "60053398d444630c8bb11bb4";

const document = new aesthTable({ labeller: example_key, rounds: example_obj });
document.save(function (err) {
  if (err) {
      console.log("Error trying to insert document in table aesthtable");
      return -1;
      //return handleError(err);
  }
  else{
    console.log("Document was successfully inserted into aesthtable");
  }
});
*/

router.route('/aesthetic').get((req, res) => {
    console.log("labelling/aesthetic get queried");

    const _labellerID = getTokenFromRequest(req, res);
    const _queryset = getQuerysetFromRequest(req,res);

    console.log(", with labellerID = " + _labellerID);
    console.log(", with queryset = " + _queryset);

    if(_labellerID === null) {
        return; //we've already sent the reply communicating the problem
    }

    return aesthTable.findOne( { labeller: _labellerID, queryset: _queryset} ).exec()
    .then(doc => {
        console.log("Document findOne succeeded");
        console.log(doc);
        console.log(typeof doc);
            /*doc is : {
                _id: 6006baaf9799fe12521a3934,
                labeller: 60053398d444630c8bb11bb4,
                rounds: { '1': [ 1, 2, -3 ], '2': [ [Array] ] },
                createdAt: 2021-01-19T10:55:43.413Z,
                updatedAt: 2021-01-19T10:55:43.413Z,
                __v: 0
            }
            */
        return res.json(doc); //could be null if does not exist? Yes
        //return doc.json;
        }
    )
    .catch(err => {
        console.log(err);
        return res.status(500).send({error: err});
    });

});

router.route('/aesthetic').post((req, res) => {
    console.log("labelling/aesthetic post request");

    const data_rounds = req.body["rounds"];
    const data_cstart = req.body["currentStart"];
    const data_cstop = req.body["currentStop"];

    const _labellerID = getTokenFromRequest(req, res);
    const _queryset = getQuerysetFromRequest(req,res);
    console.log(", with labellerID = " + _labellerID);
    console.log(", with queryset = " + _queryset);

    console.log(data_rounds);
    console.log(data_cstart);
    console.log(data_cstop);

    if(_labellerID === null) {
        return; //we've already sent the reply communicating the problem
    }

    return aesthTable.updateOne( { labeller: _labellerID, queryset: _queryset }, {rounds: data_rounds, 
                                                            currentStart: data_cstart,
                                                            currentStop: data_cstop}, 
                                                            
                                                            { upsert : true } ).exec() //upsert:true ensures that document gets added if not in db
    .then(queryRes => {
        console.log("Document update succeeded");
        return res.send('Document update succeeded');
        }
    ).catch(err => {
        console.log(err);
        return res.status(500).send({error: err});
    });
});
function isPrivateIP(ip) {
    var parts = ip.split('.');
    return parts[0] === '10' ||
        (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) ||
        (parts[0] === '192' && parts[1] === '168');
}
const _ = require('lodash');
function checkAdminToken(req, res) {
    const reqIp = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '')
        .split(',')[0].trim().replace("::ffff:", "");
    console.log("Request ip = " + reqIp);
    console.log(reqIp === '127.0.0.1');
    if(!(reqIp === '127.0.0.1' || isPrivateIP(reqIp))) {
        //not good to go, either not local host or not inside eth network
        res.status(400).send({error: "Please send the request using the ETHZ VPN"});
        return false;
    }
    const token = _.get(req, "query.token", null);
    if(!token) {
        console.log("No token in query");
        res.status(400).send({error: "Please provide token in query"});
        return false;
    }
    if(!process.env.ADMIN_TOKEN) {
        console.warn("The environment variable ADMIN_TOKEN is not set. Please create a file '.env'" +
            "in the main folder and provide `ADMIN_TOKEN=anyrandomtoken`. Without this specification the " +
            "load of the page adminsashboard will be allowed regardless of the provided token: \n" +
            "** currently the security of the page admindashboard is compromised, this is not suitable for production.");
        return true;
    }
    if(token !== process.env.ADMIN_TOKEN) {
        console.log("Token is not admin token. " + token);
        res.status(400).send({error: "Token is not admin token."});
        return false;
    }
    return true;
}

router.route('/aesthetic_download').get((req, res) => {
    console.log("labelling/aesthetic_download get request");
    if(!checkAdminToken(req, res)) {
        return false;
    }

    return aesthTable.find({}).exec()
    .then(queryRes => {
        console.log("Succesfully authenticated, returning records");
        res.set("Content-Disposition", "attachment; filename=" + aesthTable.collection.collectionName + ".json");
        res.type('application/json');
        res.json(queryRes);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send(err);
    });

});

module.exports = router;