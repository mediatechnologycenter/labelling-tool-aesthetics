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

const nodemailer = require('nodemailer');
const {getAllData} = require("./utils");

const schedule = require('node-schedule');


//----------- backup by email
/*Create transport to send backup of tags*/

function buildMailerJob() {
    console.log("Scheduling mail backup job");
    return schedule.scheduleJob('00 23 * * *', function () {
        console.log('Mail backup called');
        sendBackupMail();
    });
}

function sendBackupMail() {
    console.log("sendBackupMail called");

    return new Promise(function(resolve, reject) {
        getAllData()
            .then(result => {
                const stringifiedRes = JSON.stringify(result);

                const smtpTrans = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOpts = {
                    from: process.env.EMAIL, // This is ignored by Gmail
                    to: process.env.EMAIL_BACKUP,
                    subject: '[MTC] emotions and stance backup',
                    text: stringifiedRes
                };

                //we send the email
                smtpTrans.sendMail(mailOpts, function (error, info) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        resolve(true);
                    }
                });
            })
            .catch(error => {
                console.log(error);
                reject(error)
            });
    })
}

//get the next article to be tagged
router.route('/backupnow').post((req, res) => {
    console.log("backupnow called by client");
    sendBackupMail();
    return res.send(JSON.stringify({message: "backup mail sent"}));
});


//----------------------------------------


module.exports = router;
module.exports.buildMailerJob = buildMailerJob;
module.exports.sendBackupMail = sendBackupMail;