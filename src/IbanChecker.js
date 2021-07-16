import './App.css';
import React, { Component } from 'react';
import Select from 'react-select';
import { API } from '../package.json';
import axios from 'axios';
const VALIDATE_LABEL = "Validate & check IBAN number for erros";
const IBAN_INPUT_PLACEHOLDER = "Type IBAN...";
const VALIDATE_IBAN = "Validate";
const FAILED_IBAN = "The IBAN you entered is not valid!";
const PASSED_IBAN = "The IBAN you entered is valid!";
const FAILED_LIST = "The file you uploaded has invalid IBANs!";
const PASSED_LIST = "The file you uploaded has valid IBANs!";
const FAILED = "Failed";
const CHOOSE_MODE = "Please select your IBAN mode";
const enter_single_iban = "Single IBAN";
const upload_list_iban = "List of IBANs";
const _single = "single";
const _list = "list";
const _drag_and_drop = "Drag and drop your file here or press Upload File Button";
const file_extension = "Your file should have .csv extension"
const $ = require('jquery');
const apiInfo = Object.assign({}, API);
const path = "/IbanServlet";
const pathFile = "/IbanFileServlet";
const url = apiInfo.BASE_URL;

class IbanChecker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            singleIban: false,
            listIban: false
        };

    }
    onDrop(e) {
		document.getElementById('fileSelectBox').classList.remove( 'fileContainerDragOver' );
		try {
			var droppedFiles = e.dataTransfer.files;
			document.getElementById('fileName').textContent = droppedFiles[0].name;
		} catch (error) { ; }
	}

	 dragOver(e) {
		document.getElementById('fileSelectBox').classList.add( 'fileContainerDragOver' );
		e.preventDefault();
		e.stopPropagation();
	}

	 leaveDrop(e) {
		document.getElementById('fileSelectBox').classList.remove( 'fileContainerDragOver' );
    }

    fileContainerChangeFile=(e)=> {
      document.getElementById('fileSelectBox').classList.remove( 'fileContainerDragOver' );
      try {
        var droppedFiles = document.getElementById('fs').files;
        document.getElementById('fileName').textContent = droppedFiles[0].name;
      } catch (error) {;  }

      try {
        var aName = document.getElementById('fs').value;
        if (aName !== '') {
          document.getElementById('fileName').textContent = aName.split('fakepath').replace('//','');
        }
      } catch (error) {
        ;
      }
	}

  validateSingle=()=>{
    let _this = this;
    let query = {
      action: "validateSingleIBAN",
      account_number:this.state.account_number
    }
    fetch(`${url}${path}`, {mode:'cors', credentials:'include', method: "POST", body: JSON.stringify(query)})
        .then((response)=>{    
            if(response.status === 403) {
            }
            return response.json()})
        .then((data)=>{
            if(data){
              _this.setState({
                data: data
              })
            }
        }).catch((error)=>{
          console.log("error " + error);
        });
  }

  validateFile=()=>{
    let _this = this;
    let formData = new FormData();
    formData.append("uploadedfile",document.getElementById('fs').files[0]);
    axios({
      method: "post",
      url: url+pathFile,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((data)=> {
        if(data.data){
              _this.setState({
                data: data.data
              })
            }
      })
      .catch((error)=> {
        console.log("error " + error);
      });
 
  }

    validate=()=> {
      let _this = this;
      if (this.state.mode.value === _single) {
        _this.validateSingle();
      }else{
        _this.validateFile();
      }
      
      }

    renderHeader(){
      let header = [];
      header.push(<h1 className="header-title uk-margin-top uk-text-bold">IBAN CHECKER</h1>);
      return header;
    }

    renderSingleBody=()=>{
      let body = [];
      body.push(<div className="uk-margin-top">
                  <span>{VALIDATE_LABEL}</span>
                  <div className="body-input-button uk-margin-top">
                    <input type="text" className="form-control" placeholder={IBAN_INPUT_PLACEHOLDER} onChange={this.handleInputChange}/>
                    <button className="validate-button" onClick={this.validate}>{VALIDATE_IBAN}</button>
                  </div>
                </div>);
      return body;
    }

    renderFileBody=()=>{
        let body = [];
        body.push(<div className="uk-margin-top uk-width-1-3 uk-align-center">
                    <div className="uk-flex uk-flex-column">
                        <div className="fileContainer" id="fileSelectBox" 
                            onDragOver={(event)=>{this.dragOver(event)}} onDragLeave={(event)=>{this.leaveDrop(event)}} onDrop={(event)=>{this.onDrop(event)}} onChange={(event)=>{this.fileContainerChangeFile(event)}}>
                            <div className="fileContainerFileName" onDrop={(event)=>{this.onDrop(event)}} id="fileName">{_drag_and_drop}</div>
                            <span className="input-group-btn uk-float-right uk-margin-large-right">
                                <button className="subtle--btn-secondary uk-padding-xsmall" type="button"><i className="fal fa-upload uk-margin-small-right"/>Upload File</button>
                            </span>
                            <input name="fs" id="fs" onChange={(event)=>{this.fileContainerChangeFile(event)}} type="file"/>
                            <div className="uk-text-medium red placeHolder uk-margin-small-top uk-margin-small-left">{file_extension}</div>
                        </div>
                    </div>
                    <button className="validate-button uk-margin-top" onClick={this.validate}>{VALIDATE_IBAN}</button>
                  </div>);
        return body;
      }

    renderResult(){
      let data = this.state.data;//[{account_number:"FR12 1234 567 890",checkList: [{check:"IBAN Length Check",status:"Failed", message:"The IBAN's length you entered doesn't match France's IBAN length"}]}];
      let resBody = [];
      let resHeader = [];
      if (!data || data.length === 0) return "";
      let failed = data.filter(e=>e.status===FAILED).length > 0;
      for(var e in data) {
        if (data[e].status === FAILED) {
          if (data[e].check) {
            resBody.push(
                <div className="res-body uk-margin-top">
                <span>
                  {data[e].check + ": "}
                </span>
                <span className="red">
                  {data[e].status }
                </span>
                <span className="message">
                  {data[e].message}
                </span>
              </div>              
            );
          }
         
        }
      }
      resHeader.push(
        <ul>
          <div className={failed ? "red" : "green"}>{this.state.mode.value === _single ? failed ? FAILED_IBAN : PASSED_IBAN : failed ? FAILED_LIST : PASSED_LIST}</div>
          {resBody}
        </ul>
      )
      return resHeader;
    }

    handleChange=(e)=>{
        if (e!== null) {
            this.setState({
                mode: e,
                data:[]
            })
        }
    }

    handleInputChange=(e)=>{
        if (e!== null) {
            this.setState({
                account_number: $(e.currentTarget).val()
            })
        }
    }
   
    render() {
      let header = this.renderHeader();
      let singlebody = this.renderSingleBody();
      let fileBody = this.renderFileBody();
      let result = this.renderResult();
        return(
            <div className="uk-text-center">
              <div>
                {header}
              </div>
              <div className="uk-border">
                  <div>
                      <span>{CHOOSE_MODE}</span>
                      <Select
                        id="select_IBAN_mode"
                        className="select uk-align-center"
                        placeholder={""}
                        name="mode"
                        value={this.state.mode}
                        onChange={(e)=>this.handleChange(e)}
                        options={[{value:_single, label:enter_single_iban},{value:_list, label:upload_list_iban}]}
                        isSearchable={true}/>
                  </div>
                {this.state.mode && this.state.mode.value=== _single ? singlebody : this.state.mode && this.state.mode.value === _list ? fileBody : "" }
              </div>
              <div className="uk-margin-top">
                {result}
              </div>
            </div>
        );

    }

}

export default IbanChecker;
