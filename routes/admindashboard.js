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
const mathjs = require("mathjs");
const config = require( "../config");

const labelledentries = require(`../models/labelledentries`);
const {getAllData, millisecToString, getCorrectLabellersSchema} = require("./utils");
const labellers = getCorrectLabellersSchema();
const articles = require(`../models/articles`);

function isPrivateIP(ip) {
    var parts = ip.split('.');
    return parts[0] === '10' ||
        (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) ||
        (parts[0] === '192' && parts[1] === '168');
}

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

function flattenLabelledEntriesToCsv() {
    const header = ["articleID", "labeller", "type of tag", "label", "intensity", "notSure"];
    const lines = [];
    return labelledentries.find({}).exec()
        .then(entries => {
           entries.forEach(entry => {
               entry.paragraphsEmotionLabel.forEach((label, parKey) =>
                   lines.push([entry.articleID, entry.labeller, "paragraph " + parKey,
                       getUniqueEmotionRepresentation(label.label), label.intensity, label.notSure]));
               lines.push([entry.articleID, entry.labeller, "emotion article",
                   getUniqueEmotionRepresentation(entry.emotionArticleLabel.label), entry.emotionArticleLabel.intensity, entry.emotionArticleLabel.notSure]);
               entry.stanceArticleQuestionsLabel.forEach((label, questionID) =>
                   lines.push([entry.articleID, entry.labeller, "stance question " + questionID,
                       getUniqueStanceRepresentation(label.label), "N.a.", label.notSure]));
           });

            function compare( a, b ) {
                const compareTwo = (fieldA, fieldB) => String(fieldA).localeCompare(fieldB);

                const order = [0,2,1];
                for(let i of order) {
                    const res = compareTwo(a[i],b[i]);
                    if (res !== 0){
                        return res;
                    }
                }
                return 0;
            }

            lines.sort(compare);

            return header.join(",") + "\r\n" +
                lines.map(line => line.map(entry => JSON.stringify(entry)).join(",")).join('\r\n')
                +"\r\n";
        });
}

