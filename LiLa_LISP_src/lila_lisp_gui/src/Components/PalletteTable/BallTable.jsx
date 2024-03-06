import React, {Component} from 'react';
import "./assets/BallTable.css"
import Ball from "./Ball";
import {v4 as uuidv4} from 'uuid';
// import {createSvgIcon} from "@material-ui/core";
import Tree from "../Utils/Tree"
import types from "../data/Types";
import Link from "./Link";
// import {off} from "@svgdotjs/svg.js";
// import svgPanZoom from 'svg-pan-zoom'
import OptionDialog from "./OptionDialog";
import ResultsDialog from "./ResultsDialog";


class BallTable extends Component {

    lastUpdateCall = null

    tree = new Tree()

    constructor(props) {
        super(props);
        this.state = {

            balls: [],
            links: [],
            table_element: [],
            startOffset: undefined,
            startDrag: false,
            overBall: undefined,
            coord: [],
            scale: 1,
            translateX: 0,
            translateY: 0,
            inPanMove: false,
            startTouch: {x: 0, y: 0},
            optionDialogRef: React.createRef(),
            resultsDialogRef: React.createRef()

        }

        for (let i = 0; i < Object.keys(types).length + 1; i++) {
            this.tree.v.push([]);
        }
        // make relation tree
        this.tree.addEdge(1, 2);
        this.tree.addEdge(1, 5);
        this.tree.addEdge(1, 6);
        this.tree.addEdge(1, 7);
        this.tree.addEdge(1, 8);
        this.tree.addEdge(1, 9);
        this.tree.addEdge(1, 10);
        this.tree.addEdge(2, 3);
        this.tree.addEdge(2, 4);
        this.tree.addEdge(2, 11);
        this.tree.addEdge(7, 12);

    }

    // lemmabank 1 , documents 2, authors 3 , corpora 4, wfl 5, affectus 6 , wordnet 7 , brill 8, igvll 9 , ls 10, tokens 11,vallex 12

    typesIndexMapping = {
        1: "lemmabank",
        2: "documents",
        3: "authors",
        4: "corpora",
        5: "wfl",
        6: "affectus",
        7: "wordnet",
        8: "brill",
        9: "igvll",
        10: "ls",
        11: "tokens",
        12: "vallex"
    }


    getKeyByValue = (object, value) => {
        return Object.keys(object).find(key => object[key] === value);
    }

    componentDidMount() {
        let svg = document.querySelector("#ballTable_box_svg")
        svg.addEventListener('mousedown', this.startDrag);
        svg.addEventListener('mousemove', this.drag);
        svg.addEventListener('mouseup', this.endDrag);
        svg.addEventListener('touchstart', this.startDrag);
        svg.addEventListener('touchmove', this.drag);
        svg.addEventListener('touchend', this.endDrag);
        // let panZoomTiger = svgPanZoom('#ballTable_box_svg');
        svg.addEventListener("wheel", this.wheel);
    }

    wheel = (e) => {
        let scale = this.state.scale

        if (e.deltaY < 0) {
            scale += 0.05
        } else if (e.deltaY > 0) {
            scale -= 0.05
        }

        this.setState({scale: scale})
    }


    startDrag = (evt) => {
        if (evt.type === 'touchstart') {
            this.setState({startTouch: {x: evt.touches[0].pageX, y: evt.touches[0].pageY}})
        }
        if (this.state.overBall !== undefined) {
            console.log(this.state.overBall.state.ref.current);
            if (this.state.overBall.state.ref.current !== null) {
                this.state.overBall.enableStartDrag()
                let offset = this.getMousePosition(evt);
                let parsedTranslate3d = this.state.overBall.state.ref.current.style.transform.replace(/translate3d\(/g, "").replace(/px/g, "").replace(/\)/g, "").split(",")
                offset.x -= parseFloat(parsedTranslate3d[0])
                offset.y -= parseFloat(parsedTranslate3d[1])
                console.log(offset);
                this.state.overBall.getIncomingLink().forEach(l => {
                    l.ref.current.hideMe()
                })
                this.state.overBall.getOutcomingLink().forEach(l => {
                    //if ( l.ref.current !== null) {
                    l.ref.current.hideMe()
                    //}
                })

                this.setState({startDrag: true, startOffset: offset})
            }
        } else {
            this.setState({inPanMove: true})
        }
    }

