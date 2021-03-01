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

import {Col, Row, Container, Button, UncontrolledCollapse} from "reactstrap";
import EmotionsExampleBodyRow from "./EmotionsExamplesBodyRow";

class EmotionsExamples extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {show: false}
    }

    render() {
        return <Container className={"p-0"}>
            <Row>
                <Col>
                    <h5>Definitionen und Beispiele von Emotionen</h5>
                    <Button id="toggler" onClick={() => this.setState({show: !this.state.show})}>
                        {this.state.show ? "Beispiele ausblenden" : "Beispiele einblenden"}
                    </Button>
                </Col>
            </Row>
            <UncontrolledCollapse toggler="#toggler"><EmotionsExampleBodyRow/></UncontrolledCollapse>
        </Container>;
    }
}

export default EmotionsExamples;