function replyWithDowloadableTable(res, mongooseModel) {
    console.log(mongooseModel.collection.collectionName);
    return mongooseModel.find({})
        .then(queryRes => {
            console.log("Succesfully authenticated, returning records");
            res.set("Content-Disposition", "attachment; filename=" + mongooseModel.collection.collectionName + ".json");
            res.type('application/json');
            res.json(queryRes);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
}

router.route('/labelledentries').get((req, res) => {
    console.log("admindashboard/labelledentries queried");
    if(!checkAdminToken(req, res)) {
        return false;
    }
    return replyWithDowloadableTable(res, labelledentries);
});

router.route('/labelledentriescsv').get((req, res) => {
    console.log("admindashboard/labelledentriescsv queried");
    if(!checkAdminToken(req, res)) {
        return false;
    }
    return flattenLabelledEntriesToCsv()
        .then(queryRes => {
            console.log("Succesfully authenticated, returning records");
            res.set("Content-Disposition", "attachment; filename=labelledentries.csv");
            res.type('application/json');
            res.json(queryRes);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

router.route('/gentoken').get((req, res) => {
    console.log("admindashboard/gentoken queried");
    if(!checkAdminToken(req, res)) {
        return false;
    }
    const newLabeller = new labellers({
        used: false
    });

    return newLabeller.save()
        .then(savedObject => savedObject._id)
        .then(idToken => res.json({token: idToken}));
});

router.route('/labellers').get((req, res) => {
    console.log("admindashboard/labellers queried");
    if(!checkAdminToken(req, res)) {
        return false;
    }
    return replyWithDowloadableTable(res, labellers);
});

router.route('/articles').get((req, res) => {
    if(!checkAdminToken(req, res)) {
        return false;
    }
    return replyWithDowloadableTable(res, articles);
});

router.route('/all').get((req, res) => {
    console.log("admindashboard/labelledentries queried");
    if(!checkAdminToken(req, res)) {
        return false;
    }
    return getAllData().then(queryRes => {
        console.log("Succesfully authenticated, returning records");
        res.set("Content-Disposition", "attachment; filename=all.json");
        res.type('application/json');
        res.json(queryRes);
    })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});

function getTaggingTimeStatistics() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const resultMap = {};
            const nonNullEntries = entries
                .filter((entry) => entry.finishedLabellingDate !== null && entry.finishedLabellingDate !== undefined
                    && entry.firstLabelledEnteredDate !== null && entry.firstLabelledEnteredDate !== undefined);

            const totalTime = nonNullEntries
                .map((entry) => entry.finishedLabellingDate - entry.firstLabelledEnteredDate)
                .reduce((a, b) => a + b, 0);

            const averageTime =  totalTime / nonNullEntries.length;
            if (averageTime === null || averageTime === undefined || isNaN(averageTime) || averageTime < 0) {
                resultMap.averageTaggingTime = "Not computable";
            }
            resultMap.averageTaggingTime = millisecToString(averageTime);

            const totalParagraphs = nonNullEntries
                .map((entry) => entry.paragraphsEmotionLabel.size)
                .reduce((a, b) => a + b, 0);

            const averageTimePerParagraph = totalTime / totalParagraphs;
            if (averageTimePerParagraph === null || averageTimePerParagraph === undefined ||
                isNaN(averageTimePerParagraph) || averageTimePerParagraph < 0) {
                resultMap.averageTaggingTimePerParagraph = "Not computable";
            }
            resultMap.averageTaggingTimePerParagraph = millisecToString(averageTimePerParagraph);

            return resultMap;
        });
}

function getNotSureStatistics() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const resultMap = {};
            let nParagraphs = 0;
            let nArticles = 0;
            let nParagraphsNotSure = 0;
            let nEmotionArticlesNotSure = 0;
            let nStanceQuestions = 0;
            let nStanceQuestionsNotSure = 0;

            entries.forEach(entry => {
               nArticles++;
               //not sure paragraphs
               entry.paragraphsEmotionLabel.forEach((parTag) => {
                   nParagraphs++;
                   if(parTag.notSure) {
                       nParagraphsNotSure++;
                   }
               });

               //not sure global emotion of article
                if(entry.emotionArticleLabel.notSure) {
                    nEmotionArticlesNotSure++;
                }

                //not sure stance of article
                entry.stanceArticleQuestionsLabel.forEach((questTag) => {
                    nStanceQuestions++;
                    if(questTag.notSure) {
                        nStanceQuestionsNotSure++;
                    }
                });
            });

            resultMap.notSureParagraphsPercentage = nParagraphsNotSure / nParagraphs * 100.0;
            resultMap.notSureEmotionArticlePercentage = nEmotionArticlesNotSure / nArticles * 100.0;
            resultMap.notSureStanceArticlePercentage = nStanceQuestionsNotSure / nStanceQuestions * 100.0;

            return resultMap;
        });
}

function getChangedIdeaStatistics() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const resultMap = {};
            let nParagraphs = 0;
            let nArticles = 0;
            let nParagraphsChanged = 0;
            let nEmotionArticlesChanged = 0;
            let nStanceQuestions = 0;
            let nStanceQuestionsChanged = 0;

            function didChangeIdea(history, final) {
                let nClicksUsed = history.length;

                //if he clicked on notSure this means he had to do two clicks to reach a worthy state
                if(final.notSure) {
                    nClicksUsed--;
                }

                //if he selected a normal emotion and not "purely factual"
                //this means he had to do two clicks to reach a worthy state
                if(final.intensity !== undefined && final.intensity !== null && final.intensity !== -1) {
                    nClicksUsed--;
                }
                if(nClicksUsed < 0) {
                    console.log("ERROR: nClicksUsed negative!")
                }

                return nClicksUsed > 0;
            }

            entries.forEach(entry => {
                nArticles++;
                //paragraphs
                entry.paragraphsEmotionLabelHistory.forEach((parHistory, parKey) => {
                    nParagraphs++;
                    if(didChangeIdea(parHistory, entry.paragraphsEmotionLabel.get(parKey))) {
                        nParagraphsChanged++;
                    }
                });

                //emotion of article
                if(didChangeIdea(entry.emotionArticleLabelHistory,
                    entry.emotionArticleLabel)) {
                    nEmotionArticlesChanged++;
                }

                //stance of article
                entry.stanceArticleQuestionsLabelHistory.forEach((questHistory, questKey) => {
                    nStanceQuestions++;
                    if(didChangeIdea(questHistory, entry.stanceArticleQuestionsLabel.get(questKey))) {
                        nStanceQuestionsChanged++;
                    }
                });
            });

            resultMap.changedIdeaParagraphsPercentage = nParagraphsChanged / nParagraphs * 100.0;
            resultMap.changedIdeaEmotionArticlePercentage = nEmotionArticlesChanged / nArticles * 100.0;
            resultMap.changedIdeaStanceArticlePercentage = nStanceQuestionsChanged / nStanceQuestions * 100.0;

            return resultMap;
        });
}

