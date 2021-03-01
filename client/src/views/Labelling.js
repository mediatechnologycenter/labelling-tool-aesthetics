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
import axios from 'axios';
import queryString from 'query-string';
import Article from "../components/Labelling/Article";
import ArticleInstructions from "../components/Labelling/ArticleInstructions";
import ArticleStanceQuestions from "../components/Labelling/ArticleStanceQuestions";
import SubmitInstructionsAndButton from "../components/Labelling/SubmitInstructionsAndButton";
import {Col, Container, UncontrolledAlert} from "reactstrap";
import Row from "reactstrap/es/Row";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ArticleEmotionQuestion from "../components/Labelling/ArticleEmotionQuestion";
import {browserName, browserVersion, deviceType, osName, osVersion} from "react-device-detect";
import PlutchikSelector from "../components/Labelling/PlutchikSelector";
import ContainedHr from "../components/ContainedHr";
import Cookies from "js-cookie";

function getDeviceSpecs() {
    return  {
        osName: osName,
        osVersion: osVersion,
        browserName: browserName,
        browserVersion: browserVersion,
        deviceType: deviceType
    };
}

class Labelling extends React.Component {

    static defaultProps = {
        contentBackgroundColor: "#f2f0e6",
        instructionsTextColor: "#1e0ead"
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            labellerID: null,
            labelledArticlesCount: null,
            article: null,
            paragraphsEmotionLabel: {},
            paragraphsError: {},
            stanceArticleQuestionsLabel: {label: null, notSure: false},
            stanceArticleQuestionsError: {},
            emotionArticleLabel: {label: null, intensity: null, notSure: false},
            emotionArticleError: false,
            serverFetchError: null,
        };

