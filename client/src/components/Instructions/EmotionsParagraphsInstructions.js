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
import PlutchikSelector from "../Labelling/PlutchikSelector";
import Paragraph from "../Labelling/Paragraph";

class EmotionsParagraphsInstructions extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            emotionStatus: {label: null, intensity: null, notSure: false},
            correctEmotionStatus: {label: "Ärger", intensity: 1, notSure: false}
        };
        this.handleEmotionParagraph = this.handleEmotionParagraph.bind(this);
    }

    handleEmotionParagraph(event, fieldToUpdate, data) {
        console.log("handleEmotionParagraph");
        let emotionStatus = {...this.state.emotionStatus};
        emotionStatus[fieldToUpdate] = data;
        if(data === PlutchikSelector.emotionlessLabel) {
            emotionStatus.intensity = -1
        }
        else if(fieldToUpdate === "label" && emotionStatus.intensity === -1) {
            emotionStatus.intensity = null;
        }
        this.setState({emotionStatus});
    }

    render() {
        return <>
            <Row>
                <Col>
                    <h3>1 - Emotion jedes einzelnen Absatzes</h3>
                    <h5>Definition der Aufgabe</h5>
                    <p>
                        Lesen Sie den Artikel sorgfältig durch; wählen Sie für jeden Absatz auf der rechten Seite eine
                        Emotion aus, die die Frage am besten beantwortet: "<i><b>Welches ist das Gefühl, das in diesem
                        Absatz vermittelt wird?</b></i>" Sie können zwischen einer der 8 primären Emotionen des
                        <a
                            href={"https://en.wikipedia.org/wiki/Robert_Plutchik#Plutchik's_wheel_of_emotions"}
                            target={"_blank"}
                            rel="noopener noreferrer"> Plutchik-Rades der Emotionen</a> wählen, einer in der
                        wissenschaftlichen Literatur weit verbreiteten Definition von
                        Emotionen. Die 8 Emotionen sind: <i> Freude, Traurigkeit, Vertrauen, Ekel, Angst, Ärger,
                        Antizipation, Überraschung</i>. Sie können nur eine Emotion pro Absatz auswählen. Wählen Sie im
                        Zweifelsfall die Emotion aus, die durch den Text am Stärksten vermittelt wird.<br/>
                        Nachdem Sie die Emotion ausgewählt haben, wählen Sie ihre Intensität:
                        <i> wenig, mittel, stark</i>. <br/>
                        Wenn Sie sich bei Ihrer Antwort nicht sicher sind, können Sie dies durch die Option
                        "Ich bin mir meiner Antwort nicht sicher" signalisieren.
                        </p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5>Beispiel der Benutzeroberfläche</h5>
                    <p>
                        Unten finden Sie ein Beispiel, wie die Benutzeroberfläche aussieht. Auf der linken Seite
                        finden Sie den Absatz und auf der rechten Seite das Widget, mit dem Sie die Emotion und ihre
                        Stärke auswählen können. Spielen Sie ruhig mit dem Widget herum und klicken Sie zum Beispiel
                        auf (<i>Ärger</i>) und dann auf (<i>mittel</i>), was die richtigen Antworten für diesen
                        Absatz wären.
                    </p>
                </Col>
            </Row>
            <Row>
                <Col className={"pr-0"}>
                    <div  className={"p-2 pl-3 mb-4"} style={{
                        border: "0.10em",
                        borderStyle: "dashed",
                    }}>
                    <Paragraph margins={"pl-1"}
                    emotionStatus={this.state.emotionStatus}
                    onClick={this.handleEmotionParagraph}>
                        Dennoch gibt der Bund jedes Jahr Steuergelder aus, um den Schweizern noch mehr Appetit auf
                        Fleisch zu machen.	</Paragraph>
                    </div>
                </Col>
            </Row>
        </>;
    }
}

export default EmotionsParagraphsInstructions;