const uniqueStanceRepresentation = new Map();
uniqueStanceRepresentation.set("gegen", "Nein, gegen");
uniqueStanceRepresentation.set("dafür", "Ja, dafür");
uniqueStanceRepresentation.set("diskutierend", "Diskutierend");
uniqueStanceRepresentation.set("nicht verwandt", "Kein Bezug");

function getUniqueStanceRepresentation(stanceLabel) {
    return uniqueStanceRepresentation.get(stanceLabel) || stanceLabel;
}

const uniqueEmotionRepresentation = new Map();
uniqueEmotionRepresentation.set("Erwartung", "Antizipation");
uniqueEmotionRepresentation.set("Empörung", "Ekel");
uniqueEmotionRepresentation.set("Wut", "Ärger");

function getUniqueEmotionRepresentation(emotionLabel) {
    return uniqueEmotionRepresentation.get(emotionLabel) || emotionLabel;
}

function computeDisagreementEmotionLabel(entries) {
    let oneDisagreesEmotionLabel = false;
    for (let i = 1; i < entries.length; i++) {
        oneDisagreesEmotionLabel = oneDisagreesEmotionLabel ||
            getUniqueEmotionRepresentation(entries[i - 1].label) !==
            getUniqueEmotionRepresentation(entries[i].label);
        if (oneDisagreesEmotionLabel) {
            break;
        }
    }

    let oneDisagreesEmotionIntensity = false;
    const validIntensities = entries.map(entry => entry.intensity).filter(intensity => intensity !== -1);
    for (let i = 1; i < validIntensities.length; i++) {
        oneDisagreesEmotionIntensity = oneDisagreesEmotionIntensity ||
                validIntensities[i - 1] !== validIntensities[i];
        if (oneDisagreesEmotionIntensity) {
            break;
        }
    }

    return [oneDisagreesEmotionLabel, oneDisagreesEmotionIntensity];
}

function computeDisagreementStanceQuestionLabel(entries) {
    let oneDisagreesStanceLabelArticle = false;
    for(let i = 1; i < entries.length; i++) {
        oneDisagreesStanceLabelArticle = oneDisagreesStanceLabelArticle ||
            getUniqueStanceRepresentation(entries[i-1].label)
            !== getUniqueStanceRepresentation(entries[i].label);
        if(oneDisagreesStanceLabelArticle) {
            break;
        }
    }

    return oneDisagreesStanceLabelArticle;
}

function groupByArticle(entries) {
    const groupedByArticle = {};
    entries.forEach(entry => {
        if (entry.articleID in groupedByArticle) {
            groupedByArticle[entry.articleID].push(entry);
        } else {
            groupedByArticle[entry.articleID] = [entry];
        }
    });
    return groupedByArticle;
}

