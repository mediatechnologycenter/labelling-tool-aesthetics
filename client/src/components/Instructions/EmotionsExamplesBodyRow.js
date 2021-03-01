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

import {Col, Container, Media, Row, Table} from "reactstrap";
import Labelling from "../../views/Labelling";
import PlutchikSelector from "../Labelling/PlutchikSelector";

class ExampleStrengthTableLine extends React.Component {
    render() {
        return <tr>
            <EmotionCell emotionName={this.props.emotionName}/>
            <IntensityCell intensityName={this.props.intensityName}/>
            <td className={"align-middle"} style={{background: Labelling.defaultProps.contentBackgroundColor}}>
                {this.props.children}
            </td>
        </tr>;
    }
}

class ExampleDefinitionTableLine extends React.Component {
    render() {
        return <tr>
            <EmotionCell emotionName={this.props.emotionName}/>
            <td className={"align-middle"}>{PlutchikSelector.emotionsMap[this.props.emotionName].synonyms.join(", ")}</td>
            <td className={"align-middle"} style={{background: Labelling.defaultProps.contentBackgroundColor}}>
                {this.props.children}
            </td>
            <IntensityCell intensityName={this.props.intensityName}/>
        </tr>;
    }
}

class EmotionCell extends React.Component {
    render() {
        const emotion = PlutchikSelector.emotionsMap[this.props.emotionName];
        return <td className={"text-center align-middle"} style={{background: emotion.color + "8A"}}>
            <Container>
                <Row>
                    <Col>
                        <span role="img"
                              style={{fontSize: 32}}
                              aria-label={this.props.emotionName + " emoji"}>
                            {emotion.emoji}
                        </span>
                    </Col>
                </Row>
                <Row className={"mt-n1 mb-1"}>
                    <Col>
                        <b>{this.props.emotionName}</b>
                    </Col>
                </Row>
            </Container>
        </td>;
    }
}

class IntensityCell extends React.Component {
    render() {
        const intensity = PlutchikSelector.intensitiesMap[this.props.intensityName];
        return <td className={"text-center align-middle"} style={{background: intensity.backgroundColor + "AA"}}>
            <Container>
                <Row>
                    <Col className={"p-0"}>
                        <Media left>
                            <Media object style={{
                                maxWidth: '21px',
                                opacity: "80%"
                            }}
                                   src={intensity.image} alt={intensity.label} />
                        </Media>
                    </Col>
                </Row>
                <Row className={"mt-n1"}>
                    <Col className={"p-0"}>
                        <b>{intensity.label}</b>
                    </Col>
                </Row>
            </Container>
        </td>;
    }
}

