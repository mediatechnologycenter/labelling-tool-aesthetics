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

import {Col, FormGroup, Input, Label, Row} from "reactstrap";

class ImNotSureCheckboxRow extends React.Component {
    static defaultProps = {
        fontSize: 16
    };

    static text = "Ich bin mir meiner Antwort nicht sicher";

    render() {
      return <Row className={"align-items-center mt-1"}>
              <Col className={"p-0"}>
                  <FormGroup check>
                      <Label check>
                          <Input type="checkbox"
                                 id={"test-id"}
                                 checked={this.props.checked === null || this.props.checked === undefined ?
                                     false : this.props.checked}
                                 onChange={(e) => this.props.onClick ?
                                     this.props.onClick(e, "notSure", !this.props.checked) : () => null}/>{' '}
                          <div style={{fontSize: this.props.fontSize}}>{ImNotSureCheckboxRow.text}</div>
                      </Label>
                  </FormGroup>
              </Col>
          </Row>
    ;
  }
}

export default ImNotSureCheckboxRow;