function getInterraterStatistics() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const groupedByArticle = groupByArticle(entries);
            let nUniqueArticles = 0;
            let nUniqueParagraphs = 0;
            let nUniqueStanceQuestions = 0;
            let nAtLeastOneDisagreesEmotionLabelParagraphs = 0;
            let nAtLeastOneDisagreesIntensityParagraphs = 0;
            let nPerfectAgreementEmotionParagraphs = 0;
            let nAtLeastOneDisagreesEmotionLabelArticles = 0;
            let nAtLeastOneDisagreesEmotionIntensityArticles = 0;
            let nPerfectAgreementEmotionArticles = 0;
            let nAtLeastOneDisagreesStanceLabelArticles = 0;
            //let nPerfectAgreementStanceLabelArticles = 100 - %nAtLeastOneDisagreesStanceLabelArticles;

            for (const [_, byArticle] of Object.entries(groupedByArticle)) {
                const paragraphs = [];
                const emotionArticles = [];
                const stanceArticles = [];
                nUniqueArticles++;
                //order / group by paragraph
                byArticle.forEach(entry => {
                    let i = 0;
                    entry.paragraphsEmotionLabel.forEach(label => {
                        if(paragraphs.length <= i) {
                            paragraphs.push([]);
                            nUniqueParagraphs++;
                        }
                        paragraphs[i].push(label);
                        i++;
                    });
                    emotionArticles.push(entry.emotionArticleLabel);
                    i = 0;
                    entry.stanceArticleQuestionsLabel.forEach(label => {
                        if(stanceArticles.length <= i) {
                            stanceArticles.push([]);
                            nUniqueStanceQuestions++;
                        }
                        stanceArticles[i].push(label);
                        i++;
                    });
                });
                paragraphs.forEach(samePars => {
                    const [oneDisagreesLabel, oneDisagreesIntensity] = computeDisagreementEmotionLabel(samePars);
                    if(oneDisagreesLabel) {
                        nAtLeastOneDisagreesEmotionLabelParagraphs++;
                    }
                    if(oneDisagreesIntensity) {
                        nAtLeastOneDisagreesIntensityParagraphs++;
                    }
                    if(!oneDisagreesLabel && !oneDisagreesIntensity) {
                        nPerfectAgreementEmotionParagraphs++;
                    }
                });
                const [oneDisagreesEmotionLabelArticle, oneDisagreesEmotionIntensityArticle] =
                    computeDisagreementEmotionLabel(emotionArticles);
                if(oneDisagreesEmotionLabelArticle) {
                    nAtLeastOneDisagreesEmotionLabelArticles++;
                }
                if(oneDisagreesEmotionIntensityArticle) {
                    nAtLeastOneDisagreesEmotionIntensityArticles++;
                }
                if(!oneDisagreesEmotionLabelArticle && !oneDisagreesEmotionIntensityArticle) {
                    nPerfectAgreementEmotionArticles++;
                }

                stanceArticles.forEach(sameStanceQuestions => {
                    const oneDisagreesLabel = computeDisagreementStanceQuestionLabel(sameStanceQuestions);
                    if(oneDisagreesLabel) {
                        nAtLeastOneDisagreesStanceLabelArticles++;
                    }
                });
            }

            return {
                percAtLeastOneDisagreesEmotionLabelParagraphs: nAtLeastOneDisagreesEmotionLabelParagraphs / nUniqueParagraphs * 100.0,
                percAtLeastOneDisagreesEmotionIntensityParagraphs: nAtLeastOneDisagreesIntensityParagraphs / nUniqueParagraphs * 100.0,
                percPerfectAgreementEmotionParagraphs: nPerfectAgreementEmotionParagraphs / nUniqueParagraphs * 100.0,

                percAtLeastOneDisagreesEmotionLabelArticles: nAtLeastOneDisagreesEmotionLabelArticles / nUniqueArticles * 100.0,
                percAtLeastOneDisagreesEmotionIntensityArticles: nAtLeastOneDisagreesEmotionIntensityArticles / nUniqueArticles * 100.0,
                percPerfectAgreementEmotionArticles: nPerfectAgreementEmotionArticles / nUniqueArticles * 100.0,

                percAtLeastOneDisagreesStanceArticles: nAtLeastOneDisagreesStanceLabelArticles / nUniqueStanceQuestions * 100.0
            }
        });
}

function computeFleissK(fleissTable) {
    //remove rows in which only one labeller assigned labels:
    fleissTable = fleissTable.filter(row => Object.keys(row).map(rowKey => row[rowKey]).reduce((a, b) => a + b, 0) > 1);
    const nSubjects = fleissTable.length;
    if(nSubjects === 0) {
        console.log("Only one labeller, fleiss K is set to 1");
        return 1.0;
    }
    const keys = Object.keys(fleissTable[0]);

    const totalVotesAssigned = fleissTable.map(row =>
        Object.keys(row).map(rowKey => row[rowKey]).reduce((a, b) => a + b, 0))
        .reduce((a, b) => a + b, 0);


    // sum of cols
    const Pe = keys.map(emotion => {
        let emotionCount = 0;
        fleissTable.forEach(row => emotionCount += row[emotion]);
        return emotionCount / totalVotesAssigned;
    })
        .map(colSum => colSum * colSum)
        .reduce((a, b) => a + b, 0);
    //sum of rows
    const P = fleissTable.map(row => {
            const rowTotal = Object.keys(row).map(rowKey => row[rowKey]).reduce((a, b) => a + b, 0);
            const squaredThenTotal = Object.keys(row).map(rowKey => row[rowKey] * row[rowKey]).reduce((a, b) => a + b, 0);
            return (squaredThenTotal - rowTotal) / (rowTotal * (rowTotal - 1));
        })
            .reduce((a, b) => a + b, 0)
        / nSubjects;
    return (P - Pe) / (1 - Pe);
}

