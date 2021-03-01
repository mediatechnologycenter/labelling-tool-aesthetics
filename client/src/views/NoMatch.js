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
import {Button, Col, Container, UncontrolledAlert} from "reactstrap";
import Row from "reactstrap/es/Row";

import Header from "../components/Header";
import Footer from "../components/Footer";

class NoMatch extends React.Component {
    render() {
        return (<>
            <Header/>
            <Container>
                <Row><Col><h2>Fehler 404</h2></Col></Row>
            <Row>
                <Col>
                    <UncontrolledAlert color="danger" fade={true}>
                                    <span className="alert-inner--icon">
                                        <i className="ni ni-support-16" />
                                    </span>
                        <span className="alert-inner--text ml-1">
                        <strong>Fehler 404</strong> Die von Ihnen gesuchte Seite kann nicht gefunden werden.
                                    </span>
                    </UncontrolledAlert>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button className="p-1"
                            size={"lg"}
                            style={{width: "100%"}}
                            color={"primary"}
                            href={"/"}>
                        Gehen Sie auf die Homepage.
                    </Button>
                </Col>
            </Row>
        </Container>
            <Footer/>
            </>);
    }
}

export default NoMatch;
