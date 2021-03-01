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

import {Button, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import EmotionsExampleBodyRow from "../Instructions/EmotionsExamplesBodyRow";
import StanceExamplesBodyRow from "../Instructions/StanceExamplesBodyRow";
import ContainedHr from "../ContainedHr";

class ArticleInstructions extends React.Component {
    static defaultProps = {
        instructionsTextColor: "#1e0ead"
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            modal: false
        };
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState({modal: !this.state.modal});
    }

    render() {
      return (
          <>
            <Container className="shape-container align-items-center pt-2" style={{
                color: this.props.instructionsTextColor
            }}>
                <Row>
                    <Col>
                        <Row>
                            <Col>
                            <h3>Image Aesthetics</h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} sm={9} md={9} lg={10} xl={10}>
                            <p>
                                Bitte lesen Sie den Artikel sorgfältig durch. Wählen Sie für jeden Absatz auf der
                                rechten Seite eine Emotion aus, die die folgende Frage am Besten beantwortet:
                                "<b><i>Welches ist das Gefühl, das in diesem Absatz vermittelt wird?</i></b>". Es ist
                                nur eine Emotion pro Absatz möglich. Wählen Sie im Zweifelsfall die Emotion aus, die
                                durch den Text am Stärksten vermittelt wird.
                            </p>
                        </Col>
                        <Col xs={12} sm={3} md={3} lg={2} xl={2}>
                            <Button
                                    style={{backgroundColor: this.props.instructionsTextColor + "AF"}}
                                    onClick={this.toggleModal}
                                    block>
                                Zeigen Sie mir Beispiele</Button>
                            <Modal size="lg" style={{maxWidth: '1250px', width: '80%'}} isOpen={this.state.modal} toggle={this.toggleModal}>
                                <ModalHeader toggle={this.toggleModal}>Biespiele</ModalHeader>
                                <ModalBody>
                                    <Container>
                                        <Row>
                                            <Col>
                                                <h3>Emotionen</h3>
                                            </Col>
                                        </Row>
                                        <EmotionsExampleBodyRow/>
                                        <ContainedHr/>
                                        <Row>
                                            <Col>
                                                <h3>Standpunkt</h3>
                                            </Col>
                                        </Row>
                                        <StanceExamplesBodyRow/>
                                    </Container>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            href={"/instructions?token=" + this.props.token}
                                    target={"_blank"}>
                                        Open instructions page</Button>{' '}
                                    <Button color="secondary" onClick={this.toggleModal}>Close</Button>
                                </ModalFooter>
                            </Modal>
                        </Col>
                        </Row>
                        <h5>Titel und Untertitel des Artikels:</h5>
                    </Col>
                </Row>
            </Container>
        </>
    );
  }
}

export default ArticleInstructions;