function getEmptyFleissEmotionLabelRow() {
    return Object.assign({}, ...config.emotionsWithFactual.map(emotion => {return {[emotion]: 0};}));
}

function getEmptyFleissEmotionIntensityRow() {
    return Object.assign({}, ...config.emotionIntensities.map(intensity => {return {[intensity]: 0};}));
}

function getEmptyFleissStanceLabelRow() {
    return Object.assign({}, ...config.stanceLabels.map(stance => {return {[stance]: 0};}));
}


function getFleissKEmotionsParagraphs() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const groupedByArticle = groupByArticle(entries);
            const fleissTableLabel = [];
            const fleissTableIntensity = [];

            for (const [_, byArticle] of Object.entries(groupedByArticle)) {
                const fleissTablePerArticleLabel = {};
                const fleissTablePerArticleIntensity = {};

                byArticle.forEach(article => {
                    article.paragraphsEmotionLabel.forEach((label, parKey) => {
                        if(!(fleissTablePerArticleLabel.hasOwnProperty(parKey))) {
                            fleissTablePerArticleLabel[parKey] = getEmptyFleissEmotionLabelRow();
                        }
                        fleissTablePerArticleLabel[parKey][getUniqueEmotionRepresentation(label.label)]++;

                        if(!(fleissTablePerArticleIntensity.hasOwnProperty(parKey))) {
                            fleissTablePerArticleIntensity[parKey] = getEmptyFleissEmotionIntensityRow();
                        }
                        if(label.intensity !== -1) {
                            fleissTablePerArticleIntensity[parKey][label.intensity]++;
                        }
                    });
                });
                fleissTableLabel.push(...Object.keys(fleissTablePerArticleLabel)
                    .map(parKey => fleissTablePerArticleLabel[parKey]));
                fleissTableIntensity.push(...Object.keys(fleissTablePerArticleIntensity)
                    .map(parKey => fleissTablePerArticleIntensity[parKey]));
            }
            return {fleissKEmotionLabelParagraphs: computeFleissK(fleissTableLabel),
                fleissKEmotionIntensityParagraphs: computeFleissK(fleissTableIntensity)};
        });
}

function getFleissKEmotionLabelArticles() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const groupedByArticle = groupByArticle(entries);
            const fleissTableEmotionLabelArticles = [];
            const fleissTableEmotionIntensityArticles = [];


            for (const [_, byArticle] of Object.entries(groupedByArticle)) {
                const fleissRowEmotionLabel = getEmptyFleissEmotionLabelRow();
                const fleissRowEmotionIntensity = getEmptyFleissEmotionIntensityRow();

                byArticle.forEach(article => {
                    fleissRowEmotionLabel[getUniqueEmotionRepresentation(article.emotionArticleLabel.label)]++;
                    if(article.emotionArticleLabel.intensity !== -1) {
                        fleissRowEmotionIntensity[article.emotionArticleLabel.intensity]++;
                    }
                });
                fleissTableEmotionLabelArticles.push(fleissRowEmotionLabel);
                fleissTableEmotionIntensityArticles.push(fleissRowEmotionIntensity);
            }
            return {fleissKEmotionLabelArticles: computeFleissK(fleissTableEmotionLabelArticles),
                    fleissKEmotionIntensityArticles: computeFleissK(fleissTableEmotionIntensityArticles)};
        });
}

function getFleissKStanceQuestionsLabel() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const groupedByArticle = groupByArticle(entries);
            const fleissTableLabel = [];

            for (const [_, byArticle] of Object.entries(groupedByArticle)) {
                const fleissTablePerArticleLabel = {};

                byArticle.forEach(article => {
                    article.stanceArticleQuestionsLabel.forEach((label, questionID) => {
                        if(!(fleissTablePerArticleLabel.hasOwnProperty(questionID))) {
                            fleissTablePerArticleLabel[questionID] = getEmptyFleissStanceLabelRow();
                        }
                        fleissTablePerArticleLabel[questionID][getUniqueStanceRepresentation(label.label)]++;
                    });
                });
                fleissTableLabel.push(...Object.keys(fleissTablePerArticleLabel)
                    .map(questionID => fleissTablePerArticleLabel[questionID]));
            }
            return {fleissKStanceQuestionsLabel: computeFleissK(fleissTableLabel)};
        });
}

