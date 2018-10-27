import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import{SPComponentLoader} from '@microsoft/sp-loader';
import styles from './VotingSystemWebPart.module.scss';
import * as strings from 'VotingSystemWebPartStrings';

import * as jQuery from 'jquery';
require('bootstrap');


export interface IVotingSystemWebPartProps {
  description: string;
}

export default class VotingSystemWebPart extends BaseClientSideWebPart<IVotingSystemWebPartProps> {

  public render(): void {

    let cssdata = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    SPComponentLoader.loadCss(cssdata);
    let Scripturl="https://canvasjs.com/assets/script/jquery.canvasjs.min.js";
    SPComponentLoader.loadScript(Scripturl);
    this.domElement.innerHTML = `
    <div class="mainDiv">
      <div class="well well-lg">
        <div class="row">  
          <div class="col-sm-12" id="ButtonDiv">    
           
          </div>
            
             <button type="button" class="btn btn-primary" style="margin-left: 45%;" id="VoteButton" disabled="disabled">Vote</button>
          
        <div> 
      </div>
    </div>`;
      this.Load();
  }
Load(){
  var Contxturl=this.context.pageContext.web.absoluteUrl;

  if (Environment.type === EnvironmentType.Local) {
    this.domElement.querySelector('.mainDiv').innerHTML = "Sorry this does not work in local workbench";
  } 
  else{


  jQuery(document).ready(function(){
  jQuery('#mainDiv').ready(GetLocations());
 
 

function GetLocations()
{
  var opt='0';
  var call = jQuery.ajax({
    url:Contxturl+"/_api/web/lists/getByTitle('SAT_Locations')/Items/?$select=Location,ID",
    type: "GET",
    dataType: "json",
    headers: {
        Accept: "application/json;odata=verbose"
    }
    });
     
    var AddButton=jQuery('#ButtonDiv');
      call.done(function (data, textStatus, jqXHR) {
          jQuery.each(data.d.results, function (key, value) {
            AddButton.append(`<div class="col-sm-3"> <div class="panel panel-default"><div class="panel-body center bg-primary"><p class="bg-primary" style="text-align:center;">${value.Location}</p></div><div class=""panel-body center bg-primary" style="margin-top: 4%;margin-left: 20%;margin-bottom: 4%;"><button href="#" class="Likebtn btn btn-info btn-lg center" id="${value.ID}"> <span class="glyphicon glyphicon-thumbs-up center" id="${value.ID}sp"></span>Like</button></div></div> </div>`);
          });
          
      });
    call.fail(function (jqXHR, textStatus, errorThrown) {
    var response = JSON.parse(jqXHR.responseText);
    var message = response ? response.error.message.value : textStatus;
    alert("Call failed. Error: " + message);
    }); 

    jQuery(document).on("click", ".Likebtn" , function() {

      if(opt== null ||opt=='')
      {
        //glyphicon-thumbs-down
        opt= jQuery(this).attr("id");
        jQuery('#'+opt+"sp").addClass('glyphicon-thumbs-down');
        
      jQuery("#VoteButton").removeAttr("disabled");
      }
      else
      {
        jQuery('#'+opt+"sp").removeClass('glyphicon-thumbs-down');
       
        jQuery("#VoteButton").attr("disabled","disabled");
     
        opt='';
      }       


   });

  }

  });
  }
}

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
