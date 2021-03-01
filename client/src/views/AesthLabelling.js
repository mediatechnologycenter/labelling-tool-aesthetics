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
import SubmitInstructionsAndButton from "../components/Labelling/SubmitInstructionsAndButton";
import {Button, ButtonGroup, Col, Container, UncontrolledAlert, Media, Progress, ButtonToolbar} from "reactstrap";
import Row from "reactstrap/es/Row";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Cookies from "js-cookie";

function importAll(r) {
    let images = {};
    r.keys().map((item, index) => { 
        if (true){//(index<10){ 
            images[item.replace('./', '')] = r(item); 
        }
    });
    return images;
}

//const queryset_list = ["covid_swiss_hospital", "elon_musk", "marco_odermatt", "roger_federer", "swiss_national_day", "trump", "zurich"];

//const all_images = importAll(require.context('../assets/aesth_images', false, /\.jpg/));

export const all_images = {};
//all_images["covid_swiss_hospital"] = importAll(require.context('../assets/aesth_images/covid_swiss_hospital', false, /\.(png|jpe?g|svg|JPG)$/));
all_images["elon_musk"] = importAll(require.context('../assets/aesth_images/elon_musk', false, /\.(png|jpe?g|svg|JPG)$/));
all_images["marco_odermatt"] = importAll(require.context('../assets/aesth_images/marco_odermatt', false, /\.(png|jpe?g|svg|JPG)$/));
all_images["roger_federer"] = importAll(require.context('../assets/aesth_images/roger_federer', false, /\.(png|jpe?g|svg|JPG)$/));
//all_images["swiss_national_day"] = importAll(require.context('../assets/aesth_images/swiss_national_day', false, /\.(png|jpe?g|svg|JPG)$/));
all_images["trump"] = importAll(require.context('../assets/aesth_images/trump', false, /\.(png|jpe?g|svg|JPG)$/));
//all_images["zurich"] = importAll(require.context('../assets/aesth_images/zurich', false, /\.(png|jpe?g|svg|JPG)$/));

//Never delete labellers id from collection 'labellers'!

export const queryset_list = Object.keys(all_images);

export const totalNbRounds = 4;

const displayNb = 1; //number of image pairs to display at a time

