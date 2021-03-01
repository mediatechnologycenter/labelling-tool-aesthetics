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

import {Col, Row, Table, Container} from "reactstrap";
import Labelling from "../../views/Labelling";
import StanceSelectorAbstract from "../Labelling/StanceSelectorAbstract";

class ExampleTableLine extends React.Component {
    render() {
        return <tr>
            <StanceCell stanceName={this.props.stanceName}/>
            <td className={"align-middle"} style={{background: Labelling.defaultProps.contentBackgroundColor}}>
                {this.props.children}
            </td>
            <td className={"align-middle"}>Should abortion be legal?</td>
        </tr>;
    }
}

class StanceCell extends React.Component {
    render() {
        const stance = StanceSelectorAbstract.optionsMap[this.props.stanceName];
        return <td className={"text-center align-middle"} style={{background: stance.color + "8A"}}>
            <Container>
                <Row>
                    <Col>
                        <span role="img"
                              style={{fontSize: 32}}
                              aria-label={stance.name + " emoji"}>
                            {stance.emoji}
                        </span>
                    </Col>
                </Row>
                <Row className={"mt-n1 mb-1"}>
                    <Col>
                        <b>{stance.name}</b>
                    </Col>
                </Row>
            </Container>
        </td>;
    }
}


class StanceExamplesBodyRow extends React.Component {
    render() {
        return <>
            <Row>
                <Col>
                    <Table>
                        <thead>
                        <tr className={"text-center"}>
                            <th className={"align-middle p-1"}>Stance</th>
                            <th className={"align-middle p-1"}>Example article</th>
                            <th className={"align-middle p-1"}>Stance question</th>
                        </tr>
                        </thead>
                        <tbody>
                        <ExampleTableLine stanceName={"Ja, dafür"}>
                            Die Entscheidung darüber, wann und ob Kinder geboren werden sollen, ist von zentraler
                            Bedeutung für die Unabhängigkeit einer Frau und ihre Fähigkeit, ihre Zukunft zu bestimmen.
                        </ExampleTableLine>
                        <ExampleTableLine stanceName={"Diskutierend"}>
                            Wenn wir zu dem Schluss kommen, dass Abtreibung nicht moralisch falsch ist, bedeutet das
                            nicht, dass es richtig ist, abzutreiben; wir müssen uns fragen, ob eine Abtreibung in jedem
                            Einzelfall das Beste (oder das am wenigsten Schlechte) ist. Wenn wir zu dem Schluss kommen,
                            dass ein Schwangerschaftsabbruch moralisch falsch ist, bedeutet das nicht, dass es immer
                            unzulässig ist, abzutreiben; wir müssen uns fragen, ob ein Schwangerschaftsabbruch weniger
                            falsch ist als die Alternativen.
                        </ExampleTableLine>
                        <ExampleTableLine stanceName={"Nein, gegen"}>
                            Die Tötung eines unschuldigen Menschen ist falsch, auch wenn dieser Mensch noch nicht
                            geboren ist.
                        </ExampleTableLine>
                        <ExampleTableLine stanceName={"Kein Bezug"}>
                            Die meisten Unternehmerinnen, die an Networking-Veranstaltungen teilgenommen haben,
                            können sich auf dieses Szenario beziehen: Sie betreten ein überfülltes Seminar und
                            können die Anzahl der Frauen dort an einer Hand abzählen. Wenn Unternehmerinnen mit
                            überwiegend männlichen Führungskräften über Geschäfte sprechen, kann das beunruhigend sein.
                        </ExampleTableLine>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>;
    }
}

export default StanceExamplesBodyRow;
