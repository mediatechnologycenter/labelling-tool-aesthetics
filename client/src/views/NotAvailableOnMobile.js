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
import {Col, Container, Alert} from "reactstrap";
import Row from "reactstrap/es/Row";

import Header from "../components/Header";
import Footer from "../components/Footer";

import {isMobileOnly} from "react-device-detect";

export function checkMobile(Comp) {
    //if (isMobileOnly) {
    if (false) {
        return <NotAvailableOnMobile/>;
    }
    return Comp;
}

class NotAvailableOnMobile extends React.Component {
    render() {
        return (<>
            <Header/>
            <Alert color={"danger"}>
                <Container>
                <Row><Col><h2>Nicht verfügbar auf Mobiltelefonen</h2></Col></Row>
                <Row>
                    <Col>
                        <p>
                            Wie in der Anleitung beschrieben, ist es nicht möglich, die Website von mobilen Geräten
                            aus zu nutzen, um eine hohe Datenqualität zu gewährleisten.  <br/>
                            Bitte öffnen Sie die Seite von einem anderen Gerät aus.
                        </p>
                    </Col>
                </Row>
            </Container>
            </Alert>
            <Footer/>
        </>);
    }
}
export default NotAvailableOnMobile;