class EmotionsExampleBodyRow extends React.Component {
    render() {
        return <>
            <Row>
                <Col>
                    <p>Jede der möglichen Emotionen ist unten aufgelistet, zusammen mit Synonymen, um sie besser zu
                        definieren, und mit einem Beispiel-Absatz.</p>
                    <Table>
                        <thead>
                        <tr className={"text-center"}>
                            <th className={"align-middle p-1"}>Emotion</th>
                            <th className={"align-middle p-1"}>Definition mit Synonymen</th>
                            <th className={"align-middle p-1"}>Beispiel-Absatz</th>
                            <th className={"align-middle p-1"}>Beispiel-Intensität</th>
                        </tr>
                        </thead>
                        <tbody>
                        <ExampleDefinitionTableLine emotionName={"Freude"} intensityName={"stark"}>
                            Endlich weg von den Autos, hin zu den Velos. Gesund, ökologisch, schnell, gut für die
                            Psyche. Das Zweirad erweist sich in vieler Hinsicht als ideales Verkehrsmittel. Der
                            Lockdown hat uns die Augen geöffnet. Herr und Frau Schweizer schwingen sich häufiger
                            auf den Sattel und treten in die Pedale. Bis zu dreimal mehr als noch vor Corona!
                        </ExampleDefinitionTableLine>
                        <ExampleDefinitionTableLine emotionName={"Traurigkeit"} intensityName={"stark"}>
                            In der Nacht auf Mittwoch kamen bei den Protesten gegen Polizeigewalt in der US-Stadt
                            Kenosha (Wisconsin) zwei Menschen ums Leben. Eine weitere Person wurde durch Schüsse
                            verletzt.
                        </ExampleDefinitionTableLine>
                        <ExampleDefinitionTableLine emotionName={"Vertrauen"} intensityName={"mittel"}>
                            Die Geschäfte gehen wieder auf, die Schulen auch. Es ist ein erster Schritt zurück ins
                            normale Leben von uns allen. Wir haben uns danach gesehnt. Nun sind wir froh, dass es so
                            weit ist. Unser aller Ziel: keine zweite Welle. Kein zweites Ansteigen der Kurve. Kein
                            zweiter Lockdown.
                        </ExampleDefinitionTableLine>
                        <ExampleDefinitionTableLine emotionName={"Ekel"} intensityName={"stark"}>
                            Es sind üble Vorwürfe, die eine ehemalige Mitarbeiterin des US-Senats gegen Joe Biden (77)
                            erhebt. Alexandra Reade (56) hat den wahrscheinlichen Präsidentschaftskandidaten der
                            Demokraten Mitte April wegen sexueller Nötigung angezeigt. Biden soll 1993 Reade in einem
                            isolierten Korridor des Senats angegriffen, mit den Fingern berührt und letztlich
                            penetriert haben – alles gegen ihren Willen.
                        </ExampleDefinitionTableLine>
                        <ExampleDefinitionTableLine emotionName={"Angst"} intensityName={"mittel"}>
                            Das Problem: Das Parlament verlangt nun ein Sondergesetz. Und riskiert damit, dass ganz viel
                            wertvolle Zeit verloren geht. Und die Kurve wieder steigt.
                        </ExampleDefinitionTableLine>
                        <ExampleDefinitionTableLine emotionName={"Ärger"} intensityName={"wenig"}>
                            Alles wunderbar also – wäre da nur nicht die städtische Infrastruktur, die oft noch
                            ziemlich velounfreundlich ist. Seit Jahren schielen wir nach Holland oder Skandinavien,
                            wo es teils mehr Velos als Menschen gibt, wo das Velo fester, unbestrittener Bestandteil
                            des Alltags ist. Sommer wie Winter.
                        </ExampleDefinitionTableLine>
                        <ExampleDefinitionTableLine emotionName={"Antizipation"} intensityName={"mittel"}>
                            Gewiss: Das ist das politische Spiel in den USA. Die Republikaner würden es umgekehrt wohl
                            nicht anders machen. Aber die Amerikaner sollten sich auch an die Doppelmoral der
                            Demokraten erinnern, wenn der nächste Aufschrei kommt.
                        </ExampleDefinitionTableLine>
                        <ExampleDefinitionTableLine emotionName={"Überraschung"} intensityName={"wenig"}>
                            Über ein halbes Dutzend Frauen haben gegen Joe Biden bereits sexuelle Missbrauchvorwürfe
                            erhoben. Und trotzdem wird in den USA kaum über das Verhalten des
                            Präsidentschaftskandidaten diskutiert.
                        </ExampleDefinitionTableLine>
                        </tbody>
                    </Table>
                    <h5>Intensität</h5>
                    <p>Beispiele für Kommentare mit <i>Angst</i>-Emotion, aber mit unterschiedlicher Intensität.
                        Das Thema ist die Schweizer Reaktion auf den Coronavirus.</p>
                    <Table>
                        <thead>
                        <tr className={"text-center"}>
                            <th>Emotion</th>
                            <th>Intensität</th>
                            <th>Beispiel-Absatz</th>
                        </tr>
                        </thead>
                        <tbody>
                        <ExampleStrengthTableLine emotionName={"Angst"} intensityName={"stark"}>
                            Die täglichen Todesfälle, die monatelange Isolation und die Zukunftsangst schlagen auf
                            die Psyche. Amerikanische Experten warnen vor einer historischen Welle mentale
                            Gesundheitsprobleme, die dem Land bevorsteht: Depressionen, Drogenmissbrauch,
                            posttraumatische Belastungsstörung und Selbstmord.</ExampleStrengthTableLine>
                        <ExampleStrengthTableLine emotionName={"Angst"} intensityName={"mittel"}>
                            Das Problem: Das Parlament verlangt nun ein Sondergesetz. Und riskiert damit, dass ganz viel
                            wertvolle Zeit verloren geht. Und die Kurve wieder steigt.
                        </ExampleStrengthTableLine>
                        <ExampleStrengthTableLine emotionName={"Angst"} intensityName={"wenig"}>
                            Stattdessen öffnete die Regierung die Grenzen – und gab gleichzeitig die ­Verantwortung an
                            die Kantone ab. Diese sind mit der Aufgabe ganz offensichtlich überfordert, wie sich diese
                            Woche zeigte. So fehlen ihnen etwa die Passagier­listen all jener, die per Flugzeug oder
                            Bus aus Risikoländern kommen.
                        </ExampleStrengthTableLine>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>;
    }
}

export default EmotionsExampleBodyRow;
