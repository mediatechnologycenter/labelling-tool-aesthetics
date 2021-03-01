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
import Paragraph from "./Paragraph";


class Article extends React.Component {

    static defaultProps = {
        contentBackgroundColor: "#f2f0e6",
        instructionsTextColor: "#1e0ead"
    };

  render() {
      if (!this.props.articleJson) {
          return null;
      }
      const { articleJson } = this.props;

      return (
            <Container className="shape-container align-items-center">
                <Row style={{background: this.props.contentBackgroundColor}}>
                    <Col>
                        <h2> {articleJson.title}</h2>
                        <h5> {articleJson.snippet}</h5>
                    </Col>
                </Row>
                <Row style={{
                    color: this.props.instructionsTextColor,
                }} className={"text-center mt-3 mb-n2"}>
                    <Col xs={12} sm={5} md={5} lg={5} xl={5}>
                        <h5>Artikel Absatz</h5>
                    </Col>
                    <Col xs={12} sm={7} md={7} lg={7} xl={7}>
                        <h5>Emotion und Intensität?</h5>
                    </Col>
                </Row>
                {articleJson.paragraphs.map((par, index) => {
                    return (<Paragraph key={articleJson.articleID + par.consecutiveID.toString()}
                                       emotionStatus={this.props.paragraphsEmotionLabel[par.consecutiveID]}
                                       error={this.props.paragraphsError[par.consecutiveID]}
                                       contentBackgroundColor={this.props.contentBackgroundColor}
                                       onClick={(event, fieldToUpdate, data) => {return this.props.onClickEmotionParagraph(event, fieldToUpdate, data, par);}}
                                       instructionsTextColor={this.props.instructionsTextColor}>
                        {par.text}
                    </Paragraph>);
                })}
            </Container>
    );
  }
}

export default Article;
