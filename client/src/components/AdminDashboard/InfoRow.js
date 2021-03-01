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
import {Badge, Col, Row} from "reactstrap";

class InfoRow extends React.Component {

    static defaultProps = {
        color: "primary",
    };

    render() {
        return <Row>
            <Col xs={12} sm={8} md={7} lg={7} xl={7}>{this.props.children}</Col>
            <Col xs={12} sm={4} md={5} lg={5} xl={5}>{this.props.counter !== null && this.props.counter !== undefined ?
                (<Badge color={this.props.color}>{this.props.counter}</Badge>)
                : ((this.props.fallback !== null && this.props.fallback !== undefined) ?
                    <Badge color={this.props.color}>{this.props.fallback}</Badge> : null)}
            </Col>
        </Row>;
    }
}

export default InfoRow;
