import React, {Component} from 'react';
import * as ReactDOM from 'react-dom';
import "./assets/Ball.css"
import {v4 as uuidv4} from "uuid";
import OptionDialog from "./OptionDialog";
import DocumentOptionDialog from "../OptionDialogs/DocumentOptionDialog";
import LemmaBankOptionDialog from "../OptionDialogs/LemmaBankOptionDialog";
import CorporaOptionDialog from "../OptionDialogs/CorporaOptionDialog";
import AuthorOptionDialog from "../OptionDialogs/AuthorOptionDialog";
import WFLOptionDialog from "../OptionDialogs/WFLOptionDialog";
import LatinAffectusOptionDialog from "../OptionDialogs/LatinAffectusOptionDialog";
import WordNetOptionDialog from "../OptionDialogs/WordNetOptionDialog";
import IgvllOptionDialog from "../OptionDialogs/IgvllOptionDialog";
import BrillOptionDialog from "../OptionDialogs/BrillOptionDialog";
import LewidShortOptionDialog from "../OptionDialogs/LewisShortOptionDialog";
import {executeSparql, queriesWrapper} from "../Utils/Sparql";
import {documentQuery} from "../Utils/Queries";
import {Tooltip} from "@mui/material";
import VallexOptionDialog from "../OptionDialogs/VallexOptionDialog";

class Ball extends Component {

    constructor(props) {
        super(props);
        let surroundingRectangle = document.querySelector("#ballTable_box_svg").getBoundingClientRect()

        let centerOfRect_X = (surroundingRectangle.width / 2) / 2 / 2;
        let centerOfRect_Y = (surroundingRectangle.height / 2) / 2 / 2;

        if (this.props.offset !== undefined) {
            // console.log("new coord");
            centerOfRect_X = this.props.offset.x + 200
            centerOfRect_Y = this.props.offset.y + 100
        } else {
            // console.log("new coord undef");
        }
        this.state = {
            type: this.props.type,
            x: centerOfRect_X,
            y: centerOfRect_Y,
            text: this.props.type.text,
            color: this.props.type.color,
            classes: "",
            ref: React.createRef(),
            startOffset: undefined,
            startDrag: false,
            radius: 60,
            outcomingLink: [],
            incomingLink: [],
            circleId: this.props.circleId,
            optionDialog: undefined,
            optionDialogContentRef: React.createRef(),
            selectedElements: [],
            injectedValues: "",
            injectedHaving: "",
            outgoingQuery: this.props.type.generalOutgoingSPARQL.replace(/injectValue/g, ""),
            generalQuery: this.props.type.generalSPARQL,
            helpString :"No options were provided for this node",
            ballProcessing: false
        }
        console.log("Hello I'm here and I'm a " + this.state.type.name + " ball!!");
    }


    removeIncomingLink = (link) => {
        console.log(link);
        let dupLinks = this.getIncomingLink();
        console.log(dupLinks);
        let index = dupLinks.indexOf(link);
        console.log(index);
        if (index > -1) { // only splice array when item is found
            dupLinks.splice(index, 1); // 2nd parameter means remove one item only
        }
        this.setState({incomingLink: dupLinks})
    }

    removeOutcomingLink = (link) => {
        console.log(link);
        let dupLinks = this.getOutcomingLink();
        console.log(dupLinks);
        let index = dupLinks.indexOf(link);
        console.log(index);
        if (index > -1) { // only splice array when item is found
            dupLinks.splice(index, 1); // 2nd parameter means remove one item only
        }
        this.setState({outcomingLink: dupLinks})
    }

    getIncomingLink = () => {
        return this.state.incomingLink
    }
    getOutcomingLink = () => {
        return this.state.outcomingLink
    }


    addIncomingLink = (link) => {
        let il = this.state.incomingLink
        if (!il.includes(link)) {
            il.push(link)
        }
        this.setState({incomingLink: il})
    }

    addOutcomingLink = (link) => {
        let oc = this.state.outcomingLink
        if (!oc.includes(link)) {
            oc.push(link)
        }
        this.setState({outcomingLink: oc})
    }