    endDrag = (evt) => {
        let me = this
        if (this.state.overBall !== undefined) {


            this.state.overBall.disableStartDrag()
            let offset = this.getMousePosition(evt);
            this.state.overBall.setNewCenter(offset)


            this.setState({startDrag: false}, () => {
                me.state.overBall.getIncomingLink().forEach(il => {
                    try {
                        let startOffset = me.state.overBall.getBBoxCenterCoord()
                        let endIM = me.state.overBall.getInvertedCTMOfFCircle()
                        startOffset.x -= this.state.translateX * endIM.a
                        startOffset.y -= this.state.translateY * endIM.a

                        il.ref.current.setEndpointPoint(startOffset)
                        il.ref.current.showMe()
                    }catch (e){

                    }
                })
                me.state.overBall.getOutcomingLink().forEach(ol => {

                    //if (ol.ref.current !== null) {
                    try {
                        let endOffset = me.state.overBall.getBBoxCenterCoord()
                        let endIM = me.state.overBall.getInvertedCTMOfFCircle()

                        endOffset.x -= this.state.translateX * endIM.a
                        endOffset.y -= this.state.translateY * endIM.a
                        ol.ref.current.setStartPoint(endOffset)
                        ol.ref.current.showMe()
                    }catch (e){

                    }
                    //}
                })
            })
        } else {
            this.setState({inPanMove: false})
        }

    }


    drag = (evt) => {
        let me = this
        evt.preventDefault();
        if (this.state.startDrag && this.state.overBall !== undefined) {
            if (this.lastUpdateCall) {
                cancelAnimationFrame(this.lastUpdateCall);
            }
            this.lastUpdateCall = requestAnimationFrame(function () {
                me.setState({coord: me.getMousePosition(evt)}, () => {
                    me.update()
                    // me.state.overBall.getIncomingLink().forEach( il =>{
                    //     il.ref.current.setEndpointPoint(me.getMousePosition(evt))
                    //     // console.log();
                    //     // console.log(il);
                    // })
                    // me.state.overBall.getOutcomingLink().forEach( ol =>{
                    //     ol.ref.current.setStartPoint(me.getMousePosition(evt))
                    // })
                    me.lastUpdateCall = null;
                })
            });
        } else if (this.state.overBall === undefined && this.state.inPanMove) {
            let x = this.state.translateX
            let y = this.state.translateY
            if (evt.type === 'touchmove') {

                this.setState({translateX: x - ((this.state.startTouch.x - evt.touches[0].pageX)), translateY: y - ((this.state.startTouch.y - evt.touches[0].pageY))})
                this.setState({startTouch: {x: evt.touches[0].pageX, y: evt.touches[0].pageY}})

            } else {
                this.setState({translateX: x + evt.movementX, translateY: y + evt.movementY})
            }

        }
    }


    ballHover = (pos) => {
        if (!this.state.startDrag && this.state.overBall !== pos) {
            // console.log("ballover");
            this.setState({overBall: pos})
        }
    }
    update = () => {
        // let me = this
        if (this.state.overBall !== undefined) {
            let ob = this.state.overBall
            ob.state.ref.current.style.transform = "translate3d(" + (this.state.coord.x - this.state.startOffset.x) + "px," + (this.state.coord.y - this.state.startOffset.y) + "px,0)"


            this.setState({overBall: ob}, () => {
                // me.state.overBall.getIncomingLink().forEach( il =>{
                //     il.ref.current.setEndpointPoint(me.state.overBall.getCenterCoord())
                // })
                // me.state.overBall.getOutcomingLink().forEach( ol =>{
                //     ol.ref.current.setStartPoint(me.state.overBall.getCenterCoord())
                // })
            })
        }
    }

    getMousePosition = (evt) => {
        let CTM = document.querySelector("#ballTable_box_svg").getScreenCTM();
        if (evt.type === 'touchstart' || evt.type === 'touchmove' || evt.type === 'touchend' || evt.type === 'touchcancel') {
            let touch = evt.touches[0] || evt.changedTouches[0];
            return {
                x: (touch.pageX - CTM.e) / CTM.a,
                y: (touch.pageY - CTM.f) / CTM.d
            };
        } else {
            return {
                x: ((evt.clientX - CTM.e) / CTM.a),
                y: ((evt.clientY - CTM.f) / CTM.d)
            };
        }


    }



    checkLinkCosistency = () => {
        let dupBalls = this.state.balls
        dupBalls.forEach(ball=>{
            console.log(ball.ref.current);
            let ols = ball.ref.current.getOutcomingLink()
            let ils = ball.ref.current.getIncomingLink()
            ols.forEach(ol=>{
                if (ol.ref.current === null){
                    ball.ref.current.removeOutcomingLink(ol)
                }
            })

            ils.forEach(il=>{
                if (il.ref.current === null){
                    ball.ref.current.removeIncomingLink(il)
                }
            })
        })

       // this.setState({balls: dupBalls,links:dupLinks,table_element: dupLinks.concat(dupBalls)})

    }


