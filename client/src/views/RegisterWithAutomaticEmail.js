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
import {Button, Container, Form, FormGroup, Input, Label, UncontrolledAlert} from "reactstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";

class AuthenticateLabeller extends React.Component {

    static selectText = "Wählen Sie...";

    constructor(props, context) {
        super(props, context);

        this.state = {
            name: "",
            surname: "",
            email: "",
            affiliation: AuthenticateLabeller.selectText,
            acceptedConditions: false,
            surnameError: false,
            nameError: false,
            emailError: false,
            affiliationError: false,
            acceptedConditionError: false,
            errorMessage: "",
            success: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCheckedChange = this.handleCheckedChange.bind(this);
    }

    handleInputChange(event) {
        this.setState({
            success: false,
            [event.target.name]: event.target.value,
            [event.target.name + "Error"]: false
        });
    }

    handleCheckedChange(event) {
        this.setState({
            success: false,
            [event.target.name]: event.target.checked,
            [event.target.name + "Error"]: false
        });
    }

    validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    handleSubmit(event) {
        event.preventDefault();
        let errorMessage = "";
        if(this.state.name.length === 0) {
            errorMessage += "Ungültiger Name. ";
            this.setState({
                nameError: true});
        }
        if(this.state.surname.length === 0) {
            errorMessage += "Ungültiger Familienname. ";
            this.setState({
                surnameError: true});
        }
        if(!this.validateEmail(this.state.email)) {
            errorMessage += "Ungültige E-Mail. ";
            this.setState({
                emailError: true});
        }
        if(this.state.affiliation === AuthenticateLabeller.selectText) {
            errorMessage += "Ungültige Zugehörigkeit. ";
            this.setState({
                affiliationError: true});
        }
        if(!this.state.acceptedConditions) {
            errorMessage += "Bitte akzeptieren Sie die Bedingungen. ";
            this.setState({
                acceptedConditionsError: true});
        }
        this.setState({
            errorMessage: errorMessage});

        if(!errorMessage) {
            axios.post("/register", {
                name: this.state.name,
                surname: this.state.surname,
                email: this.state.email,
                affiliation: this.state.affiliation,
            })
            .then(res => {
                this.setState({
                    success: true
                });
                setTimeout(() => {
                    this.props.history.push('/authenticatelabeller');
                }, 7000)
            })
            .catch(err => {
                console.log(JSON.stringify(err));
                console.log(err.response);
                if(err.response && err.response.status === 400) {
                    console.log(err.response.data); // => the response payload
                    this.setState({
                        success: false,
                        errorMessage: err.response.data.message,
                    });
                }
                else {
                    this.setState({
                        success: false,
                        errorMessage: "Server error" + err.toString(),
                    });
                }

            });
        }
    }

    render() {
        return (<>
            <Header/>
            <Container className="shape-container align-items-center">
                <h2>Anmeldung</h2>

                {!(this.state.errorMessage) ? null :
                    <UncontrolledAlert color="danger" fade={true}>
                                        <span className="alert-inner--icon">
                                            <i className="ni ni-support-16" />
                                        </span>
                        <span className="alert-inner--text ml-1">
                            <strong>Error!</strong> {this.state.errorMessage}
                                        </span>
                    </UncontrolledAlert>}
                {!this.state.success ? null :
                    <UncontrolledAlert color="success" fade={true}>
                                        <span className="alert-inner--icon">
                                        <i className="ni ni-like-2" />
                                        </span>
                        <span className="alert-inner--text ml-1">
                            <strong>Erfolg!</strong>
                            Bitte überprüfen Sie Ihre E-Mail ({this.state.email}), dort finden Sie einen Link,
                            mit dem Sie die Studie beginnen können. Sie werden bald auf die Authentifizierungsseite
                            weitergeleitet. Falls die Weiterleitung nicht funktioniert, klicken Sie bitte
                            <a href={"/authenticatelabeller"}> hier</a>.
                        </span>
                    </UncontrolledAlert>}
                {this.state.success ? null : (<>
                    <p>Bitte füllen Sie die Felder aus. Nach dem Absenden erhalten Sie eine E-Mail mit dem Link,
                        um mit der Teilnahme an der Studie zu beginnen.
                    </p>
                <Form>
                    <FormGroup>
                        <Label for="name">Name</Label>
                        <Input onChange={this.handleInputChange}
                               type="text" name="name" id="nameID"
                               placeholder="Name"
                               className={this.state.nameError ? "is-invalid" : null}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="surname">Nachname</Label>
                        <Input onChange={this.handleInputChange}
                               type="text" name="surname" id="surnameID"
                               placeholder="Surname"
                               className={this.state.surnameError ? "is-invalid" : null}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">Email, bitte verwenden Sie E-Mail ihrer Institution</Label>
                        <Input onChange={this.handleInputChange}
                               type="email" name="email" id="exampleEmail"
                               placeholder="example@student.ethz.ch"
                               className={this.state.emailError ? "is-invalid" : null}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="affiliation">Ihre Zugehörigkeit</Label>
                        <Input onChange={this.handleInputChange}
                               type="select" name="affiliation" id="affiliationID"
                               className={this.state.affiliationError ? "is-invalid" : null}
                        >
                            <option>{AuthenticateLabeller.selectText}</option>
                            <option>ETH</option>
                            <option>UZH</option>
                            <option>NZZ</option>
                            <option>Ringier</option>
                        </Input>
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input onChange={this.handleCheckedChange}
                                   className={this.state.acceptedConditionsError ? "is-invalid" : null}
                                   name="acceptedConditions" type="checkbox" />{' '}
                            Ich habe die
                            <a href={"/termsandconditions"} target={"_blank"} rel="noopener noreferrer"> Bedingungen </a>
                            dieser Studie gelesen und akzeptiere sie.
                        </Label>
                    </FormGroup>
                    <Button onClick={this.handleSubmit} className={"mt-3"} block>Anmelden</Button>
                    </Form>
                    </>
                    )}
            </Container>
                <Footer/>
            </>
        );
    }
}

export default AuthenticateLabeller;
