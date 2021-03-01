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

const config = {};

//Map containing all the information relative to having more than one labeller label the same entity (article)
config.interrater = {};

//number of duplicated labels (or labellers) per article and its respective comments
config.interrater.labbellersPerArticle = 5;

//number of articles that will be multi-labelled depending on the labbellersPerArticle value
//set to null in order to multilabel all the articles
config.interrater.multiLabelledArticles = null;

//How much money is each labeller paid per article
config.moneyPerArticle = 3.00;

//List of emotions
config.emotionsWithFactual = ["Freude", "Vertrauen", "Angst", "Antizipation", "Traurigkeit", "Ekel", "Ärger", "Überraschung", "sachlich"];
// List of emotion intensities
config.emotionIntensities = [0,1,2];
//list of labels for stance
config.stanceLabels = ["Ja, dafür", "Diskutierend", "Nein, gegen", "Kein Bezug"];

//--------------------------
module.exports = config;