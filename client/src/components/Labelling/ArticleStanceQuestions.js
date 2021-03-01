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

import {Col, Container, Row} from "reactstrap";
import SingleStanceQuestion from "./SingleStanceQuestion";

class ArticleStanceQuestions extends React.Component {
    static defaultProps = {
        instructionsTextColor: "#1e0ead"
    };

  render() {
      return (
            <Container className="shape-container align-items-center" >
                <Row style={{
                    color: this.props.instructionsTextColor
                }}>
                    <Col>
                        <h3>Standpunkt des Artikels zum Thema</h3>
                        <h6>Bitte wählen Sie nun aus, wie der Artikel auf die folgende(n) Frage(n) antwortet:</h6>
                    </Col>
                </Row>
                {this.props.questions.map((question) => {
                    return (
                        <SingleStanceQuestion key={"StanceQuest" + question.ID.toString()}
                                       stanceStatus={this.props.stanceStatus[question.ID]}
                                       error={this.props.questionsError[question.ID]}
                                       onClick={(event, fieldToUpdate, data) => {return this.props.onClick(event, fieldToUpdate, data, question);}}
                                       instructionsTextColor={this.props.instructionsTextColor}>
                        {question.text}
                    </SingleStanceQuestion>
                );
                })}
            </Container>
    );
  }
}

export default ArticleStanceQuestions;