    removeBall = (element) => {
        console.log(element);
        let me = this
        let dupBalls = this.state.balls
        let dupLinks = this.state.links
      //  let linksToBeRemoved = []
        let removeIndexLink = []
        for (let i = 0; i < dupLinks.length; i++) {
            let startNode = dupLinks[i].ref.current.getStartNode().ref.current
            let endNode = dupLinks[i].ref.current.getEndNode().ref.current

            if (startNode === element || endNode === element){
       //         linksToBeRemoved=[dupLinks[i]]
                removeIndexLink.push(i)
            }
        }
        for (let i = removeIndexLink.length -1; i >= 0; i--)
            dupLinks.splice(removeIndexLink[i],1);

        let index = -1
        for (let i = 0; i < dupBalls.length; i++) {
            if (dupBalls[i].key === element._reactInternals.key) {
                dupBalls[i].ref.current.removeOptionDialog()
                index = i
            }
        }
        console.log(index);
        dupBalls.splice(index, 1);

        this.setState({balls: dupBalls,links:dupLinks,table_element: dupLinks.concat(dupBalls)}, ()=>{
            me.checkLinkCosistency()
        })

    }

    openBallOption = (ball) =>{
       this.state.optionDialogRef.current.openMe(ball);
    }


    openBallResults = (results,columns,idKey) =>{
        console.log(idKey);
        this.state.resultsDialogRef.current.openMe(results,columns,idKey);
    }

    scanPaths = (begin, end = undefined) => {

        let n = Object.keys(types).length + 1
        let stack = [];
        console.log(this.tree);
        let elements = this.tree.DFSCall(parseInt(this.getKeyByValue(this.typesIndexMapping, begin)), parseInt(this.getKeyByValue(this.typesIndexMapping, end)), n, stack);
        return elements

        // let lastBall = this.state.balls[this.state.balls.length - 1]
        //
        // if (lastBall !== undefined) {
        //     lastBall = lastBall.ref.current
        //     let start = lastBall.getType().name
        //     console.log("calculate from " + start + " to " + end);
        // }

    }


    isThisBallOnTheTable = (type, balls) => {
        let out = undefined
        balls.forEach(b => {
            if (b.props.type.name === type.name) {
                out = b
            }
        })
        return out
    }

    isThisBallOnTheTableList = (type, balls) => {
        let out = []
        balls.forEach(b => {
            if (b.props.type.name === type.name) {
                out.push(b)
            }
        })

        return out.length > 0 ? out : undefined
    }

    getBBoxCenterCoordOfNode = (node) => {
        console.log(node);
        let bbox = document.getElementById(node.props.circleId).getBoundingClientRect();
        return ({x: bbox.x + ((bbox.width - 10) / 2), y: bbox.y + ((bbox.height - 5) / 2)})
    }

    getLastBallCoords = (balls) => {
        let lastBall = balls[balls.length - 1]
        let offset = undefined
        if (lastBall.ref.current !== null) {
            offset = {...lastBall.ref.current.getCenterCoord()}
        } else {
            offset = {...lastBall.props.offset}
            offset.x = offset.x + 200
            offset.y = offset.y + 100
        }
        return offset
    }

    getLastElement = (balls) => {
        let lastBall = balls[balls.length - 1]
        return lastBall
    }

    getBallCoords = (ball) => {
        let offset = undefined
        if (ball.ref.current !== null) {
            offset = {...ball.ref.current.getCenterCoord()}
        } else {
            offset = {...ball.props.offset}
            offset.x = offset.x + 200
            offset.y = offset.y + 100
        }
        return offset
    }



