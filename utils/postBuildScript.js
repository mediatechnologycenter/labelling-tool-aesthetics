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

console.log("REACT_APP_AUTOMATIC_REGISTRATION = " + process.env.REACT_APP_AUTOMATIC_REGISTRATION);
if(process.env.REACT_APP_AUTOMATIC_REGISTRATION) {
    fs.writeFile('./client/.env', "REACT_APP_AUTOMATIC_REGISTRATION=\"true\"\n",
        (err) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                console.log("Successfully written");
                process.exit();
            }
        }
    );
}



let path = '.env';

try {
    if (!fs.existsSync(path)) {
        path = "../.env"
    }
} catch(err) {
    console.error(err);
}

require('dotenv').config({path: path});
if(process.env.EMAIL_BACKUP) {
    const backup = require('../routes/backup');

    const mongoose = require('mongoose');
    const uri = process.env.MONGODB_URI;

    mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

    backup.sendBackupMail().then(res => {
        console.log(res);
        process.exit();
    }).catch(err => {
        console.log(err);
        process.exit(1);
    });
}
