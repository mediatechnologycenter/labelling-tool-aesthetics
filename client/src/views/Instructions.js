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
import {Button, Col, Container} from "reactstrap";
import Row from "reactstrap/es/Row";

import Header from "../components/Header";
import queryString from 'query-string';
import EmotionsParagraphsInstructions from "../components/Instructions/EmotionsParagraphsInstructions";
import TechnicalInstructions from "../components/Instructions/TechnicalInstructions";
import Footer from "../components/Footer";
import EmotionsExamples from "../components/Instructions/EmotionsExamples";
import StanceInstructions from "../components/Instructions/StanceInstructions";
import ContainedHr from "../components/ContainedHr";
import EmotionWholeArticleInstructions from "../components/Instructions/EmotionWholeArticleInstructions";
import StanceExamples from "../components/Instructions/StanceExamples";
import Cookies from "js-cookie";


class Instructions extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {token: null};
    }

    componentDidMount() {
        const params = queryString.parse(this.props.location.search);
        const token = params.token;
        const fromEmail = Boolean(params.email);
        console.log("token = " + token + " fromEmail =  " + fromEmail);
        if(token && fromEmail) {
            Cookies.set('token', token);
        }
        this.setState({token});
    }

    render() {
        return (<>
            <Header selectedPage={"instructions"}/>
            <Container>
                <Row><Col><h2>Anleitungen</h2></Col></Row>
                <Row>
                    <Col>
                        <p>Für jede Seite erhalten Sie einen in Absätze unterteilten Artikel.
                            Sie werden dazu aufgefordert:</p>
                        <ol>
                            <li>Jedem <b>Absatz</b> ein <b>Emotions</b>-Label zuzuordnen</li>
                            <li>Dem <b>gesamten Artikel</b> ein <b>Emotions</b>-Label</li>
                            <li>Den <b>Standpunkt</b> des <b>Artikels</b> zu einem bestimmten Thema zu bewerten</li>
                        </ol>
                         <p>
                             Wenn Sie sich zu irgendeinem Zeitpunkt des Prozesses müde oder angestrengt fühlen,
                             können Sie jederzeit aufhören und später weitermachen, alle Ihre Eingaben werden
                             gespeichert. Nichts geht verloren, auch wenn Sie mitten in einem Artikel aufhören.
                         </p>
                    </Col>
                </Row>
                <EmotionsParagraphsInstructions/>
                <EmotionsExamples/>
                <ContainedHr/>
                <EmotionWholeArticleInstructions/>
                <ContainedHr margins={"mt-n2 mb-4"}/>
                <StanceInstructions/>
                <StanceExamples/>
                <ContainedHr margins={"mb-4"}/>
                <TechnicalInstructions/>
                <Row>
                    <Col>
                        <Button className="p-1"
                                size={"lg"}
                                href={this.state.token ? "/labelling?token=" + this.state.token : "/labelling"} block>
                            Beschriftung beginnen oder fortsetzen
                        </Button>
                    </Col>
                </Row>
            </Container>
            <Footer/>
        </>);
    }
}

export default Instructions;