function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
            round: 0,
            currentStart: 0,
            currentStop: 0,
            imagePairs: [],
            imagePairsScores: [],
            imagePairsDates: [],
            imageTotalScores: [],
            opponentTotalScore: [],
            queryset: queryset_list[0],
            serverFetchError: null,
            width: 0,
            height: 0,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleButtonOnClick = this.handleButtonOnClick.bind(this);
        this.updateStateFromRounds = this.updateStateFromRounds.bind(this);
        this.handleQuerysetButtonOnClick = this.handleQuerysetButtonOnClick.bind(this);
        this.initializeState = this.initializeState.bind(this);

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
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
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.setState({labellerID: token});
        this.initializeState(token, queryset_list[0]);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
        //console.log(this.state.width + ", " + this.state.height)
    }

    initializeState(token_arg, queryset_arg){
        
        axios.get("/labelling/aesthetic?labellerID=" + token_arg +"&queryset=" + queryset_arg)
        .then(res => {
            //res.data is  {"_id":"6006ba4","labeller":"60054","rounds":{"1":[1,2,-3],"2":[[1,4,6]]},"createdAt":"2021-01-19T10:55:43.413Z","updatedAt":"2021-01-19T10:55:43.413Z","__v":0}
            //this.setState({placeholder_value: res.data}); //res.data will be null if does not exist!!
            this.setState({queryset: queryset_arg});
            let currentRounds = {};

            if (res.data != null) {
                //User already labelled some rounds. Resume from previous state
                currentRounds = {...res.data["rounds"]};
                this.updateStateFromRounds(currentRounds, res.data["currentStart"], res.data["currentStop"]);
            }
            else{
                //User first time doing labelling
                const initialImagePairs = [];
                const initialImageTotalScores = [];

                let all_images_name = Object.keys(all_images[queryset_arg]);
                all_images_name.forEach( (x) => {
                    initialImageTotalScores.push([x,0]);
                })

                for (let i=0; i<(all_images_name.length-1); i+=2){
                    let im1 = all_images_name[i];
                    let im2 = all_images_name[i+1];

                    if (Math.random() < 0.5){
                        initialImagePairs.push([im1, im2]);
                    }
                    else{
                        initialImagePairs.push([im2, im1]);
                    }
                }

                this.setState({imagePairs: initialImagePairs});
                this.setState({imagePairsScores: []});
                this.setState({imagePairsDates: []});
                this.setState({imageTotalScores: initialImageTotalScores});
                this.setState({round: 1});
                this.setState({currentStart: 0});
                this.setState({currentStop: Math.min(displayNb, initialImagePairs.length)});

            }
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

    handleButtonOnClick(val, index) {
        let currentScores = [...this.state.imagePairsScores];
        currentScores[index] = val;
        this.setState({imagePairsScores: currentScores});
    }
    handleQuerysetButtonOnClick(newQueryset){
       this.initializeState(this.state.labellerID, newQueryset);
    }

    updateStateFromRounds(rnds, newCurrentStart, newCurrentStop){
        const currentNbRounds = Object.keys(rnds).length;

        if (newCurrentStart < newCurrentStop){
            //We have not finished the current round yet
            let imagePairsAndScores = rnds[currentNbRounds.toString()];

            let newImagePairs = imagePairsAndScores.map( (x) => {
                return [x[0], x[1]];
              });

            let newImagePairsScores = imagePairsAndScores.map( (x) => {
                return [x[2], x[3]];
              });

            let newImagePairsDates = imagePairsAndScores.map( (x) => {
                return x[4];
            });

            this.setState({imagePairs: newImagePairs});
            this.setState({imagePairsScores: newImagePairsScores});
            this.setState({imagePairsDates: newImagePairsDates});
            this.setState({round: currentNbRounds});
            this.setState({currentStart: newCurrentStart});
            this.setState({currentStop: newCurrentStop});

            return;
        }

        //We have finished the current round so we generate new image pairs (with Edmond's Blossom algorithm)

        const imageTotalScore = {};
        const opponentTotalScore = {};
        let all_images_name = Object.keys(all_images[this.state.queryset]);
        all_images_name.forEach( (x) => {
            imageTotalScore[x] = 0;
            opponentTotalScore[x] = 0;
        });

        const participants_arg = [];
        all_images_name.forEach((x,i) => participants_arg.push({ id: x, seed: i+1 }));

        const matches_arg = [];

        for (let i=1; i<=currentNbRounds; i++){
            rnds[i.toString()].forEach(([im1, im2, score1, score2]) => {
                
                imageTotalScore[im1.toString()] += score1;
                imageTotalScore[im2.toString()] += score2;
                matches_arg.push(        
                        {
                        round: i,
                        home: { id: im1, points: score1 },
                        away: { id: im2, points: score2 }
                        }
                        )
            })
        }

        for (let i=1; i<=currentNbRounds; i++){
            rnds[i.toString()].forEach(([im1, im2, score1, score2]) => {
                if (score1 > 0){
                    opponentTotalScore[im1.toString()] += imageTotalScore[im2.toString()];
                }
                if (score2 > 0){
                    opponentTotalScore[im2.toString()] += imageTotalScore[im1.toString()];
                }
            })
        }

        const sortedImageTotalScore = [];
        for (let imname in imageTotalScore) {
            sortedImageTotalScore.push([imname, imageTotalScore[imname], opponentTotalScore[imname]]);
        }

        sortedImageTotalScore.sort((a, b) => {
            return b[1] - a[1] || b[2] - a[2];
        });

        //Edmond's Blossom algorithm to choose new pairs:

        let tournament = require('swiss-pairing')(
            {maxPerRound: 3} //Maximum number of points per match!
            );
        
        let matchups = tournament.getMatchups(currentNbRounds+1, participants_arg, matches_arg);

        const newImagePairs = [];

        matchups.forEach((x) => {
            let im1 = x.home;
            let im2 = x.away;
            if ((im1 != null) && (im2 != null)){

                if (Math.random() < 0.5){
                    newImagePairs.push([im1, im2]);
                }
                else{
                    newImagePairs.push([im2, im1]);
                }
            }
        })

        this.setState({imagePairs: newImagePairs});
        this.setState({imagePairsScores: Array(newImagePairs.length).fill(null)});
        this.setState({imagePairsDates: Array(newImagePairs.length).fill(null)});
        this.setState({round: currentNbRounds+1});
        this.setState({imageTotalScores: sortedImageTotalScore});
        this.setState({currentStart: 0});
        this.setState({currentStop: Math.min(displayNb, newImagePairs.length)});
    }

    handleSubmit(event) {
        let sub_scores = this.state.imagePairsScores.slice(this.state.currentStart, this.state.currentStop);
        let sub_imgPairs = this.state.imagePairs.slice(this.state.currentStart, this.state.currentStop);
        //console.log(JSON.stringify(sub_scores))
        //console.log(JSON.stringify(sub_imgPairs))
        if (sub_scores.length < sub_imgPairs.length || flatten(sub_scores).includes(undefined) || flatten(sub_scores).includes(null)){
            //console.log("Please label everything");
            alert("Please label everything before submitting.");
            return;
        }
        
        return axios.get("/labelling/aesthetic?labellerID=" + this.state.labellerID + "&queryset=" + this.state.queryset)//this.state.labellerID)
        .then(res => {
            //res.data is  {"_id":"6006baaf9799fe12521a3934","labeller":"60053398d444630c8bb11bb4","rounds":{"1":[1,2,-3],"2":[[1,4,6]]},"createdAt":"2021-01-19T10:55:43.413Z","updatedAt":"2021-01-19T10:55:43.413Z","__v":0}
            //this.setState({placeholder_value: res.data}); //res.data will be null if does not exist!!
            let newRounds = {};

            if (res.data != null) {
                newRounds = {...res.data["rounds"]};
            }

            const timestamp = new Date().toISOString();

            newRounds[this.state.round.toString()] = this.state.imagePairs.map( (x, i) => {

                let ts = null;
                let width = null;
                let height = null;
                let score1 = null;
                let score2 = null;

                if (i >= this.state.currentStart && i < this.state.currentStop){
                    ts = timestamp;
                    width = this.state.width;
                    height = this.state.height;
                    score1 = this.state.imagePairsScores[i][0]
                    score2 = this.state.imagePairsScores[i][1]
                }
                else{
                    if (i < this.state.currentStart){
                        score1 = newRounds[this.state.round.toString()][i][2];
                        score2 = newRounds[this.state.round.toString()][i][3];
                        ts = newRounds[this.state.round.toString()][i][4];
                        width = newRounds[this.state.round.toString()][i][5];
                        height = newRounds[this.state.round.toString()][i][6];
                    }

                    
                }

                return [...x, score1, score2, ts, width, height];
                
              });
            
            let newCurrentStart = this.state.currentStart + displayNb;
            let newCurrentStop = Math.min(this.state.currentStop + displayNb, this.state.imagePairs.length);
            
            return axios.post("/labelling/aesthetic?labellerID=" + this.state.labellerID + "&queryset=" + this.state.queryset, {
                rounds: newRounds,
                currentStart: newCurrentStart,
                currentStop: newCurrentStop
            }).then(
                res => {
                    this.updateStateFromRounds(newRounds, newCurrentStart, newCurrentStop);
                    window.scrollTo(0,0);
                    return res;
                }
            )
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

        //if(this.state.article === null) {
        //    return null;
        //}
        // <p> {JSON.stringify(this.state.imagePairsScores)}</p>
        // <p> {JSON.stringify(this.state.placeholder_value)}</p>

        return (
            <>
                <Header selectedPage={"labelling"}/>
                <Container>
                        <Row><Col><h2>Labeling</h2></Col></Row>

                        <Row><Col xs={12} sm={12} md={12} lg={12} xl={12}>
                            <ButtonGroup>
                            {queryset_list.map( (x,i) => {
                                return (
                                    <div>
                                    <Button color="secondary" onClick={() => this.handleQuerysetButtonOnClick(x)} active={this.state.queryset === x}>{x.replace(/_/g, ' ')}</Button>&nbsp;
                                    </div>
                                )}
                                )
                            }
                            </ButtonGroup>
                        </Col>
                        </Row>
                        <Row>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                            <hr/>
                            {this.state.round <= totalNbRounds && this.state.round > 0 &&
                            <div>
                            <div className="text-center">Round {this.state.round} / {totalNbRounds}</div>
                            <Progress value={(100*((this.state.currentStart/this.state.imagePairs.length) + this.state.round-1)) / totalNbRounds}></Progress>
                            </div>
                            }
                        </Col>
                        </Row>
                </Container>
                <br/>
                <br/>
                {this.state.round <= totalNbRounds && 
                this.state.imagePairs.map(([im1, im2], i) => {

                    if (i >= this.state.currentStart && i < this.state.currentStop){
                        return (
                        <div>
                            <Container>
                            <Row>
                                <Col xs={12} sm={12} md={6} lg={6} xl={6} className="my-1 my-sm-1">
                                    <div className="container">
                                    <img src={all_images[this.state.queryset][im1]} style={{maxWidth: "100%",  maxHeight: 550}}/>
                                    <span className="top-left">A ({im1})</span> 
                                    </div>

                                </Col>
                                
                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                    <div className="container"> 
                                    <img src={all_images[this.state.queryset][im2]} style={{maxWidth: "100%", maxHeight: 550}} />
                                    <span className="top-left">B ({im2})</span>
                                    </div>
                                </Col>
                                
                            </Row>
                            <br/>
                            <Row>
                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <div class="row justify-content-center">
                                        <ButtonGroup>
                                            <Button color="primary" onClick={() => this.handleButtonOnClick([3,0], i)} active={JSON.stringify(this.state.imagePairsScores[i]) === JSON.stringify([3,0])}>A is better</Button>
                                            &nbsp;
                                            <Button color="primary" onClick={() => this.handleButtonOnClick([1,0], i)} active={JSON.stringify(this.state.imagePairsScores[i]) === JSON.stringify([1,0])}>A is slightly better</Button>
                                            &nbsp;
                                            <Button color="primary" onClick={() => this.handleButtonOnClick([0,1], i)} active={JSON.stringify(this.state.imagePairsScores[i]) === JSON.stringify([0,1])}>B is slightly better</Button>
                                            &nbsp;
                                            <Button color="primary" onClick={() => this.handleButtonOnClick([0,3], i)} active={JSON.stringify(this.state.imagePairsScores[i]) === JSON.stringify([0,3])}>B is better</Button>
                                        </ButtonGroup>
                                    </div>
                                </Col>
                            </Row>
                            <hr />
                            </Container>
                        </div>
                        )
                    }
            })}

                {this.state.round <= totalNbRounds &&  this.state.round > 0 &&
                
                <SubmitInstructionsAndButton onClick={this.handleSubmit}
                                             instructionsTextColor={this.props.instructionsTextColor}
                />}

                {this.state.round > totalNbRounds && 
                <Container>
                        <h3>Thank you for the submission</h3>
                        <br/>
                        <h3>Final ranking:</h3>
                        <br/>
                </Container>
                }

                {this.state.round > totalNbRounds && 
                Array(this.state.imageTotalScores.length).fill(null).map( (x,i) => {
                    return (
                        <Container>
                        <p>{this.state.imageTotalScores[i][0]}</p>
                        <img src={all_images[this.state.queryset][this.state.imageTotalScores[i][0]]} style={{width: "60%", height: "auto"}} />
                        <p style={{margin : 0}}><b>Score: {this.state.imageTotalScores[i][1]}</b></p>
                        <p><b>Opponent score: {this.state.imageTotalScores[i][2]}</b></p>
                        <hr/>
                        </Container>
                        )}
                )}


                <Footer/>
            </>
        );

        //For some reason, this.state.imageTotalScores is always an array-like object instead of array, so I couldn't directly use .map() on it
        //<h3>Image {im1} vs Image {im2}</h3>
        //<ButtonGroup vertical>
        //<h2>{this.state.currentStart}/{this.state.imagePairs.length} | {this.state.round}/{totalNbRounds}</h2>
    }
}

export default Labelling;