function computeIRA(listOfGroupedEntries) {
    console.log(listOfGroupedEntries);
    let totalNCouples = 0;
    let agreeingCouples = 0;
    listOfGroupedEntries.forEach(groupedEntries => {
        for(let i = 0; i < groupedEntries.length - 1; ++i) {
            for(let j = i + 1; j < groupedEntries.length; ++j) {
                totalNCouples++;
                if(groupedEntries[i] === groupedEntries[j]) {
                    agreeingCouples++;
                }
            }
        }
    });
    if(totalNCouples === 0) {
        console.log("Only one labeller, setting IRA to 100.0");
        return 100.0;
    }
    return agreeingCouples / totalNCouples * 100.0;
}

function getIRAs() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const groupedByArticle = groupByArticle(entries);
            const dataEmotionLabelParagraphs = [];
            const dataEmotionIntensityParagraphs = [];
            const dataEmotionLabelArticles = [];
            const dataEmotionIntensityArticles = [];
            const dataStanceQuestionsLabel = [];


            for (const [_, byArticle] of Object.entries(groupedByArticle)) {
                const thisArticleEmotionLabelsParagraphs = {};
                const thisArticleEmotionIntensitiesParagraphs = {};
                const thisArticleEmotionLabels = [];
                const thisArticleEmotionIntensities = [];
                const thisArticleStanceLabels = {};

                byArticle.forEach(article => {
                    article.paragraphsEmotionLabel.forEach((label, parKey) => {
                        if(!(thisArticleEmotionLabelsParagraphs.hasOwnProperty(parKey))) {
                            thisArticleEmotionLabelsParagraphs[parKey] = [];
                        }
                        thisArticleEmotionLabelsParagraphs[parKey].push(getUniqueEmotionRepresentation(label.label));

                        if(!(thisArticleEmotionIntensitiesParagraphs.hasOwnProperty(parKey))) {
                            thisArticleEmotionIntensitiesParagraphs[parKey] = [];
                        }
                        if(label.intensity !== -1) {
                            thisArticleEmotionIntensitiesParagraphs[parKey].push(label.intensity);
                        }
                    });

                    thisArticleEmotionLabels.push(getUniqueEmotionRepresentation(article.emotionArticleLabel.label));
                    if(article.emotionArticleLabel.intensity !== -1) {
                        thisArticleEmotionIntensities.push(article.emotionArticleLabel.intensity);
                    }

                    article.stanceArticleQuestionsLabel.forEach((label, questionID) => {
                        if(!(thisArticleStanceLabels.hasOwnProperty(questionID))) {
                            thisArticleStanceLabels[questionID] = [];
                        }
                        thisArticleStanceLabels[questionID].push(getUniqueStanceRepresentation(label.label));
                    });
                });
                dataEmotionLabelParagraphs.push(...Object.keys(thisArticleEmotionLabelsParagraphs)
                    .map(parKey => thisArticleEmotionLabelsParagraphs[parKey]));
                dataEmotionIntensityParagraphs.push(...Object.keys(thisArticleEmotionIntensitiesParagraphs)
                    .map(parKey => thisArticleEmotionIntensitiesParagraphs[parKey]));

                dataEmotionLabelArticles.push(thisArticleEmotionLabels);
                dataEmotionIntensityArticles.push(thisArticleEmotionIntensities);

                dataStanceQuestionsLabel.push(...Object.keys(thisArticleStanceLabels)
                    .map(questionID => thisArticleStanceLabels[questionID]));
            }
            return {IRAEmotionLabelParagraphs: computeIRA(dataEmotionLabelParagraphs),
                IRAEmotionLabelParagraphsRandom: 1 / config.emotionsWithFactual.length * 100.0,
                IRAEmotionIntensityParagraphs: computeIRA(dataEmotionIntensityParagraphs),
                IRAEmotionIntensityParagraphsRandom: 1 / config.emotionIntensities.length * 100.0,
                IRAEmotionLabelArticles: computeIRA(dataEmotionLabelArticles),
                IRAEmotionLabelArticlesRandom: 1 / config.emotionsWithFactual.length * 100.0,
                IRAEmotionIntensityArticles: computeIRA(dataEmotionIntensityArticles),
                IRAEmotionIntensityArticlesRandom: 1 / config.emotionIntensities.length * 100.0,
                IRAStanceLabelArticles: computeIRA(dataStanceQuestionsLabel),
                IRAStanceLabelArticlesRandom: 1 / config.stanceLabels.length * 100.0,
            };
        });
}

