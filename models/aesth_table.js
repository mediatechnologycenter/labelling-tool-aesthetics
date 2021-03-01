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

//const {emotionTagSchema, stanceTagSchema} = require("./emotionsStanceTagSchemas");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aesthSchema = new Schema({
        labeller: { type: Schema.Types.ObjectId, ref: 'labellers', required: true },
        rounds: Object
        //, deviceSpecs: {type: {
        //        osName: String,
        //        osVersion: String,
        //        browserName: String,
        //        browserVersion: String,
        //        deviceType: String
        //    },
        //    default: null}
    },
    {
        timestamps: true
    });

const aesthTable = mongoose.model("aesth_table", aesthSchema);
module.exports = aesthTable;
