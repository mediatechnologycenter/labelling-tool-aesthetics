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

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articlesSchema = new Schema({
        articleID: String,
        source: {
            type: String,
            enum : ['blick','nzz'],
        },
        url: String,
        title: String,
        snippet: String,
        stanceQuestions: [{ID: Number, text: String}],
    paragraphs: [{consecutiveID: Number, text: String}],
    },
    {
        timestamps: true
    });

const articles = mongoose.model("articles", articlesSchema);
module.exports = articles;