function getIntensitiesStats() {
    return labelledentries.find({}).exec()
        .then(entries => {
            const validParagraphsIntensities = [];
            const validArticleIntensities = [];
            entries.forEach(entry => {
                entry.paragraphsEmotionLabel.forEach(label => {
                    if(label.intensity !== -1) {
                        validParagraphsIntensities.push(label.intensity)
                    }
                });
                if(entry.emotionArticleLabel.intensity !== -1) {
                    validArticleIntensities.push(entry.emotionArticleLabel.intensity)
                }
            });

            if(validParagraphsIntensities.length === 0) {
                return {
                    paragraphsIntensityMean: -1,
                    paragraphsIntensityMedian: -1,
                    paragraphsIntensityStd: -1,
                    articlesIntensityMean: -1,
                    articlesIntensityMedian: -1,
                    articlesIntensityStd: -1,
                };
            }
            return {
                paragraphsIntensityMean: mathjs.mean(validParagraphsIntensities),
                paragraphsIntensityMedian: mathjs.median(validParagraphsIntensities),
                paragraphsIntensityStd: mathjs.std(validParagraphsIntensities),
                articlesIntensityMean: mathjs.mean(validArticleIntensities),
                articlesIntensityMedian: mathjs.median(validArticleIntensities),
                articlesIntensityStd: mathjs.std(validArticleIntensities),
            };

        });
}

function getStanceQuestionsStats() {
    return labelledentries.find({}).exec()
        .then(entries => {
            let nStanceQuestions = 0;
            let nLabelledArticles = 0;
            let labelToCount = {};
            let labelToIndex = {};
            config.stanceLabels.forEach((label, index) => {
                labelToCount[index] = 0;
                labelToIndex[label] = index;
            });
            /*The first stance questions should be the one that were more safely matched to the article*/
            let labelToCountFirstQuestion = {};
            config.stanceLabels.forEach((_, index) => labelToCountFirstQuestion[index] = 0);
            return Promise.all(entries.map(entry => {
                return articles.findOne({articleID: entry.articleID}).exec().then(article => {
                    nLabelledArticles++;
                    entry.stanceArticleQuestionsLabel.forEach((label, questionID) => {
                        nStanceQuestions++;
                        labelToCount[labelToIndex[label.label]]++;
                        if(questionID === String(article.stanceQuestions[0].ID)) {
                            labelToCountFirstQuestion[labelToIndex[label.label]]++;
                        }
                    });
                });
            })).then(() => {
                let resDict = {};
                Object.keys(labelToCount).forEach((key) =>
                    resDict["perc" + key + "StanceQuestions"] =
                        labelToCount[key] / nStanceQuestions * 100.0
                );
                Object.keys(labelToCountFirstQuestion).forEach((key) =>
                    resDict["perc" + key + "FirstStanceQuestions"] =
                        labelToCountFirstQuestion[key] / nLabelledArticles * 100.0
                );
                return resDict;
            });
        });
}

router.route('/status').get((req, res) => {
    console.log("admindashboard/status queried");
    if(!checkAdminToken(req, res)) {
        return false;
    }
    const queryPromises = [];

    queryPromises.push(labellers.countDocuments({}).exec().then(c => {return {nRegisteredLabellers: c}}));
    queryPromises.push(labelledentries.countDocuments({}).exec().then(c => {return {nTaggedArticles: c}}));
    queryPromises.push(labelledentries.distinct('article').exec()
        .then(entries => {return {nTaggedUniqueArticles: entries.length}}));

    queryPromises.push(getTaggingTimeStatistics());
    queryPromises.push(getNotSureStatistics());
    queryPromises.push(getChangedIdeaStatistics());
    queryPromises.push(getInterraterStatistics());
    queryPromises.push(getFleissKEmotionsParagraphs());
    queryPromises.push(getFleissKEmotionLabelArticles());
    queryPromises.push(getFleissKStanceQuestionsLabel());
    queryPromises.push(getIRAs());
    queryPromises.push(getIntensitiesStats());
    queryPromises.push(getStanceQuestionsStats());

    //check that the labellerID exists
    return Promise.all(queryPromises)
        .then(arrOfObjects => Object.assign({}, ...arrOfObjects)) //just flattens the objects
        .then(status => {
            console.log("Replying with current status");
            status.config = config;
            console.log(status);
            res.json(status);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


//----------------------------------------

module.exports = router;