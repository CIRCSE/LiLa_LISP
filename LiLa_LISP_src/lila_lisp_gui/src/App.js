import './App.css';
import {Component} from "react";
import {Copyright} from "./Components/Utils";
import Playground from "./Components/Playground";
import Toolbox from "./Components/Toolbox/Toolbox";
import BallTable from "./Components/PalletteTable/BallTable";
import React from "react";


require('particles.js');

class App extends Component {

    constructor(props) {
        super(props);
        this.state ={
            balltable:  React.createRef()
        }
    }


    componentDidMount() {
        window.particlesJS.load('particles-js', 'assets/particles.json')
    }



    addElementToPlayground = (e) =>{
        this.state.balltable.current.addBall(e)
    }

    render() {
        return (
            <div>
                <div>
                    <a href="https://lila-erc.eu" style={{position: 'absolute', top: '12px', right: '18px',zIndex:10000}}><img src={"./elements/cropped-lila-logo.png"} alt={"LiLa logo"} style={{width: '70px'}}/></a>

                    <h1 className="noselect" style={{backgroundColor: 'transparent', fontFamily: 'moonbold', fontSize: "1.8em", color: "#fff", marginRight: '100px', marginLeft: '10px', marginBottom: "40px"}}>LiLa Interactive Search Platform</h1>

                    <Playground/>
                    <BallTable ref={this.state.balltable}/>
                    <Toolbox addElement={ (element) => {this.addElementToPlayground(element)} }/>


                    <footer className={"footer"} style={{zIndex:"30"}}>
                        <Copyright/>
                    </footer>

                </div>
            </div>
        );
    }
}

export default App;