        this.handleEmotionArticle = this.handleEmotionArticle.bind(this);
        this.handleStanceArticle = this.handleStanceArticle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.postToBackendStatus = this.postToBackendStatus.bind(this);
        this.fetchDataAndUpdateState = this.fetchDataAndUpdateState.bind(this);
        this.fetchLabelledArticlesCount = this.fetchLabelledArticlesCount.bind(this);
        this.handleEmotionParagraph = this.handleEmotionParagraph.bind(this);
    }

    componentDidMount() {
        const params = queryString.parse(this.props.location.search);
        let token = params.token;
        const fromEmail = Boolean(params.email);

        if(token && fromEmail) {
            Cookies.set('token', token);
        }
        else {
            const cookieToken = Cookies.get('token');
            if (cookieToken && token && cookieToken !== token) {
                Cookies.set('token', token);
            }

            if (!token) {
                if (cookieToken) {
                    token = Cookies.get('token');
                } else {
                    this.props.history.push("/authenticatelabeller?target=labelling");
                }
            }
        }
        this.setState({labellerID: token});

        this.fetchDataAndUpdateState(token);
        this.fetchLabelledArticlesCount(token);
    }

    fetchLabelledArticlesCount(labellerID) {
        return axios.get("/labelling/ntagged?labellerID=" + labellerID)
            .then(res => {
                this.setState({labelledArticlesCount: res.data.count})
            })
            .catch(err => console.log(err));
    }

    fetchDataAndUpdateState(labellerID) {
        return axios.get(`/labelling/article?labellerID=${labellerID}`)
            .then(res => {
                const {status, article} = res.data;
                const paragraphsError = {};
                article.paragraphs.forEach((par) => {
                    paragraphsError[par.consecutiveID] = false;
                });

                const stanceArticleQuestionsError = {};
                article.stanceQuestions.forEach((q) => {
                    stanceArticleQuestionsError[q.ID] = false;
                });

                return this.setState({
                    article: article,
                    paragraphsEmotionLabel: status.paragraphsEmotionLabel,
                    paragraphsError: paragraphsError,
                    stanceArticleQuestionsLabel: status.stanceArticleQuestionsLabel,
                    stanceArticleQuestionsError: stanceArticleQuestionsError,
                    emotionArticleLabel: status.emotionArticleLabel,
                    emotionArticleError: false
                });
            })
            .catch(err => {
                console.log(err);
                if(err.response && err.response.data.message) {
                    console.log(err.response.data); // => the response payload
                    this.setState({
                        serverFetchError: err.response.data.message,
                    });
                }
                else {
                    this.setState({
                        serverFetchError: "Server error:\n" + JSON.stringify(err)
                    });
                }
            });
    }

    handleEmotionParagraph(event, fieldToUpdate, data, paragraph) {
        let paragraphsEmotionLabel = {...this.state.paragraphsEmotionLabel};
        paragraphsEmotionLabel[paragraph.consecutiveID][fieldToUpdate] = data;
        paragraphsEmotionLabel[paragraph.consecutiveID].enteredAt = Date.now();
        if(data === PlutchikSelector.emotionlessLabel) {
            paragraphsEmotionLabel[paragraph.consecutiveID].intensity = -1
        }
        else if(fieldToUpdate === "label" && paragraphsEmotionLabel[paragraph.consecutiveID].intensity === -1) {
            paragraphsEmotionLabel[paragraph.consecutiveID].intensity = null;
        }
        let paragraphsError = {...this.state.paragraphsError};
        paragraphsError[paragraph.consecutiveID] = paragraphsError[paragraph.consecutiveID] &&
            (this.state.paragraphsEmotionLabel[paragraph.consecutiveID] === null ||
                this.state.paragraphsEmotionLabel[paragraph.consecutiveID].label === null ||
                this.state.paragraphsEmotionLabel[paragraph.consecutiveID].intensity === null);
        this.setState({paragraphsEmotionLabel, paragraphsError});
        this.postToBackendStatus('/labelling/tag/paragraph/emotion', paragraph.consecutiveID, paragraphsEmotionLabel[paragraph.consecutiveID]);
    }

    handleStanceArticle(event, fieldToUpdate, data, question) {
        const stanceArticleQuestionsLabel = this.state.stanceArticleQuestionsLabel;
        stanceArticleQuestionsLabel[question.ID][fieldToUpdate] = data;
        stanceArticleQuestionsLabel[question.ID].enteredAt = Date.now();
        let stanceArticleQuestionsError = {...this.state.stanceArticleQuestionsError};
        stanceArticleQuestionsError[question.ID] = stanceArticleQuestionsError[question.ID] &&
            (this.state.stanceArticleQuestionsLabel[question.ID] === null ||
                this.state.stanceArticleQuestionsLabel[question.ID].label === null);
        console.log("stanceArticleQuestionsLabel[question.ID] = " + stanceArticleQuestionsError[question.ID]);
        console.log("this.state.stanceArticleQuestionsLabel[question.ID].label = " + this.state.stanceArticleQuestionsLabel[question.ID].label);
        this.setState({stanceArticleQuestionsLabel, stanceArticleQuestionsError});
        this.postToBackendStatus('/labelling/tag/article/stance', question.ID, stanceArticleQuestionsLabel[question.ID]);
    }

    handleEmotionArticle(event, fieldToUpdate, data) {
        const emotionArticleLabel = this.state.emotionArticleLabel;
        emotionArticleLabel[fieldToUpdate] = data;
        emotionArticleLabel.enteredAt = Date.now();
        if(data === PlutchikSelector.emotionlessLabel) {
            emotionArticleLabel.intensity = -1
        }
        else if(fieldToUpdate === "label" && emotionArticleLabel.intensity === -1) {
            emotionArticleLabel.intensity = null;
        }

        this.setState({emotionArticleLabel,
            emotionArticleError: this.state.emotionArticleError &&
                (emotionArticleLabel.label === null || emotionArticleLabel.intensity === null)});
        this.postToBackendStatus('/labelling/tag/article/emotion', null, emotionArticleLabel);
    }

    postToBackendStatus(entryPoint, elemID, data) {
        axios.post(entryPoint, {
            labeller: this.state.labellerID,
            article: this.state.article._id,
            elemID: elemID,
            data: data
        })
            .catch(error => {
                console.log(error);
            });
    }

    handleSubmit(event) {
        let error = false;

        let paragraphsError = {...this.state.paragraphsError};
        Object.entries(this.state.paragraphsEmotionLabel).forEach(
            ([key, status]) => {
                if(status === null || status.label === null || status.intensity === null) {
                    error = true;
                    paragraphsError[key] = true;
                }
            }
        );

        let stanceArticleQuestionsError = this.state.stanceArticleQuestionsError;
        Object.entries(this.state.stanceArticleQuestionsLabel).forEach(
            ([key, status]) => {
                if(status === null || status.label === null) {
                    error = true;
                    stanceArticleQuestionsError[key] = true;
                }
            }
        );

        let emotionArticleError = this.state.emotionArticleError;
        if(this.state.emotionArticleLabel === null ||
            this.state.emotionArticleLabel.label === null ||
            this.state.emotionArticleLabel.intensity === null) {
            emotionArticleError = true;
            error = true;
        }

        if(error) {
            this.setState({paragraphsError, stanceArticleQuestionsError, emotionArticleError});
            alert("Please fill-in the missing entries (now in red) and try again");
            return;
        }

        axios.post("/labelling/submit", {
            labeller: this.state.labellerID,
            article: this.state.article._id,
            paragraphsEmotionLabel: this.state.paragraphsEmotionLabel,
            stanceArticleQuestionsLabel: this.state.stanceArticleQuestionsLabel,
            emotionArticleLabel: this.state.emotionArticleLabel,
            deviceSpecs: getDeviceSpecs(),
        })
            .then(response => {
                if(this.state.labelledArticlesCount) {
                    this.setState({labelledArticlesCount: this.state.labelledArticlesCount + 1});
                }
                else {
                    this.fetchLabelledArticlesCount(this.state.labellerID); //there was an error before, retry
                }
                this.fetchDataAndUpdateState(this.state.labellerID).then(() =>
                    window.scrollTo(0, 0));
            })
            .catch(error => {
                alert("Server error, please try again");
                console.log(error);
            });
    }

    render() {
        if(this.state.serverFetchError !== null) {
            return <>
                <Header selectedPage={"labelling"}/>
                <Container>
                <Row>
                    <Col>
                        <UncontrolledAlert color="danger" fade={true}>
                                        <span className="alert-inner--icon">
                                            <i className="ni ni-support-16" />
                                        </span>
                            <span className="alert-inner--text ml-1">
                            <strong>Error!</strong> {this.state.serverFetchError}
                                        </span>
                        </UncontrolledAlert>
                    </Col>
                </Row>
            </Container>
                <Footer/>
                </>;
        }

        if(this.state.article === null) {
            return null;
        }
        return (
            <>
                <Header selectedPage={"labelling"}/>
                <Container>
                    <Row className={"align-items-center"}>
                        <Col xs={12} sm={8} md={8} lg={9} xl={9}>
                            <h2>Verfahren zur Beschriftung</h2>
                        </Col>
                        <Col xs={12} sm={4} md={4} lg={3} xl={3} className={"text-center"}>
                            {this.state.labelledArticlesCount ?
                                <div style={{color: this.props.instructionsTextColor}}>
                                    # gekennzeichnete Artikel: {this.state.labelledArticlesCount}
                                </div>
                                : null}
                        </Col>
                    </Row>
                </Container>

                <ArticleInstructions token={this.state.labellerID}
                                     instructionsTextColor={this.props.instructionsTextColor}
                />
                <Article articleJson={this.state.article}
                         paragraphsEmotionLabel={this.state.paragraphsEmotionLabel}
                         paragraphsError={this.state.paragraphsError}
                         onClickEmotionParagraph={this.handleEmotionParagraph}
                         contentBackgroundColor={this.props.contentBackgroundColor}
                         instructionsTextColor={this.props.instructionsTextColor}
                />
                <ContainedHr/>
                <ArticleEmotionQuestion onClick={this.handleEmotionArticle}
                                        emotionStatus={this.state.emotionArticleLabel}
                                        error={this.state.emotionArticleError}
                                        instructionsTextColor={this.props.instructionsTextColor}
                />
                <ContainedHr/>
                <ArticleStanceQuestions questions={this.state.article.stanceQuestions}
                                        onClick={this.handleStanceArticle}
                                        stanceStatus={this.state.stanceArticleQuestionsLabel}
                                        questionsError={this.state.stanceArticleQuestionsError}
                                        instructionsTextColor={this.props.instructionsTextColor}
                />
                <ContainedHr/>
                <SubmitInstructionsAndButton onClick={this.handleSubmit}
                                             instructionsTextColor={this.props.instructionsTextColor}
                />
                <Footer/>
            </>
        );
    }
}

export default Labelling;
