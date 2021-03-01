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
import FileDownload from 'js-file-download';

import {Button, ButtonGroup, ButtonToolbar, Col, Container, Label, Row, UncontrolledAlert} from "reactstrap";
import { Chart } from "react-google-charts";
import InfoRow from "../components/AdminDashboard/InfoRow";
import Header from "../components/Header";
import Footer from "../components/Footer";

import queryString from "query-string";
import TokenGeneratorRow from "../components/AdminDashboard/TokenGeneratorRow";
import { finished } from "nodemailer/lib/xoauth2";

import {spearman} from './my_spearman.js';
//console.log(spearman);

import {all_images, queryset_list, totalNbRounds} from './AesthLabelling.js';

function median(values) {
    if(values.length ===0) return 0;
  
    values.sort(function(a,b){
      return a-b;
    });
  
    var half = Math.floor(values.length / 2);
  
    if (values.length % 2)
      return values[half];
  
    return (values[half - 1] + values[half]) / 2.0;
}

function formatPercentage(perc) {
    if(perc === null || perc === undefined || isNaN(perc)) {
        return null;
    }
    return perc.toFixed(2) + " %";
}

function getSafely(obj, key) {
    return key.split(".").reduce(function(o, x) {
        return (typeof o == "undefined" || o === null || o === undefined) ? o : o[x];
    }, obj);
}

function getAndFormatSafelyFloat(obj, key, digits=3) {
    return key.split(".").reduce(function(o, x) {
        if(typeof o == "undefined" || o === null || o === undefined) {
            return o;
        }
        if(typeof o[x] == "undefined" || o[x] === null || o[x] === undefined) {
            return o[x];
        }
        return o[x].toFixed(digits);
    }, obj);
}

function getAndFormatSafelyIRA(obj, key, digits=3) {
    const perc = getSafely(obj, key);
    const random = getSafely(obj, key + "Random");
    let res = "";
    if(perc !== null && perc !== undefined) {
        res += formatPercentage(perc);
        if(random !== null && random !== undefined) {
            res += " (" + formatPercentage(random) + ")"
        }
    }
    return res.length > 0 ? res : null;
}

