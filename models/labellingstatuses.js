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

const {emotionTagSchema, stanceTagSchema} = require("./emotionsStanceTagSchemas");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const labellingstatusesSchema = new Schema({
        labeller: { type: Schema.Types.ObjectId, ref: 'labellers' },
        article: { type: Schema.Types.ObjectId, ref: 'articles' },
        firstLabelledEnteredDate: {type: Date, default: null},
    articleID: String,
        paragraphsEmotionLabel: {type: Map, of: emotionTagSchema},
        paragraphsEmotionLabelHistory: {type: Map, of: {type: [emotionTagSchema], default: []}},
        stanceArticleQuestionsLabel: {type: Map, of: stanceTagSchema},
        stanceArticleQuestionsLabelHistory: {type: Map, of: {type: [emotionTagSchema], default: []}},
        emotionArticleLabel: {type: emotionTagSchema, default: null},
        emotionArticleLabelHistory: {type: [emotionTagSchema], default: []},
    },
    {
        timestamps: true
    });

function getDefaultEmptySchema(_labellerID, article) {

    const mappedArticles = article.paragraphs.map(par => {
        return {[par.consecutiveID]: {
                label: null,
                intensity: null,
                notSure: false,
                enteredAt: null
            }};
    });
    console.log(mappedArticles);
    console.log(    Object.assign(
        ...mappedArticles));
    return new labellingstatuses(
        {
            labeller: _labellerID,
            article: article._id,
            articleID: article.articleID,
            paragraphsEmotionLabel: Object.assign(
                ...article.paragraphs.map(par => {
                return {[par.consecutiveID]: {
                        label: null,
                        intensity: null,
                        notSure: false,
                        enteredAt: null
                    }};
            })),
            paragraphsEmotionLabelHistory: Object.assign(
                ...article.paragraphs.map(par => {
                return {[par.consecutiveID]: []
                };
            })),
            stanceArticleQuestionsLabel: Object.assign(
                ...article.stanceQuestions.map(question => {
                    return {[question.ID]: {
                            label: null,
                            intensity: null,
                            notSure: false,
                            enteredAt: null
                        }};
                })),
            stanceArticleQuestionsLabelHistory: Object.assign(
                ...article.stanceQuestions.map(question => {
                    return {[question.ID]: []
                    };
                })),
            emotionArticleLabel: {    label: null,
                intensity: null,
                notSure: false,
                enteredAt: null},
            emotionArticleLabelHistory: []
        });
}


const labellingstatuses = mongoose.model("labellingstatuses", labellingstatusesSchema);

// save the date in which the labeller started labelling (clicked its first button)
function updateLabellingStatusesDate(labeller, article) {
    return labellingstatuses.updateOne({
            'labeller': mongoose.Types.ObjectId(labeller),
            'article': mongoose.Types.ObjectId(article),
            firstLabelledEnteredDate: null
        },
        {
            $set: {
                firstLabelledEnteredDate: Date.now(),
            }
        })
        .then((res) => {
            if(!res.ok) {
                return false;
            }
            if(res.nModified) {
                console.log("Succesfully updated firstLabelledEnteredDate too.");
            } else {
                console.log("firstLabelledEnteredDate was already entered, no update needed");
            }
            console.log(res);
            return true;
        }).catch(err => {
            console.log(err);
            return false;
        });
}

function updateEmotionArticleLabel(labeller, article, data) {
    return labellingstatuses.findOne({
        'labeller': mongoose.Types.ObjectId(labeller),
        'article': mongoose.Types.ObjectId(article),
    }).exec()
        .then(status => {
            //push current status in history
            if(status.emotionArticleLabel.enteredAt !== null) { //if it's null means it was the first labelled entered
                status.emotionArticleLabelHistory.push(status.emotionArticleLabel);
            }

            //copy in new tag
            status.emotionArticleLabel = data;

            return status.save();
        });
}

function updateStanceArticleQuestionsLabel(labeller, article, elemID, data) {
    return labellingstatuses.findOne({
        'labeller': mongoose.Types.ObjectId(labeller),
        'article': mongoose.Types.ObjectId(article),
    }).exec().then(status => {
        //push current status in history
        const stringID = String(elemID);
        if (status.stanceArticleQuestionsLabel.get(stringID).enteredAt !== null) {
            const newHistory = status.stanceArticleQuestionsLabelHistory.get(stringID);
            newHistory.push(status.stanceArticleQuestionsLabel.get(stringID));
            console.log(newHistory);
            status.stanceArticleQuestionsLabelHistory.set(stringID, newHistory);
            status.markModified('stanceArticleQuestionsLabelHistory');
        }

        //copy in new tag
        status.stanceArticleQuestionsLabel.set(stringID, data);
        status.markModified('stanceArticleQuestionsLabel');

        return status.save();
    });
}

function updateParagraphsEmotionLabel(labeller, article, elemID, data) {
    return labellingstatuses.findOne({
        'labeller': mongoose.Types.ObjectId(labeller),
        'article': mongoose.Types.ObjectId(article),
    }).exec().then(status => {
        //push current status in history
        const stringID = String(elemID);
        if (status.paragraphsEmotionLabel.get(stringID).enteredAt !== null) {
            const newHistory = status.paragraphsEmotionLabelHistory.get(stringID);
            newHistory.push(status.paragraphsEmotionLabel.get(stringID));
            console.log(newHistory);
            status.paragraphsEmotionLabelHistory.set(stringID, newHistory);
            status.markModified('paragraphsEmotionLabelHistory');
        }

        //copy in new tag
        status.paragraphsEmotionLabel.set(stringID, data);
        status.markModified('paragraphsEmotionLabel');

        return status.save();
    });
}

module.exports = labellingstatuses;
module.exports.getDefaultEmptySchema = getDefaultEmptySchema;
module.exports.updateLabellingStatusesDate = updateLabellingStatusesDate;
module.exports.updateEmotionArticleLabel = updateEmotionArticleLabel;
module.exports.updateStanceArticleQuestionsLabel = updateStanceArticleQuestionsLabel;
module.exports.updateParagraphsEmotionLabel = updateParagraphsEmotionLabel;
