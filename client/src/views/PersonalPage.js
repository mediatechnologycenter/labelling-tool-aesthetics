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
import {Button, Col, Container, Row} from "reactstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Cookies from 'js-cookie';
import InfoRow from "../components/AdminDashboard/InfoRow";

class PersonalPage extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            infos: {},
            token: null,
        };

        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        const token = Cookies.get('token');
        console.log("Token in cookies: ");
        console.log(token);
        if(token) {
            this.setState({token});
        }
        if(!token) {
            this.props.history.push("/authenticatelabeller?target=personalpage");
        }

        axios.get("/personalpage/info?labellerID="+token)
            .then(res => {console.log(res); this.setState({infos: res.data.infos});}
            )
            .catch(err => {
                console.log(err);
            });
    }

    handleLogout() {
        Cookies.remove("token");
        this.props.history.push("/");
    }

    render() {
        return (<>
                <Header selectedPage={"personalpage"}/>
                <Container className="shape-container align-items-center">
                    <h2>Persönliche Seite</h2>
                    <Row className={"pt-3"}>
                        <Col>
                            <h3>Infos</h3>
                        </Col>
                    </Row>
                        <InfoRow counter={this.state.infos.nTaggedArticles}>Anzahl der etikettierten Artikel:</InfoRow>
                        <InfoRow counter={this.state.infos.money}>Entsprechende Vergütung (CHF):</InfoRow>
                        <InfoRow counter={this.state.token}>Token:</InfoRow>
                        <Row className={"pt-3"}>
                            <Col>
                                <h3>Aktionen</h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} sm={9} md={9} lg={9} xl={9}>
                                <Button block
                                        onClick={() => this.handleDownload("labelledentries")}
                                href={"/labelling?labellerID="+this.state.token}>
                                    Beschriftung beginnen
                                </Button>
                            </Col>
                            <Col xs={12} sm={3} md={3} lg={3} xl={3}>
                                <Button block color="danger" onClick={this.handleLogout}>
                                    Abmelden
                                </Button>
                            </Col>
                        </Row>
                        <Row className={"mt-2"}>
                        </Row>
                    </Container>
                <Footer/>
            </>
        );
    }
}

export default PersonalPage;
