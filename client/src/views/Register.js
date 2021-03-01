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
import {Container} from "reactstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Col from "reactstrap/es/Col";
import Row from "reactstrap/es/Row";

class AuthenticateLabeller extends React.Component {

    static emailSubject = "Studienregistrierung";
    static emailText = "Bitte melden Sie mich für die Studie an.%0D%0A" + "[Ihr Name]%0D%0A" + "[Ihr Familienname]%0D%0A" +
        "[Ihr Geburtsdatum]%0D%0A%0D%0A" + "Ich habe die Bedingungen gelesen und akzeptiere sie.%0D%0A%0D%0A" + "Mit freundlichen Grüßen%0D%0A";

    render() {
        return (<>
            <Header/>
            <Container className="shape-container align-items-center">
                <Row>
                    <Col>
                <h2>Anmeldung</h2>

                    <p>Um sich für die Studie anzumelden, senden Sie bitte eine E-Mail an <a
                        href={"mailto:mtc@ethz.ch@gmail.com?subject=" + AuthenticateLabeller.emailSubject +
                        "&body=" + AuthenticateLabeller.emailText}>
                        mtc@ethz.ch
                    </a> unter Angabe:
                        <ul>
                            <li>Ihres Vor- und Nachnamens</li>
                            <li>Ihres Geburtsdatums</li>
                            <li>Ihrer Zustimmung zu den <a href={"/termsandconditions"} target={"_blank"} rel="noopener noreferrer"> Bedingungen </a>
                            </li>
                        </ul>
                    </p>
                <p>
                        Wir werden dies prüfen und Ihnen ein Token und einen Link zum Start der Studie zusenden.
                        Bitte beachten Sie, dass dieses Verfahren nicht autoamtisch ist und einige Tage dauern kann.
                    </p>
                        <p>Sie können <a
                            href={"mailto:mtc@ethz.ch?subject=" + AuthenticateLabeller.emailSubject +
                            "&body=" + AuthenticateLabeller.emailText}>
                            diese Vorlage
                        </a> direkt verwenden.</p>
                    </Col>
                </Row>
            </Container>
                <Footer/>
            </>
        );
    }
}

export default AuthenticateLabeller;
