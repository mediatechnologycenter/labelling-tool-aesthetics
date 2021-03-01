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

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import './index.css';

import 'bootstrap/dist/css/bootstrap.min.css';
//import Labelling from "./views/Labelling";
import Labelling from "./views/AesthLabelling";
import AdminDashboard from "./views/AdminDashboard";
import AuthenticateLabeller from "./views/AuthenticateLabeller";
import Register from "./views/Register";
import NoMatch from "./views/NoMatch";
import Home from "./views/Home";
import Instructions from "./views/Instructions";
import TermsAndConditions from "./views/TermsAndConditions";
import {checkMobile} from "./views/NotAvailableOnMobile";
import PersonalPage from "./views/PersonalPage";
import RegisterWithAutomaticEmail from "./views/RegisterWithAutomaticEmail";

// const clientConfig = require( "./assets/clientConfig.js");


ReactDOM.render(
    <>
        <BrowserRouter>
            <Switch>
                <Route path="/" exact render={props => <Home {...props} />} />
                <Route path="/labelling" exact render={props => checkMobile(<Labelling {...props}/>)} />
                <Route path="/admindashboard" exact render={props => <AdminDashboard {...props} />} />
                <Route path="/authenticatelabeller" exact render={props => checkMobile(<AuthenticateLabeller {...props} />)} />
                <Route path="/register" exact render={props => {
                    if (process.env.REACT_APP_AUTOMATIC_REGISTRATION) {
                        return <RegisterWithAutomaticEmail {...props} />;
                    }
                    return <Register {...props} />;
                }} />
                <Route path="/instructions" exact render={props => <Instructions {...props} />} />
                <Route path="/termsandconditions" exact render={props => <TermsAndConditions {...props} />} />
                <Route path="/personalpage" exact render={props => <PersonalPage {...props} />} />
                <Route component={NoMatch}/>
            </Switch>
        </BrowserRouter>
    </>,
    document.getElementById("root")
);