    componentDidMount() {
        this.state.ref.current.addEventListener('mouseenter', this.enter);
        this.state.ref.current.addEventListener('mouseleave', this.leave);
        let ob = this.state.ref
        ob.current.style.transform = "translate3d(" + (this.state.x) + "px," + (this.state.y) + "px,0)"
        this.setState({ref: ob})
        this.setState({optionDialogContentRef: React.createRef()}, () => {
            switch (this.state.type.name) {
                case "documents":
                    this.setState({optionDialog: <DocumentOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "corpora":
                    this.setState({optionDialog: <CorporaOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "authors":
                    this.setState({optionDialog: <AuthorOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "lemmabank" :
                    this.setState({optionDialog: <LemmaBankOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "wfl" :
                    this.setState({optionDialog: <WFLOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "affectus" :
                    this.setState({optionDialog: <LatinAffectusOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "wordnet" :
                    this.setState({optionDialog: <WordNetOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "igvll" :
                    this.setState({optionDialog: <IgvllOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "brill" :
                    this.setState({optionDialog: <BrillOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "ls" :
                    this.setState({optionDialog: <LewidShortOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;
                case "vallex" :
                    this.setState({optionDialog: <VallexOptionDialog ref={this.state.optionDialogContentRef} ball={this}/>})
                    break;

            }
        })
    }

    removeOptionDialog = () => {
        let me = this
        this.setState({optionDialog: <></>}, () => {
            me.setState({optionDialog: undefined})
        })
    }


    getOptionDialogContentRef = () => {
        return this.state.optionDialogContentRef
    }

    setNewCenter = (offset) => {
        this.setState({x: offset.x, y: offset.y})
    }
    getInvertedCTMOfFCircle = () => {
        if (document.getElementById(this.state.circleId) !== null) {
            let bboxScaled = document.getElementById(this.state.circleId).getScreenCTM().inverse();
            return bboxScaled
        }
    }

    getBBoxCenterCoord = () => {
        if (document.getElementById(this.state.circleId) !== null) {
            let bbox = document.getElementById(this.state.circleId).getBoundingClientRect();
            let bboxScaled = document.getElementById(this.state.circleId).getScreenCTM().inverse();
            console.log(bbox);
            console.log(bboxScaled);
            // return ({
            //     x: (bbox.x - bboxScaled.e) / bboxScaled.a,
            //     y: (bbox.y - bboxScaled.f) / bboxScaled.d
            // })
            return ({x: ((bbox.x) + ((bbox.width - 10) / 2)) * bboxScaled.a, y: ((bbox.y) + ((bbox.height - 5) / 2)) * bboxScaled.a})
        }
    }

    getCenterCoord = () => {
        return ({x: this.state.x, y: this.state.y})
    }

    getOptionDialog = () => {
        return (this.state.optionDialog);
    }

    enableStartDrag = () => {
        this.setState({startDrag: true})
    }
    disableStartDrag = () => {
        this.setState({startDrag: false})
    }
    enter = () => {
        if (!this.state.startDrag) {
            this.props.callBackSelection(this)
        }
    }
    leave = () => {
        if (!this.state.startDrag) {
            // console.log("leave");
            this.props.callBackSelection(undefined)
        }
    }

    clickOption = (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.props.openSetup(this)
        //  alert(this.state.text + " option")
    }
    clickDate = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let me = this
        let queryChain = this.getLinkQueryChain(this, [])

        let first = queryChain.shift()

        if (this.state.generalQuery !== undefined) {
            if ( !first.includes("?pos ?lexicons")){
                first = this.state.generalQuery.replace(/injectValue/g, this.state.injectedValues)

                first = first.replace(/injectHaving/g, this.state.injectedHaving)
            }
        }
        //queryChain.push(first)

        let outputColumns = []
        let selectFields = "*"
        let groupBy = ""
        let idKey = ""
        // document.getElementById(this.state.circleId).classList.add("ballcoloranim");
        this.setState({ballProcessing :true})

        switch (this.state.type.name) {
            case "authors":
                selectFields = "?author ?authorLabel"
                groupBy = " group by ?author order by ?author"
                idKey = "author"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'authorLabel',
                        headerName: 'Author',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "documents":
                selectFields = "?doc ?docTitle"
                groupBy = "group by ?doc\n order by ?docTitle"
                idKey = "doc"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'docTitle',
                        headerName: 'Document',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "corpora":
                selectFields = "?corpora ?corporaTitle"
                groupBy = "group by ?corpora"
                idKey = "corpora"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'corporaTitle',
                        headerName: 'Corpora',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "lemmabank" :
                selectFields = "?lemma ?lemmaLabel"
                groupBy = "group by ?lemma"
                idKey = "lemma"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'lemmaLabel',
                        headerName: 'Lemma',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "wfl" :

                selectFields = "?wflrelation ?relLabel"
                groupBy = "group by ?wflrelation"
                idKey = "wflrelation"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'relLabel',
                        headerName: 'WFL relation',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "affectus" :

                selectFields = "?lemma ?lemmaLabelPolarity ?polarityString"
                groupBy = "group by  ?lemma \norder by ?lemmaLabelPolarity"
                idKey = "lemma"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'lemmaLabelPolarity',
                        headerName: 'Lemma',
                        width: "400",
                        editable: false,
                    },
                    {
                        field: 'polarityString',
                        headerName: 'Polarity',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "tokens" :
                selectFields = "?token ?tokenLabel ?docTitle"
                groupBy = "group by  ?token ?docTitle \norder by ?tokenLabel ?docTitle"
                idKey = "token"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'tokenLabel',
                        headerName: 'Token',
                        width: "400",
                        editable: false,
                    },
                    {
                        field: 'docTitle',
                        headerName: 'Document',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "wordnet" :
                selectFields = "?wnsyns ?wnsysLabel ?wnsysDescription"
                groupBy = "group by  ?wnsyns"
                idKey = "wnsyns"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'wnsysLabel',
                        headerName: 'Wordnet sysnset',
                        width: "400",
                        editable: false,
                    },
                    {
                        field: 'wnsysDescription',
                        headerName: 'Sense',
                        width: "400",
                        editable: false,
                    }
                ]
                break;
            case "vallex" :
                selectFields = "?wnsyns ?vf ?lemma ?lemmaLabel ?functors"
                groupBy = ""
                idKey = "vf"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'wnsyns',
                        headerName: 'wnsyns',
                        width: "350",
                        editable: false,
                        useCellData: true,
                        cellData : "wnsyns"
                    },
                    {
                        field: 'lemmaLabel',
                        headerName: 'Lemma',
                        width: "200",
                        editable: false,
                        useCellData: true,
                        cellData : "lemma"
                    },
                    {
                        field: 'functors',
                        headerName: 'Functors',
                        width: "200",
                        editable: false,
                    }

                ]
                break;
            case "igvll" :
                break;
            case "brill" :
                break;
            case "ls" :
                selectFields = "?lemma ?lc ?lemmaLabel ?definition"
                groupBy = "order by ?lemma ?lc"
                idKey = "lc"
                outputColumns = [
                    // { field: 'id', headerName: 'ID', width: 0 },
                    {
                        field: 'lemmaLabel',
                        headerName: 'Lemma',
                        width: "400",
                        editable: false,
                    },
                    {
                        field: 'definition',
                        headerName: 'Definition',
                        width: "400",
                        editable: false,
                    }
                ]
                break;

        }


        //   console.log(incomingQueries);
        //   console.log(outcomingQueries);

        let finalQuery = queriesWrapper(queryChain,first, selectFields, groupBy)

        //speed up query with token
        if (this.state.type.name === "tokens" && !finalQuery.includes("VALUES ?doc")){
            finalQuery = finalQuery.replaceAll("?lemma ?doc","?lemma")
        }

        if(finalQuery.includes("injectHaving")){
            finalQuery = finalQuery.replaceAll("injectHaving","")
        }

        executeSparql(finalQuery, undefined, (data) => {
            //console.log(data)
            if (data !== null) {
                me.props.openResults(data, outputColumns, idKey)
            }
            this.setState({ballProcessing :false})
            // document.getElementById(this.state.circleId).classList.remove("ballcoloranim");
        })


        //console.log(queryChain);
        //alert(this.state.text + " dat " + this.state.x + "  " + this.state.y)

    }


    getLinkQueryChain = (ball, visited) => {
        let queries = []
        visited.push(ball)
        queries.push(ball.getOutgoingQuery())

        let links = ball.getIncomingLink().concat(ball.getOutcomingLink())
        links.forEach(link => {
            let linkStartNode = link.ref.current.getStartNode().ref.current
            let linkEndNode = link.ref.current.getEndNode().ref.current

            if (!visited.includes(linkStartNode)) {
                let collectedQueries = linkStartNode.getLinkQueryChain(linkStartNode, visited);
                queries = queries.concat(collectedQueries)
            }
            if (!visited.includes(linkEndNode)) {
                let collectedQueries = linkEndNode.getLinkQueryChain(linkEndNode, visited);
                queries = queries.concat(collectedQueries)
            }

        })


        /*
        if (ball.getIncomingLink().length > 0) {
            ball.getIncomingLink().forEach(ballLoopLink => {
                let ballLoop = ballLoopLink.ref.current.getStartNode()
                let collectedQueries = ballLoop.ref.current.getIncomingLinkQueryChain(ballLoop.ref.current);
                queries = queries.concat(collectedQueries)
                //queries.push(...collectedQueries)
            })

        }*/
        return queries
    }


    getIncomingLinkQueryChain = (ball) => {
        let queries = []
        queries.push(ball.getOutgoingQuery())
        if (ball.getIncomingLink().length > 0) {
            ball.getIncomingLink().forEach(ballLoopLink => {
                let ballLoop = ballLoopLink.ref.current.getStartNode()
                let collectedQueries = ballLoop.ref.current.getIncomingLinkQueryChain(ballLoop.ref.current);
                queries = queries.concat(collectedQueries)
                //queries.push(...collectedQueries)
            })

        }
        return queries
    }

    getOutcomingLinkQueryChain = (ball) => {
        let queries = []
        queries.push(ball.getOutgoingQuery())


        if (ball.getOutcomingLink().length > 0) {
            ball.getOutcomingLink().forEach(ballLoopLink => {
                let ballLoop = ballLoopLink.ref.current.getEndNode()

                let collectedQueries = ballLoop.ref.current.getOutcomingLinkQueryChain(ballLoop.ref.current);
                queries = queries.concat(collectedQueries)
                //queries.push(...collectedQueries)
            })

        }
        return queries
    }

    clickClose = (e) => {
        this.props.closeMe(this)
    }

    setOutgoingQuery = (oq) => {
        this.setState({outgoingQuery: oq})
    }

    setSelectedElements = (elements) => {
        this.setState({selectedElements: elements})
    }

    setInjectedValues = (values) => {
        this.setState({injectedValues: values})
    }

    setInjectedHaving = (values) => {
        this.setState({injectedHaving: values})
    }

    setHelpString = (helpString) =>{
        if (helpString.length > 0){
            this.setState({helpString: helpString})
        }
    }


    getOutgoingQuery = () => {
        return this.state.outgoingQuery
    }

    getType = () => {
        return this.state.type
    }


     showTooltip = (evt, text) => {
        let tooltip = document.getElementById("ball_tooltip");
        tooltip.innerHTML = text;
        tooltip.style.display = "block";
        tooltip.style.left = evt.pageX + 3 + 'px';
        tooltip.style.top = evt.pageY + 3 + 'px';
    }

     hideTooltip = () => {
        let tooltip = document.getElementById("ball_tooltip");
        tooltip.style.display = "none";
    }

     colorLuminance = (hex, lum) => {
        // Validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, "");
        if (hex.length < 6) {
            hex = hex.replace(/(.)/g, '$1$1');
        }
        lum = lum || 0;
        // Convert to decimal and change luminosity
        let rgb = "#",
            c;
        for (let i = 0; i < 3; ++i) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }

    render() {
        let me = this
        return (
            <g ref={this.state.ref} style={{filter:"url(#dropshadow)"}}>


                <circle id={this.state.circleId} className={this.state.className} r={this.state.radius} style={{stroke: "rgba(255,255,255,0.65)", fill: this.state.color}}>
                    {this.state.ballProcessing ? <animate attributeName="fill" values={
                        this.state.color +";"
                        +this.colorLuminance(this.state.color,-30 * 0.01)+";"
                        + this.state.color +";"
                        +this.colorLuminance(this.state.color,20 * 0.01)+";"
                        + this.state.color}
                                                          dur="1s" repeatCount="indefinite" /> :""}
                </circle>

                <foreignObject width="120" height="120" fontSize="12px" transform="translate(-60,-60)" style={{cursor: "move"}}>

                    <div className="circle" onTouchStartCapture={() => this.enter()} onTouchEnd={() => this.leave()}>
                        <span className={"noselect"}>{this.state.text}</span>
                    </div>
                </foreignObject>

                {this.state.type.name !== "tokens" ?
                    <g transform={"translate(" + this.state.radius * Math.cos(300 * Math.PI / 180) + "," + this.state.radius * Math.sin(300 * Math.PI / 180) + ")"}>
                        <circle r="12" style={{cursor: "pointer", stroke: "rgba(0,0,0,0.11)", fill: "#fff"}} onClick={(e) => {
                            this.clickOption(e)
                        }}/>
                        <path style={{cursor: "pointer"}} onClick={(e) => {
                            this.clickOption(e)
                        }} fill={this.state.color} transform={"translate(-8,-8)"} d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </g>
                    : ""}

                {this.state.type.name !== "authors" ?
                <g transform={"translate(" + this.state.radius * Math.cos(327 * Math.PI / 180) + "," + this.state.radius * Math.sin(327 * Math.PI / 180) + ")"}>
                    <circle r="12" style={{cursor: "pointer", stroke: "rgba(0,0,0,0.11)", fill: "#fff"}} onClick={(e) => {
                        this.clickDate(e)
                    }}/>
                    <path style={{cursor: "pointer"}} onClick={(e) => {
                        this.clickDate(e)
                    }} fill={this.state.color} transform={"translate(-8,-8)"} d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </g>:""}

                <g transform={"translate(" + this.state.radius * Math.cos(160 * Math.PI / 180) + "," + this.state.radius * Math.sin(160 * Math.PI / 180) + ")"}>
                    <circle r="9" style={{cursor: "pointer", stroke: "rgba(0,0,0,0.11)", fill: "#fff"}} onClick={(e) => {
                        this.clickClose(e)
                    }}/>

                    <g style={{cursor: "pointer"}} transform={"translate(-7,-7) scale(0.85)"} fill={this.state.color} onClick={(e) => {
                        this.clickClose(e)
                    }}>
                        <path fillRule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
                        <path fillRule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
                    </g>

                </g>

                {this.state.type.name !== "tokens" ?
                <g transform={"translate(" + this.state.radius * Math.cos(355 * Math.PI / 180) + "," + this.state.radius * Math.sin(355 * Math.PI / 180) + ")"}>
                    <circle r="12" style={{cursor: "pointer", stroke: "rgba(0,0,0,0.11)", fill: "#fff"}} onMouseMove={(e) => this.showTooltip(e,this.state.helpString)} onMouseOut={(e) => {this.hideTooltip()}} >

                    </circle>

                    <path style={{cursor: "pointer"}} onMouseMove={(e) => this.showTooltip(e,this.state.helpString)} onMouseOut={(e) => {this.hideTooltip()}} fill={this.state.color} transform={"translate(-9,-10)  scale(0.80)" } d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44.91-1.29.4-3.7-2.18-3.7-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41.7 1.15 1.11 3.3.03 4.9-1.2 1.77-2.35 2.31-2.97 3.45-.25.46-.35.76-.35 2.24h-2.89c-.01-.78-.13-2.05.48-3.15zM14 20c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>

                </g>
                    :""}
                {/*<text textAnchor="middle" fill="white" dy=".3em" style={{fontFamily: "'Open Sans', verdana",fontSize:"12px"}} >{this.state.text}</text>*/
                }
            </g>

        )
            ;
    }
}

export default Ball;
