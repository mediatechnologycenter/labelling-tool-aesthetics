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
import {Button, Col, Container, Media, Row} from "reactstrap";
import SelectorAbstract from "./SelectorAbstract";

import highVolSrc from "../../assets/imgs/speakerIconHigh.svg";
import mediumVolSrc from "../../assets/imgs/speakerIconMedium.svg";
import lowVolSrc from "../../assets/imgs/speakerIconLow.svg";
import ImNotSureCheckboxRow from "./ImNotSureCheckboxRow";


class PlutchikSelector extends SelectorAbstract {

    static defaultProps = {
        instructionsTextColor: "#1e0ead",
        imNotSureFontSize: 16,
        buttonsFontSize: 14,
        emojiFontSize: 32,
    };

    constructor(props, context) {
        super(props, context);
        this.getIntensityRow = this.getIntensityRow.bind(this);
        this.getEmotionlessButton = this.getEmotionlessButton.bind(this);
    }

    static emotions = [
        [{name: "Freude", color: "#FFDE7A", emoji: "😊",
            synonyms: ["Glück", "Begeisterung", "Hochgefühl", "Freude", "Vergnügen", "Lust", "Fröhlichkeit"]},
            {name: "Vertrauen", color: "#ACD46A", emoji: "🤝",
            synonyms: ["Zutrauen", "Sicherheit", "optimistische Gefühle"]},
            {name: "Angst", color: "#2FB774", emoji: "😨",
            synonyms: ["Schrecken", "Furcht", "Panik", "Beklemmung", "Bestürzung", "Befürchtung", "Besorgnis", "Sorge"]},
            {name: "Antizipation", color: "#FBAF64", emoji: "👀",
            synonyms: ["Interesse", "Wachsamkeit", "Vorgriff", "Erwartung", "Verdacht"]}],
        [{name: "Traurigkeit", color: "#74A9DB", emoji: "😞",
        synonyms: ["Betrübnis", "Schmerz", "Trauer", "tiefes Mitgefühl", "Kummer"]},
            {name: "Ekel", color: "#A490C6", emoji: "🤢",
            synonyms: ["Empörung", "Langweile", "Abscheu", "Entrüstung"]},
            {name: "Ärger", color: "#F3736D", emoji: "😡",
            synonyms: ["Verdruss", "Wut", "Zorn", "Feindseligkeit", "Aggressivität", "Groll"]},
            {name: "Überraschung", color: "#2CB0D9", emoji: "😮",
            synonyms: ["Erstaunen", "Verblüffung", "Verwunderung", "Verstörtheit"]}],
    ];

    //first flatten then map, then spread and assign
    static emotionsMap = Object.assign({}, ...[].concat.apply([],PlutchikSelector.emotions).map(em => {
        return {[em.name]: em}
    }));

    static emotionlessLabel = "sachlich";

    static intensities = [
        {image: highVolSrc, label: "stark", value: 2, borderTop: true, backgroundColor: "#a9a9a9"},
        {image: mediumVolSrc, label: "mittel", value: 1, borderTop: false, backgroundColor: "#c3c3c3"},
        {image: lowVolSrc, label: "wenig", value: 0, borderTop: false, backgroundColor: "#e3e3e3"},
    ];

    static intensitiesMap = Object.assign({}, ...PlutchikSelector.intensities.map(int => {
        return {[int.label]: int}
    }));

