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
import PlutchikSelector from "./PlutchikSelector";

class ArticleEmotionQuestion extends React.Component {
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
                        <h3>Emotion des gesamten Artikels</h3>
                        <h6>Welche Emotion wird vom gesamten Text am Stärksten vermittelt?</h6>
                    </Col>
                </Row>
                <Row style={{background: this.props.error ? "#FF9991" : null}}>
                    <Col>
                        <PlutchikSelector emotionStatus={this.props.emotionStatus}
                                          onClick={this.props.onClick}
                                          imNotSureFontSize={18}/>
                    </Col>
                </Row>
            </Container>
    );
  }
}

export default ArticleEmotionQuestion;
