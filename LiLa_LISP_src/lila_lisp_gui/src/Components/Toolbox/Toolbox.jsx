import {Component} from "react";
import "./assets/toolbox.css"
import ToolboxItem from "./ToolboxItem"
import Separator from "./Sparator"
import {ListUl, Cubes, Book} from 'styled-icons/fa-solid'
// import {Documents } from 'styled-icons/ionicons-solid'
import types from "../data/Types"
import {PersonCircle} from 'styled-icons/ionicons-outline'
import {Document} from 'styled-icons/fluentui-system-filled'
import {Favorite, MenuBook} from 'styled-icons/material'
import {Dice3Fill} from 'styled-icons/bootstrap'
import {Omega} from 'styled-icons/remix-editor'
import {NetworkChart} from 'styled-icons/boxicons-solid'
import {Books} from 'styled-icons/icomoon'
import {Quote} from 'styled-icons/entypo'

class Toolbox extends Component {


    clickOnButton = (e) => {
        this.props.addElement(e)
    }


    render() {
        let iconWidth = 22
        return (
            <div className={"toolbox_container"}>
                <div className={"toolbox_spacer"}/>
                <div className={"toolbox"}>

                    <ToolboxItem type={types.authors} icon={<PersonCircle width={iconWidth}/>} tooltip={"Authors"} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <ToolboxItem type={types.corpora} icon={<Books width={iconWidth}/>} tooltip={"Corpora"} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <ToolboxItem type={types.documents} icon={<Document width={iconWidth}/>} tooltip={"Documents"} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <ToolboxItem type={types.tokens} icon={<Quote width={iconWidth}/>} tooltip={"Tokens"} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <Separator/>
                    <ToolboxItem type={types.lemmabank} icon={<ListUl width={iconWidth}/>} tooltip={"Lemma Bank"} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <Separator/>
                    <ToolboxItem type={types.wfl} tooltip={"Word Formation Latin"} icon={<Cubes width={iconWidth}/>} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <ToolboxItem type={types.affectus} tooltip={"Latin Affectus"} icon={<Favorite width={iconWidth}/>} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <ToolboxItem type={types.wordnet} tooltip={"Latin Wordnet"} icon={<NetworkChart width={iconWidth}/>} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    {/*<ToolboxItem type={types.igvll} tooltip={"Index Graecorum Vocabulorum"} icon={<Omega width={iconWidth}/>} onClick={(e) => {*/}
                    {/*    this.clickOnButton(e)*/}
                    {/*}}/>*/}
                    {/*<ToolboxItem type={types.brill} tooltip={"Brill"} icon={<MenuBook width={iconWidth}/>} onClick={(e) => {*/}
                    {/*    this.clickOnButton(e)*/}
                    {/*}}/>*/}
                    <ToolboxItem type={types.ls} tooltip={"Lewis & Short"} icon={<Book width={iconWidth - 4}/>} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>
                    <ToolboxItem type={types.vallex} tooltip={"Vallex"} icon={<Dice3Fill width={iconWidth - 4}/>} onClick={(e) => {
                        this.clickOnButton(e)
                    }}/>

                </div>
                <div className={"toolbox_spacer"}/>
            </div>
        )
    }

}

export default Toolbox
