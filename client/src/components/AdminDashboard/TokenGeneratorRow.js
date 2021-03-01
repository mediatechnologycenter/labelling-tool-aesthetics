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
import {Button, Col, Row} from "reactstrap";
import Badge from "reactstrap/es/Badge";
import {CopyToClipboard} from "react-copy-to-clipboard";
import axios from "axios";

class TokenGeneratorRow extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {currToken: null};

        this.handleNewToken = this.handleNewToken.bind(this);
    }

    static defaultProps = {
        color: "primary",
        adminToken: null
    };

    static getTemplateEmail(token) {
        const link = "https://experiment.mtc.ethz.ch/instructions?token=" + token + "&email=true";

        return `Lieber [name],
Vielen Dank, dass Sie sich für das Emotionen & Standpunkt Projekt von MTC angemeldet haben. 
Sie können die Anleitungen lesen und dann mit der Arbeit beginnen indem Sie auf diesen Link klicken: ${link} . Dadurch wird auch Ihr Konto bestätigt.

Bitte notieren Sie sich Ihre persönliche ID (Token) für die zukünftige Verwendung: ${token}

Wenn Sie ein Problem oder eine Anfrage haben, können Sie gerne auf diese E-Mail antworten und wir werden uns mit Ihnen in Verbindung setzen.
Danke, dass Sie uns helfen, die Forschung voranzubringen!
Ich wünsche Ihnen alles Gute,
Emotionen & Standpunkt Projekt des MTC-Teams`;
    }

    handleNewToken() {
        axios.get("/admindashboard/gentoken"+ "?token=" + this.props.adminToken)
            .then(res => {
                this.setState({
                    currToken: res.data.token
                });
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    currToken: null
                });
            });
    }

    render() {
        return <Row className={"mb-4"}>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Button onClick={() => this.handleNewToken()}>Generate new token</Button>

                <Badge className={"ml-5 mr-3"} color="info">{this.state.currToken}</Badge>
                {!this.state.currToken ? null : <><CopyToClipboard text={this.state.currToken}>
                    <Button color="info">Copy to clipboard</Button>
                </CopyToClipboard>
                <CopyToClipboard text={TokenGeneratorRow.getTemplateEmail(this.state.currToken)}>
                    <Button className={"ml-3"} color="info">Copy email template to clipboard</Button>
                </CopyToClipboard>
                </>}
            </Col>
        </Row>;
    }
}

export default TokenGeneratorRow;
