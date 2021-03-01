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

const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();
require('dotenv').config({path: "./client/.env"});

const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || "mongodb://localhost/labelling_tool";

mongoose.connect(uri, {useNewUrlParser:true, useCreateIndex: true, useUnifiedTopology:true});
const connection = mongoose.connection;

connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
});

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const labellingRouter = require('./routes/labelling');
app.use('/labelling/', labellingRouter);

const admindashboardRouter = require('./routes/admindashboard');
app.use('/admindashboard/', admindashboardRouter);

const authenticatelabellerRouter = require('./routes/authenticatelabeller');
app.use('/authenticatelabeller/', authenticatelabellerRouter);

if(process.env.REACT_APP_AUTOMATIC_REGISTRATION) {
    const registerRouter = require('./routes/register');
    app.use('/register/', registerRouter);
}

const backupRouter = require('./routes/backup');
app.use('/backup/', backupRouter);

const personalpageRouter = require('./routes/personalpage');
app.use('/personalpage/', personalpageRouter);

if(process.env.EMAIL_BACKUP) {
    backupRouter.buildMailerJob();
}

//const {aesthTable} = require("./models/aesth_table.js");


if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'heroku') {

    console.log("Running in production mode");
    //direct to local react build
    app.use(express.static(path.join(__dirname, 'client', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
}
if (process.env.NODE_ENV === 'production') {
    const https = require("https");
    const fs = require("fs");

    const options = {
        key: fs.readFileSync(process.env.KEY_PATH),
        cert: fs.readFileSync(process.env.CERT_PATH)
    };

    https.createServer(options, app).listen(port, () =>
        console.log(`HTTPS Server is running on port: ${port}`));

    const httpOnly = express();

    // set up a route to redirect http to https
    httpOnly.get('*', function(req, res) {
        console.log("redirecting to https");
        res.redirect('https://' + req.headers.host + req.url);
    });

    const httpOnlyPort = process.env.HTTP_ONLY_PORT || 80;
    // have it listen on 80
    httpOnly.listen(httpOnlyPort, () => console.log(`HTTP Server is running on port: ${httpOnlyPort} and only redirecting requests`));
}
else {
    app.listen(port, () => {
        console.log(`HTTP Server is running on port: ${port}`);
    });
}
