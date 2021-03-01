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

import {Col, Row} from "reactstrap";
import StanceSelectorOrizontal from "../Labelling/StanceSelectorOrizontal";
import Labelling from "../../views/Labelling";

class StanceInstructions extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {stanceArticleQuestionLabel: {label: null, notSure: false}}

        this.handleStanceArticle = this.handleStanceArticle.bind(this);
    }

    handleStanceArticle(event, fieldToUpdate, data) {
        const stanceArticleQuestionLabel = this.state.stanceArticleQuestionLabel;
        stanceArticleQuestionLabel[fieldToUpdate] = data;
        this.setState({stanceArticleQuestionLabel});
    }

    render() {
        return <Row>
            <Col>
                <h3>3 - Standpunkt des Artikels zu einem Thema</h3>
                <h5>Definition der Aufgabe</h5>
                <p>
                    Sie werden dann gebeten, den Standpunkt des Artikels zu einem bestimmten Thema auszuwählen.
                    Sie erhalten eine Frage und 4 mögliche Antworten <i>Ja, dafür, diskutierend, Nein, dagegen</i> und
                    <i>ohne Bezug</i>. Eine Beispielfrage kann sein: <i>Sollte Abtreibung legal sein?</i> Es folgt die
                    Bedeutung der vier Antwortmöglichkeiten:
                </p>
                <ul>
                    <li>
                        <i>Ja, dafür</i> bedeutet, dass der Artikel mit der Frage übereinstimmt und einen
                        positiven Standpunkt zum Thema einnimmt.
                    </li>
                    <li>
                        <i>Diskutierend</i> bedeutet, dass der Artikel über das Thema spricht,
                        aber keinen klaren Standpunkt einnimmt.
                    </li>
                    <li>
                        <i>Nein, gegen</i> bedeutet, dass der Artikel mit der Frage nicht einverstanden ist und
                        einen negativen Standpunkt gegenüber dem Thema einnimmt.
                    </li>
                    <li>
                        <i>Kein Bezug</i> bedeutet, dass der Artikel nicht über das Thema spricht und nicht auf die
                        Frage eingeht.
                    </li>
                </ul>
                <h5>Beispiel der Benutzeroberfläche</h5>
                Unten finden Sie ein Beispiel, wie die Benutzeroberfläche aussieht. Auch hier können Sie ruhig mit
                der Oberfläche spielen.
                <div className={"mt-2"}>
                    <h5 style={{color: Labelling.defaultProps.instructionsTextColor}}>Sollte Abtreibung legal sein?</h5>
                </div>
                <StanceSelectorOrizontal onClick={this.handleStanceArticle}
                                         stanceStatus={this.state.stanceArticleQuestionLabel}/>
            </Col>
        </Row>;
    }
}

export default StanceInstructions;