    render() {
        return (
            <Container>
                <Row className={"align-items-center"}>
                    <Col xs={10} sm={8} md={8} lg={8} xl={8}>
                        {PlutchikSelector.emotions.map((row, rowI) => {
                            return <Row key={rowI}>
                                {row.map((emotion, colI) => {
                                    let color, fontColor;
                                    if (this.props.emotionStatus === null || this.props.emotionStatus === undefined
                                        || this.props.emotionStatus.label === null
                                        || this.props.emotionStatus.label === emotion.name) {
                                        color = emotion.color;
                                        fontColor = "black";
                                    } else {
                                        color = SelectorAbstract.neutralColor;
                                        fontColor = SelectorAbstract.neutralFontColor;
                                    }

                                    let className = "p-0";
                                    if (rowI === 1) {
                                        className += " mt-1"
                                    }
                                    return (<Col key={colI} className="p-0 mr-1">
                                        <Button className={className}  block
                                                style={{
                                                    background: color + "8A",
                                                    width: "100%",
                                                    color: fontColor,
                                                    fontSize: this.props.buttonsFontSize,
                                                    borderRadius: 0
                                                }}
                                                onClick={(e) => this.props.onClick ? this.props.onClick(e, "label", emotion.name) : () => null}
                                                rounded={"false"}>
                                            <Container>
                                                <Row>
                                                    <Col>
                                                        <span role="img"
                                                              style={{fontSize: this.props.emojiFontSize}}
                                                              aria-label={emotion.name + " emoji"}>
                                                            {emotion.emoji}
                                                        </span>
                                                    </Col>
                                                </Row>
                                            </Container>

                                            <Row className={"mt-n1 mb-1"}>
                                                <Col>
                                                    <b>{emotion.name}</b>
                                                </Col>
                                            </Row>
                                        </Button>
                                    </Col>);
                                })}
                            </Row>;
                        })
                        }
                    </Col>
                    <Col xs={12} sm={2} md={2} lg={2} xl={2}>
                        {PlutchikSelector.intensities.map((intensity => this.getIntensityRow(intensity.image,
                            intensity.label, intensity.value, intensity.borderTop, intensity.backgroundColor)))}
                    </Col>
                    <Col xs={2} sm={2} md={2} lg={2} xl={2} className={"p-0 pl-1"}>
                        <div style={{textAlign: "center", color: this.props.instructionsTextColor}}><b>or</b></div>
                        {this.getEmotionlessButton()}
                    </Col>
                </Row>
                <ImNotSureCheckboxRow fontSize={this.props.imNotSureFontSize}
                                      checked={this.props.emotionStatus !== undefined && this.props.emotionStatus !== null && this.props.emotionStatus.notSure}
                                      onClick={this.props.onClick}/>
            </Container>
        );
    }

    getEmotionlessButton() {
        let backgroundColor = "#b09d6d";
        let fontColor = "black";
        if(this.props.emotionStatus !== undefined && this.props.emotionStatus !== null
            && this.props.emotionStatus.label !== null
            && this.props.emotionStatus.label !== PlutchikSelector.emotionlessLabel) {
            backgroundColor = SelectorAbstract.neutralColor;
            fontColor = SelectorAbstract.neutralFontColor;
        }
        const style = {
            background: backgroundColor,
            width: "100%",
            color: fontColor,
            fontSize: this.props.buttonsFontSize,
            borderRadius: 0,
        };
        return <Button block className={"p-0"}
                       style={style}
                       onClick={(e) => this.props.onClick ? this.props.onClick(e, "label", PlutchikSelector.emotionlessLabel) : () => null}
                       rounded={"false"}>
            <Container>
                <Row>
                    <Col>
                                                    <span role="img"
                                                          style={{fontSize: this.props.emojiFontSize}}
                                                          aria-label={PlutchikSelector.emotionlessLabel + " emoji"}>
                                                    🔩
                                                </span>
                    </Col>
                </Row>
            </Container>

            <Row className={"mt-n1 mb-1"}>
                <Col>
                    <b>{PlutchikSelector.emotionlessLabel}</b>
                </Col>
            </Row>
        </Button>
    }

    getIntensityRow(imgSrc, text, intensity, margitTop=false, color="#d1d1d1") {
        let fontColor = "black";
        let newColor = color;
        if (this.props.emotionStatus !== undefined && this.props.emotionStatus !== null
            && this.props.emotionStatus.intensity !== null
            && this.props.emotionStatus.intensity !== intensity) {
            newColor = SelectorAbstract.neutralColor;
            fontColor = SelectorAbstract.neutralFontColor;
        }

        const styleDict = {
            background: newColor,
            color: fontColor,
            height: "100%",
            width: "100%",
            borderRadius: 0,
            fontSize: this.props.buttonsFontSize,
        };
        if(!margitTop) {
            styleDict.borderTop = "none";
        }
        return <Row key={"levelButton" + text + intensity}>
            <Col className={"pl-2 pr-2"} >
                <Button block
                        style={styleDict}
                        size={"sm"}
                        onClick={(e) => this.props.onClick ? this.props.onClick(e, "intensity", intensity) : () => null}
                        disabled={this.props.emotionStatus !== undefined && this.props.emotionStatus !== null && this.props.emotionStatus.intensity === -1}
                        className={"pl-0 pr-0"}
                >
                    <Container>
                        <Row>
                            <Col className={"p-0"}>
                                <Media left>
                                    <Media object style={{
                                        maxWidth: '21px',
                                        opacity: "80%"
                                    }}
                                           src={imgSrc} alt={text} />
                                </Media>
                            </Col>
                        </Row>
                        <Row className={"mt-n1"}>
                            <Col className={"p-0"}>
                                <b>{text}</b>
                            </Col>
                        </Row>
                    </Container></Button>
            </Col>
        </Row>;
    }
}

export default PlutchikSelector;
