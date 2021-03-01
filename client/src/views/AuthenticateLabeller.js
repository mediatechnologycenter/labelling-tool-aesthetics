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

import React from "react";
import axios from 'axios';
import {Button, Container, Form, FormGroup, Input, Label} from "reactstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Cookies from 'js-cookie';
import queryString from "query-string";

class AuthenticateLabeller extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            token: null,
            target: "labelling"
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const token = Cookies.get('token');
        console.log("Token in cookies: ");
        console.log(token);
        if(token) {
            this.setState({token});
        }
        const params = queryString.parse(this.props.location.search);
        let target = params.target;
        if(target) {
            this.setState({target});
        }
    }

    handleInputChange(event) {
        this.setState({
            token: event.target.value,
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        axios.get("/authenticatelabeller/valid?token=" + this.state.token)
            .then(response => {
                if(response.data.valid) {
                    Cookies.set("token", this.state.token);
                    this.props.history.push("/" + this.state.target + "?token=" + this.state.token);
                } else {
                    console.log(response);
                    alert(response.data.message);
                }
            });
    }

    render() {
        return (<>
                <Header selectedPage={"authenticatelabeller"}/>
                <Container className="shape-container align-items-center">
                    <h2>Authentifizierung zur Beschriftung</h2>
                    <Form>
                        <FormGroup>
                            <Label for="token">Bitte geben Sie Ihr persönliches Kürzel ein, das Sie im
                                Registrierungs-E-Mail erhalten haben. Wenn Sie Ihr Token verloren haben,
                                <a href={"/register"}> registrieren</a> Sie sich bitte mit der gleichen E-Mail und
                                es wird für Sie wiederhergestellt.
                            </Label>
                            <Input onChange={this.handleInputChange}
                                   value={this.state.token === null || this.state.token === undefined ?
                                       "" : this.state.token}
                                   type="text"
                                   name="tokenInput"
                                   id="tokenInput"
                                   placeholder="Personal token"/>
                        </FormGroup>
                        <Button onClick={this.handleSubmit} block>Anmelden</Button>
                    </Form>
                </Container>
                <Footer/>
            </>
        );
    }
}

export default AuthenticateLabeller;