class AdminDashboard extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            token: null,
            authenticated: false,
            data: null,
            chart_data: [],
            c_data: [],
            queryset: queryset_list[0], //'roger_federer',
            finished_labellers: [],
            sorted_imnames_score: [],
            imageid_to_display: -1,
            all_labellers_pairs: [],
            current_labellers_pair: [],
            all_spearman: {},
            avg_spearman: 0,
            spearmanchart_data: {},
            currentSpearmanChartData: [['X', ''], [0,0]],
            avg_query_time: 0,
            avg_submission_time: 0,
            
        }
        this.handleQuerysetButtonOnClick = this.handleQuerysetButtonOnClick.bind(this);
        this.handleGraphClick = this.handleGraphClick.bind(this);
        this.initialize_graph_state = this.initialize_graph_state.bind(this);
        this.update_graph_state = this.update_graph_state.bind(this);
        this.handleLabellerButtonOnClick = this.handleLabellerButtonOnClick.bind(this);
        
    }

    componentDidMount() {
        const params = queryString.parse(this.props.location.search);
        if(!params.token) {
            this.setState({token: null});
        }
        else {
            axios.get("/admindashboard/status"+ "?token=" + params.token)
                .then(res => {
                    //console.log(res.data);
                    this.setState({
                        token: params.token,
                        data: res.data
                    });
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        token: null
                    });
                });

            this.initialize_graph_state(this.state.queryset, this.state.imageid_to_display);

        }
    }

    initialize_graph_state(queryset, imageid_to_display){
        this.setState({ imageid_to_display: imageid_to_display,
                        });

        axios.get("/labelling/aesthetic_download"+ "?token=" + this.state.token)
        .then((response) => {
            //console.log(JSON.stringify(response.data[0]));
            //console.log("Current:")
            //console.log(queryset)
            const c_data = {};
            const finished_labellers = [];
            let avg_query_time = [];
            let avg_submission_time = [];
            //console.log("Response data:")
            //console.log(response.data)
            //console.log(response.data.length)
            for (let k=0; k<response.data.length; k++){

                const imageTotalScore = {};
                let all_images_name = Object.keys(all_images[queryset]);
                all_images_name.forEach( (x) => {
                    imageTotalScore[x] = 0;
                });
                //console.log(response.data[k]["queryset"])
                //console.log("---")
                if (response.data[k]["queryset"] === queryset){
                    //console.log("ok1")
                    const rnds = response.data[k]["rounds"];
                    const currentNbRounds = Object.keys(rnds).length;

                    let is_not_finished = false;
                    const timestamps = [];

                    for (let i=1; i<=currentNbRounds; i++){
                        rnds[i.toString()].forEach(([im1, im2, score1, score2, ts]) => {

                            if (score1==null || score2==null){
                                //console.log(i)
                                //console.log(im1)
                                //console.log(im2)
                                //console.log(score1)
                                //console.log(score2)
                                is_not_finished = true;
                            }

                            imageTotalScore[im1.toString()] += score1;
                            imageTotalScore[im2.toString()] += score2;
                            if (ts == null){
                                timestamps.push(null);
                            }
                            else{
                                timestamps.push(new Date(ts));
                            }
                        })
                    }
                    //console.log(is_not_finished)
                    //console.log(currentNbRounds)
                    //console.log(totalNbRounds)
                    if (is_not_finished || (currentNbRounds<totalNbRounds)){
                        continue;
                    }
                    //console.log("ok2")
                    const query_time = (timestamps[timestamps.length-1] - timestamps[0])/1000;
                    
                    //let submission_time = 0;
                    //let cnt = 0;
                    if (timestamps[0] != null){
                        for (let i=0; i<(timestamps.length-1); i+=1){
                            if (timestamps[i+1].toISOString() != timestamps[i].toISOString()){ //this would be the case when the number of displayed images > 1
                                //submission_time += (timestamps[i+1] - timestamps[i])/1000;
                                //cnt += 1;
                                avg_submission_time.push((timestamps[i+1] - timestamps[i])/1000)
                            }
                        }
                        //submission_time /= cnt;
                    }
                    
                    avg_query_time.push(query_time);
                    //avg_submission_time += submission_time;

                    finished_labellers.push(response.data[k]["labeller"]);

                    for (let imname in imageTotalScore) {
                        if (c_data.hasOwnProperty(imname)){
                            c_data[imname].push(imageTotalScore[imname]);
                        }
                        else{
                            c_data[imname] = [imageTotalScore[imname]]; //initialize array
                        }
                    }

                }
                
            }

            const sorted_imnames_score = []; //sort by average score
            for (let imname in c_data) {
                const sum_score = c_data[imname].reduce((a, b) => a + b, 0);
                const avg_score = (sum_score / c_data[imname].length) || 0;
                sorted_imnames_score.push([imname, avg_score]);
            }
            sorted_imnames_score.sort(
                (a, b) => {
                    //return parseInt(a.replace(/[^0-9]/g,'')) - parseInt(b.replace(/[^0-9]/g,'')); //extracts image id from image name and numerically compare id
                    return a[1] - b[1];
                }
            );

            const all_labellers_pairs = [];
        
            for (let i=0; i<finished_labellers.length; i++){
                for (let j=(i+1); j<finished_labellers.length; j++){
                    all_labellers_pairs.push([i,j]);
                }
            }

            const all_spearman = {};
            let avg_spearman = 0;
            const spearmanchart_data = {};

            for (let i=0; i<all_labellers_pairs.length; i++){
                let pair = all_labellers_pairs[i];
                let X = [];
                let Y = [];

                for (let imname in c_data) {
                    X.push(c_data[imname][pair[0]]);
                    Y.push(c_data[imname][pair[1]]);
                }
                //console.log(X);
                //console.log(Y);
                //console.log(JSON.stringify(pair));

                spearmanchart_data[JSON.stringify(pair)] = X.map(function(e, i) { return [e, Y[i]];});
                const value = spearman.calc(X, Y);
                all_spearman[JSON.stringify(pair)] = value;
                avg_spearman += value; 

            }

            let current_labellers_pair = [];

            let currentSpearmanChartData = [['X', ''], [0,0]];
            
            if (all_labellers_pairs.length > 0){
                avg_spearman /= all_labellers_pairs.length;
                current_labellers_pair = all_labellers_pairs[0];

                currentSpearmanChartData = [['X', ''], ...spearmanchart_data[JSON.stringify(current_labellers_pair)]];
            }

            //avg_submission_time /= finished_labellers.length;
            //avg_query_time /= finished_labellers.length;

            this.setState({
                finished_labellers: finished_labellers,
                sorted_imnames_score: sorted_imnames_score,
                c_data: c_data,
                queryset: queryset,
                current_labellers_pair: current_labellers_pair,
                all_labellers_pairs: all_labellers_pairs,
                all_spearman: all_spearman,
                avg_spearman: avg_spearman,
                spearmanchart_data: spearmanchart_data,
                currentSpearmanChartData: currentSpearmanChartData,
                avg_submission_time: median(avg_submission_time),
                avg_query_time: median(avg_query_time),
            });

            this.update_graph_state(imageid_to_display);

            //console.log(JSON.stringify(c_data));
            //console.log(JSON.stringify(finished_labellers));
            //console.log(JSON.stringify(sorted_imnames));
           
        });
    }

    update_graph_state(imageid_to_display){

        const chart_columns = [{ type: 'number', label: 'Image' }, { type: 'number', label: 'Score' }];

        for (let i=0; i<this.state.finished_labellers.length; i++){
            chart_columns.push({ id: i.toString(), type: 'number', role: 'interval' });
        }

        chart_columns.push({ type: 'string', role: 'style' });

        const chart_rows = [];

        for (let i=0; i<this.state.sorted_imnames_score.length; i++){
            const avg_score = this.state.sorted_imnames_score[i][1];
            if (i==imageid_to_display){
                //'point { size: 10; shape-type: star; fill-color: #a52714; }'
                chart_rows.push([i+1, avg_score, ...this.state.c_data[this.state.sorted_imnames_score[i][0]], "{color: green; fill-opacity: 0.5}"]);
            }
            else{
                chart_rows.push([i+1, avg_score, ...this.state.c_data[this.state.sorted_imnames_score[i][0]], null]);
            }
            
        }

        //console.log(JSON.stringify([chart_entry1, ...chart_entry2]));


        this.setState({
            chart_data: [chart_columns, ...chart_rows],
            imageid_to_display: imageid_to_display,
        });
    }

    handleDownload(collectionName) {
        if (collectionName==="aesthetic_annotation"){
            axios.get("/labelling/aesthetic_download"+ "?token=" + this.state.token)
                .then((response) => {
                    FileDownload(JSON.stringify(response.data, null, 4), collectionName + '.json');
                });
        }
        else{
            axios.get("/admindashboard/" + collectionName + "?token=" + this.state.token)
                .then((response) => {
                    FileDownload(JSON.stringify(response.data, null, 4), collectionName + '.json');
                });
        }
    }

    handleDownloadCsv(collectionName) {
        axios.get("/admindashboard/" + collectionName + "?token=" + this.state.token)
            .then((response) => {
                FileDownload(response.data, collectionName + '.csv');
            });
    }

    handleQuerysetButtonOnClick(newQueryset){
        //console.log(JSON.stringify(this.state.current_labellers_pair));
        this.initialize_graph_state(newQueryset, -1);
        //console.log(JSON.stringify(this.state.current_labellers_pair));
        //console.log(JSON.stringify(this.state.spearmanchart_data));
        //console.log(JSON.stringify(this.state.all_spearman));
    }

    handleLabellerButtonOnClick(newLabellerPair){
        //console.log(JSON.stringify(this.state.current_labellers_pair));
        //console.log(JSON.stringify(this.state.spearmanchart_data));
        //console.log(JSON.stringify(this.state.all_spearman));
        this.setState({current_labellers_pair: newLabellerPair,
                        currentSpearmanChartData: [['X', ''], ...this.state.spearmanchart_data[JSON.stringify(newLabellerPair)]]});
        //console.log(JSON.stringify(this.state.current_labellers_pair));

    }

    handleGraphClick(chartWrapperArg) {
        const chartWrapper = chartWrapperArg["chartWrapper"];
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();

        if (selection.length === 1) {
          const [selectedItem] = selection;
          const dataTable = chartWrapper.getDataTable();
          const { row, column } = selectedItem;

          this.update_graph_state(row);

        }
    }

    render() {
        if(!this.state.token) {
            return (<Container>
                <Row>
                    <Col>
                        <UncontrolledAlert color="danger" fade={true}>
                                        <span className="alert-inner--icon">
                                            <i className="ni ni-support-16" />
                                        </span>
                            <span className="alert-inner--text ml-1">
                            <strong>Error!</strong> Please provide valid authentication token in page query and connect
                                from ETH VPN
                                        </span>
                        </UncontrolledAlert>
                    </Col>
                </Row>
            </Container>);
        }
        return ( <>
            <Header/>
            <Container><Row><Col><h2>Admin Dashboard</h2></Col></Row></Container>
        <Container className="shape-container align-items-center">
            <br/>
            <InfoRow counter={getSafely(this.state.data, "nRegisteredLabellers")}>
                Number of registered labellers:
            </InfoRow>


            <Row className={"pt-4"}>
                    <Col>
                    <h3>Annotation Overview</h3>
                </Col>
                </Row>
                <br/>
            <ButtonGroup>
                <br/>
                {queryset_list.map( (x,i) => {
                    return (
                        <div>
                        <Button color="secondary" onClick={() => this.handleQuerysetButtonOnClick(x)} active={this.state.queryset === x}>{x.replace(/_/g, ' ')}</Button>&nbsp;
                        </div>
                    )}
                    )
                }
            </ButtonGroup>
            <br/>
            <br/>
            <InfoRow counter={this.state.finished_labellers.length}>
                Number of labellers that completed the query:
            </InfoRow>

            <InfoRow counter={(this.state.avg_query_time/60).toFixed(1)}>
                Median query annotation time (minutes):
            </InfoRow>

            <InfoRow counter={this.state.avg_submission_time.toFixed(1)}>
                Median image pair submission time (seconds):
            </InfoRow>
            <hr/>

            <Container className="shape-container align-items-center">
                    <Row>
                        <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                            {"Labeller Pair"}
                            <br/>
                            <ButtonToolbar>
                                {this.state.all_labellers_pairs.map( (x,i) => {
                                    return (
                                        <div>
                                        <Button color="info" variant="outline-info" size="sm" onClick={() => this.handleLabellerButtonOnClick(x)} active={this.state.current_labellers_pair.toString() === x.toString()}>{x[0].toString()+","+x[1].toString()}</Button>&nbsp;
                                        </div>
                                    )}
                                    )
                                }
                            </ButtonToolbar>
                            
                        </Col>
                        <Col xs={6} sm={6} md={6} lg={6} xl={6}>
                            <Chart
                                width={'550px'}
                                height={'450px'}
                                chartType="ScatterChart"
                                loader={<div>Loading Chart...</div>}
                                data={this.state.currentSpearmanChartData}
                                options={{
                                    title: "Labeller Score Comparison",
                                    hAxis: { title: 'Score 1'},
                                    vAxis: { title: 'Score 2'},
                                    legend: 'none',
                                    animation: {
                                        duration: 300,
                                        easing: 'in',
                                        startup: true,
                                    },
                                }}
                                rootProps={{ 'data-testid': '2' }}
                            />
                        </Col>
                        <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                        {this.state.all_spearman.hasOwnProperty(JSON.stringify(this.state.current_labellers_pair)) &&
                                <Container>
                                    <br/>
                                    <small>
                                    {"Spearman Correlation = " + this.state.all_spearman[JSON.stringify(this.state.current_labellers_pair)].toString()}
                                    <br/>
                                    {"Average Spearman = " + this.state.avg_spearman.toFixed(2).toString()}
                                    </small>
                                </Container>
                        }
                        </Col>
                    </Row>
            </Container>

            <hr/>
            <Chart
                    width={'100%'}
                    height={'500px'}
                    chartType="ColumnChart"
                    loader={<div>Loading Chart...</div>}
                    data={this.state.chart_data}
                    options={{
                        title: 'Average Scores',
                        curveType: 'function',
                        series: [{ color: '#E7711B' },
                                
                    
                    ],
                        intervals: { style: 'points', pointSize: 3, },
                        legend: 'none',
                        vAxis: {title: 'Score'},
                        hAxis: {title: 'Image ID'},

                        animation: {
                            duration: 300,
                            easing: 'in',
                            startup: true,
                          },
                    }}
                    rootProps={{ 'data-testid': '1' }}

                    chartEvents={[
                        {
                          eventName: 'select',
                          callback: this.handleGraphClick,
                        },
                    ]}

            />

            {this.state.imageid_to_display >= 0 && 
                    <Container>
                        <Row>
                            <Col xs={2} sm={2} md={2} lg={2} xl={2}>
                               
                            </Col>
                            <Col xs={10} sm={10} md={10} lg={10} xl={10}>
                                {this.state.sorted_imnames_score[this.state.imageid_to_display][0]}
                                <br/>
                                <img src={all_images[this.state.queryset][this.state.sorted_imnames_score[this.state.imageid_to_display][0]]} style={{width: "80%", height: "auto"}} />
                            </Col>
                    </Row>
                    </Container>
            }



            <Row className={"pt-4"}>
                    <Col>
                    <h3>Actions</h3>
                </Col>
                </Row>

            <TokenGeneratorRow adminToken={this.state.token}/>
                <Row>
                    <Col>
                        <p>Download:</p>
                    </Col>
                </Row>
                <Row className={"mt-2"}>
                    <Col><Button block color="warning" onClick={() => this.handleDownload("labellers")}>Download Labelers Data (JSON)</Button></Col>
                </Row>
                <Row className={"mt-2"}>
                    <Col><Button block color="warning" onClick={() => this.handleDownload("aesthetic_annotation")}>Download Annotation (JSON)</Button></Col>
                </Row>
                <Row className={"mt-2"}>
                </Row>
            </Container>
                <Footer/>
            </>
        );
    }
}

export default AdminDashboard;