    addBall = (element) => {
        console.log("addball");
        let me = this
        let bb = this.state.balls
        let ll = this.state.links
        let lastBall = undefined
        let offset = undefined

        console.log(this.tree);
        let attachToMe = []
        let cloneNode = undefined


        if (this.state.balls.length === 1) {
            // generates path from two nodes
            lastBall = this.state.balls[0]
            let path = this.scanPaths(lastBall.ref.current.getType().name, element.getType().name)
            // console.log(path);
            path.forEach(ballInPath => {
                let ballInPathType = types[this.typesIndexMapping[ballInPath]]
                let existingNode = this.isThisBallOnTheTable(ballInPathType, bb)
                if (existingNode === undefined) {

                    offset = {...this.getLastBallCoords(bb)}
                    let newRef = React.createRef()

                    let newBall = <Ball key={uuidv4()} ref={newRef} circleId={uuidv4()} type={ballInPathType} ballTable={me} offset={offset} callBackSelection={(pos) => this.ballHover(pos)} closeMe={(ball) => this.removeBall(ball)} openSetup={(ball) => this.openBallOption(newRef)} openResults={(results,columns,idKey) => this.openBallResults(results,columns,idKey)}  />
                    let newLink = <Link key={uuidv4()} ref={React.createRef()} startNode={this.getLastElement(bb)} endNode={newBall}/>
                    bb.push(newBall)
                    ll.push(newLink)
                    attachToMe = [bb[bb.length - 1]]
                } else {
                    attachToMe = [existingNode]
                }

            })


        } else if (this.state.balls.length > 1) {
            let paths = []
            try {

                bb.every(b => {
                    let shortestpath = []
                    let path = this.scanPaths(b.ref.current.getType().name, element.getType().name)
                    if (path.length === 0) {
                        // this node already exists
                        paths = []
                        cloneNode = this.isThisBallOnTheTableList(element.getType(), bb)
                        return false;
                        // path.push(this.getKeyByValue(this.typesIndexMapping, element.getType().name))
                    }
                    if (shortestpath.length === 0 || shortestpath.length > path.length) {
                        // shortestpath = path
                        paths.push(path)
                        // console.log("set shortest to " + path.toString());
                    } else {
                        // console.log("discarded " + path.toString());
                    }
                    return true;
                })
                paths.forEach(shortestpath => {
                    console.log(shortestpath);
                    let lastSPElement = undefined
                    shortestpath.forEach((ballInPath, index) => {

                        let ballInPathType = types[this.typesIndexMapping[ballInPath]]
                        let existingNodeS = this.isThisBallOnTheTableList(ballInPathType, bb)

                        if (existingNodeS === undefined) {
                            offset = {...this.getBallCoords(lastSPElement)}
                            let newRef = React.createRef()
                            let newBall = <Ball key={uuidv4()} ref={newRef} circleId={uuidv4()} type={ballInPathType} ballTable={me} offset={offset} callBackSelection={(pos) => this.ballHover(pos)} closeMe={(ball) => this.removeBall(ball)} openSetup={(ball) => this.openBallOption(newRef)} openResults={(results,columns,idKey) => this.openBallResults(results,columns,idKey)}/>
                            let newLink = <Link key={uuidv4()} ref={React.createRef()} startNode={lastSPElement} endNode={newBall}/>
                            bb.push(newBall)
                            ll.push(newLink)
                            if (index === shortestpath.length - 1) {
                                attachToMe.push(bb[bb.length - 1])
                            }
                            lastSPElement = bb[bb.length - 1]
                        } else {

                            existingNodeS.forEach(existingNode => {
                                if (existingNode === undefined) {
                                    offset = {...this.getBallCoords(lastSPElement)}
                                    let newRef = React.createRef()
                                    let newBall = <Ball key={uuidv4()} ref={newRef} circleId={uuidv4()} type={ballInPathType} ballTable={me} offset={offset} callBackSelection={(pos) => this.ballHover(pos)} closeMe={(ball) => this.removeBall(ball)} openSetup={(ball) => this.openBallOption(newRef)} openResults={(results,columns,idKey) => this.openBallResults(results,columns,idKey)}/>
                                    let newLink = <Link key={uuidv4()} ref={React.createRef()} startNode={lastSPElement} endNode={newBall}/>
                                    bb.push(newBall)
                                    ll.push(newLink)
                                    if (index === shortestpath.length - 1 && !attachToMe.includes(existingNode)) {
                                        attachToMe.push(bb[bb.length - 1])
                                    }
                                    lastSPElement = bb[bb.length - 1]
                                } else {
                                    if (index === shortestpath.length - 1 && !attachToMe.includes(existingNode)) {
                                        attachToMe.push(existingNode)
                                    }
                                    lastSPElement = existingNode
                                }
                            })
                        }
                    })
                })
            } catch (e) {
                console.log(e);
            }

        }


        let newball
        if (this.state.balls.length === 0) {
            let newRef = React.createRef()
            newball = <Ball key={uuidv4()} ref={newRef} circleId={uuidv4()} type={element.getType()} ballTable={this} offset={offset} callBackSelection={(pos) => this.ballHover(pos)} closeMe={(ball) => this.removeBall(ball)} openSetup={(ball) => this.openBallOption(newRef)} openResults={(results,columns,idKey) => this.openBallResults(results,columns,idKey)}/>

        } else {

            if (cloneNode !== undefined) {
                console.log("this node already exist");

                let lastClone = this.getLastElement(cloneNode)
                let ils = lastClone.ref.current.getIncomingLink();
                let ols = lastClone.ref.current.getOutcomingLink();
                console.log(lastClone);
                offset = lastClone.ref.current.getBBoxCenterCoord()
                offset.x = offset.x - 400
                offset.y = offset.y + 100
                let newRef = React.createRef()
                newball = <Ball key={uuidv4()} ref={newRef} circleId={uuidv4()} type={element.getType()} ballTable={this} offset={offset} callBackSelection={(pos) => this.ballHover(pos)} closeMe={(ball) => this.removeBall(ball)} openSetup={(ball) => this.openBallOption(newRef)} openResults={(results,columns,idKey) => this.openBallResults(results,columns,idKey)}/>
                ils.forEach(l => {
                    ll.push(<Link key={uuidv4()} ref={React.createRef()} startNode={l.props.startNode} endNode={newball}/>)
                })
                ols.forEach(l => {
                    ll.push(<Link key={uuidv4()} ref={React.createRef()} startNode={newball} endNode={l.props.endNode}/>)
                })
                // console.log(ols);

            } else {
                console.log(attachToMe);
                if (attachToMe[attachToMe.length - 1].ref.current !== null) {
                    offset = {...attachToMe[attachToMe.length - 1].ref.current.getCenterCoord()}
                } else {
                    offset = {...attachToMe[attachToMe.length - 1].props.offset}
                    offset.x = offset.x + 200
                    offset.y = offset.y + 100
                }
                let newRef = React.createRef()
                newball = <Ball key={uuidv4()} circleId={uuidv4()} ref={newRef} type={element.getType()} ballTable={this} offset={offset} callBackSelection={(pos) => this.ballHover(pos)} closeMe={(ball) => this.removeBall(ball)} openSetup={(ball) => this.openBallOption(newRef)} openResults={(results,columns,idKey) => this.openBallResults(results,columns,idKey)}/>

                attachToMe.forEach(atm => {
                    ll.push(<Link key={uuidv4()} ref={React.createRef()} startNode={atm} endNode={newball}/>)
                })
            }
        }


        bb.push(newball)
        this.setState({balls: bb, links: ll, table_element: ll.concat(bb)}, () => {
            // update link reference and node i/o reference
            me.state.balls.forEach(b => {
                console.log(b.ref.current);
            })
            me.state.links.forEach(l => {
                // console.log("start");
                // console.log(l.props.startNode.ref.current);
                // console.log("end");
                // console.log(l.props.endNode.ref.current !== null ? l.props.endNode.ref.current : l.props.endNode);


                let startOffset = l.props.startNode.ref.current.getBBoxCenterCoord()
                let startIM = l.props.startNode.ref.current.getInvertedCTMOfFCircle()


                startOffset.x -= this.state.translateX * startIM.a
                startOffset.y -= this.state.translateY * startIM.a

                let endOffset = l.props.endNode.ref.current.getBBoxCenterCoord()
                let endIM = l.props.endNode.ref.current.getInvertedCTMOfFCircle()


                endOffset.x -= this.state.translateX * endIM.a
                endOffset.y -= this.state.translateY * endIM.a

                l.ref.current.setStartPoint(startOffset)
                l.ref.current.setEndpointPoint(endOffset)
                l.props.endNode.ref.current.addIncomingLink(l)
                l.props.startNode.ref.current.addOutcomingLink(l)
            })
        })
    }


    render() {
        return (
            <div className={"ballTable_box "}> {/*comment ball_shadow*/}
                {/*<svg id={"demo-tiger"} version="1.1">*/}
                {/*    <g id="g444" fill="none">*/}
                {/*        <rect width="300" height="100" style={{fill:"rgb(0,0,255)",strokeWidth:"3",stroke:"rgb(0,0,0)"}} />*/}
                {/*    </g>*/}
                {/*</svg>*/}
                <svg width="100%" height="100%" id={"ballTable_box_svg"}>
                    <g id={"pictk"} transform={"translate(" + this.state.translateX + "," + this.state.translateY + ") scale(" + this.state.scale + ")"}>
                        <filter id="dropshadow" height="130%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
                            <feOffset dx="2" dy="2" result="offsetblur"/>
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.2"/>
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        {this.state.table_element}
                    </g>
                </svg>
                <OptionDialog ref={this.state.optionDialogRef}/>
                <ResultsDialog ref={this.state.resultsDialogRef}/>
                <div id="ball_tooltip" className={"ball_tooltip"} style={{position:"absolute",display:"none"}}></div>
            </div>
        );
    }


    randomIntFromInterval = (min, max) => { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }


}

export default BallTable;
