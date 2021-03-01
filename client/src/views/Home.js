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
import {Button, Col, Container} from "reactstrap";
import Row from "reactstrap/es/Row";

import Header from "../components/Header";
import Footer from "../components/Footer";

class Home extends React.Component {
    render() {
        return (<>
            <Header/>
            <Container>
                <Row><Col><h2>Aesthetic Assesment Project - Labeling Tool</h2></Col></Row>
                <Row>
                    <Col>
                        <p>
                            
                            Welcome to the labeling tool for the Aesthetic Assessment of Image and Video Content  
                            project of the ETH <a target="_blank" rel="noopener noreferrer" href="https://mtc.ethz.ch">
                            Media Technology Center (MTC)</a>. The purpose of this online tool is to collect the 
                            data needed for the project.
                            <br/>
                            <br/>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eget lectus est. 
                            Duis faucibus dolor nec condimentum imperdiet. Etiam bibendum ut sem nec aliquam. 
                            Aenean eu hendrerit orci. Nunc ut pulvinar leo. Morbi porta est vestibulum tortor 
                            congue mollis. Mauris faucibus augue in ex elementum, sit amet aliquam nulla mollis. 
                            Praesent leo ligula, pretium in purus a, convallis porttitor quam. Suspendisse potenti. 
                            Suspendisse molestie tincidunt sem, et bibendum elit gravida sit amet. 
                        </p>
                        <h4>Project Description</h4>
                        <p>
                        Praesent quis risus et magna condimentum scelerisque. Morbi at augue in enim fringilla 
                        pulvinar eget non ligula. Nam ullamcorper semper nulla. Duis non nisi nibh. Sed non augue 
                        at nisi sagittis pretium et sed leo. Ut consequat neque mi, sed lacinia purus dapibus sed. 
                        Aliquam erat volutpat. Nam sed velit a sapien facilisis facilisis id et ex. Integer lectus 
                        tellus, pellentesque eleifend mollis non, suscipit at mi. Nunc dictum tortor at enim posuere 
                        faucibus. Nam bibendum finibus ante, eget convallis elit tempus et.
                        <br/>
                        Nulla vehicula ante dictum libero pellentesque, non posuere dolor suscipit. Mauris iaculis 
                        id eros id placerat. Nullam porttitor arcu vel nunc faucibus placerat. Suspendisse ac sapien 
                        sed mi ultricies hendrerit sit amet eu dolor. Suspendisse justo est, tincidunt dignissim 
                        gravida vel, aliquam nec sem. Sed semper malesuada massa ac hendrerit. Maecenas dapibus sit 
                        amet velit accumsan condimentum. Maecenas efficitur mi vitae neque eleifend sagittis. 
                        Vestibulum eget enim sit amet orci varius consectetur tempor at tortor. Nullam euismod lectus 
                        nec tellus rutrum, scelerisque varius sem cursus. Donec rhoncus lacinia dui quis dignissim. 
                        Maecenas iaculis velit vitae nibh dapibus fringilla id id odio. Ut odio mauris, mollis luctus 
                        suscipit vitae, sagittis in neque. Nunc in ex vel leo cursus imperdiet. Cras finibus risus 
                        nec nunc auctor, id lacinia sem scelerisque. 
                        </p>

                        <h4>Your role as a labeler and your tasks</h4>
                        <p>
                        Praesent quis risus et magna condimentum scelerisque. Morbi at augue in enim fringilla 
                        pulvinar eget non ligula. Nam ullamcorper semper nulla. Duis non nisi nibh. Sed non augue 
                        at nisi sagittis pretium et sed leo. Ut consequat neque mi, sed lacinia purus dapibus sed. 
                        Aliquam erat volutpat. Nam sed velit a sapien facilisis facilisis id et ex. Integer lectus 
                        tellus, pellentesque eleifend mollis non, suscipit at mi. Nunc dictum tortor at enim posuere 
                        faucibus. Nam bibendum finibus ante, eget convallis elit tempus et. <a href={"/instructions"}> Instructions</a>.
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col>

                    </Col>
                </Row>
                <Row className={"mt-3"}>
                    <Col>
                        <Button className="p-1"
                                size={"lg"}
                                href={"/authenticatelabeller"} block>
                            Start or continue labeling (registration token required)
                        </Button>
                    </Col>
                </Row>
        </Container>
            <Footer/>
            </>);
    }
}

/*
                        <Button className="p-1"
                                size={"lg"}
                                href={"/register"} block>
                            Als Beschrifter registrieren
                        </Button>
*/
export default Home;
