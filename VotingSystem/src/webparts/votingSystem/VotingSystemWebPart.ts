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
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
require('bootstrap');
require('chart.js');
var CurntUser='';
var IsUsrinList;
import * as pnp from 'sp-pnp-js';
import Chart from 'chart.js';
import { CurrentUser } from 'sp-pnp-js/lib/sharepoint/siteusers';
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
        <canvas id="pieChart"></canvas>

       
      </div>
    </div>`;
      this.Load();
      
  }
Load(){
  var Contxturl=this.context.pageContext.web.absoluteUrl;
  var opt='';
 
  
  if (Environment.type === EnvironmentType.Local) {
    this.domElement.querySelector('.mainDiv').innerHTML = "Sorry this does not work in local workbench";
  } 
  else{


  jQuery(document).ready(function(){
  jQuery('#mainDiv').ready(GetCurrentUSer(),GetLocations());

function DrawPiechart(locationArray)
{
 
  var ctxP:any = document.getElementById("pieChart")
  var context = ctxP.getContext('2d');
  var myPieChart = new Chart(ctxP, {
    type: 'pie',
    data: {
        labels: [locationArray],
        datasets: [
            {
                data: [300, 50, 100, 40, 120],
                backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"],
                hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"]
            }
        ]
    },
    options: {
        responsive: true
    }
});



}

 function GetCurrentUSer(){

  var call = jQuery.ajax({
    url: Contxturl+"/_api/web/currentuser",
    type: "GET",
    dataType: "json",
    headers: {
        Accept: "application/json;odata=verbose"
    }
});
call.done(function (data, textStatus, jqXHR) {
   CurntUser = data.d.Title;
    alert(CurntUser);
    GetListItem();
    
});
call.fail(function (jqXHR, textStatus, errorThrown) {
  var response = JSON.parse(jqXHR.responseText);
  var message = response ? response.error.message.value : textStatus;
  alert("Call failed. Error: " + message);
});
  

 }



function GetLocations()
{
 var locationArray=[]; 
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
            AddButton.append(`<div class="col-sm-3"> <div class="panel panel-default" style="border-radius: 10%;border-top-left-radius: 10%;""><div class="panel-body center bg-primary" style=" border-top-left-radius: 10%; border-top-right-radius: 10%; "><p class="bg-primary" style="text-align:center;">${value.Location}</p></div><div class=""panel-body center bg-primary" style="margin-top: 4%;margin-left: 20%;margin-bottom: 4%; margin-right: 15%;"><button href="#" class="Likebtn btn btn-info btn-lg center" id="${value.Location}"> <span class="glyphicon glyphicon-thumbs-down center" id="${value.Location}sp">Like</span></button></div></div> </div>`);
            locationArray.push(value.Location);
          });
          
      });
    call.fail(function (jqXHR, textStatus, errorThrown) {
    var response = JSON.parse(jqXHR.responseText);
    var message = response ? response.error.message.value : textStatus;
    alert("Call failed. Error: " + message);
    }); 
    DrawPiechart(locationArray);

    jQuery(document).on("click", ".Likebtn" , function() {

      if(opt== null ||opt=='')
      {
        //glyphicon-thumbs-down
        opt= jQuery(this).attr("id");
        jQuery('#'+opt+"sp").removeClass('glyphicon-thumbs-down');
        jQuery('#'+opt+"sp").addClass('glyphicon-thumbs-up');
        jQuery('#'+opt+"sp").empty();
        jQuery('#'+opt+"sp").append('Liked');
      jQuery("#VoteButton").removeAttr("disabled");
      }
      else
      {
        jQuery('#'+opt+"sp").removeClass('glyphicon-thumbs-up');
        jQuery('#'+opt+"sp").addClass('glyphicon-thumbs-down');
        jQuery('#'+opt+"sp").empty();
        jQuery('#'+opt+"sp").text('Dislike');
        jQuery("#VoteButton").attr("disabled","disabled");
        
        opt='';
      }       
     

   });
  

  }

  function GetListItem()
  {
    var url=Contxturl+`/_api/web/lists/getByTitle('SAT_Votes')/Items/?$select=Voted_By,Locations,ID&$filter=(Voted_By eq '${CurntUser}')`;
    alert("come"+CurntUser);
    var call = jQuery.ajax({
      url:url,
      type: "GET",
      dataType: "json",
      headers: {
          Accept: "application/json;odata=verbose"
      }
      });
        call.done(function (data, textStatus, jqXHR) {
           
              if(!(data.d.results[0].location==''))
              {
                IsUsrinList=data.d.results[0].ID;
              alert(data.d.results[0].Locations+"location selected by");
              jQuery('#'+data.d.results[0].Locations+"sp").removeClass('glyphicon-thumbs-down');
              jQuery('#'+data.d.results[0].Locations+"sp").addClass('glyphicon-thumbs-up');
              jQuery('#'+data.d.results[0].Locations+"sp").empty();
              jQuery('#'+data.d.results[0].Locations+"sp").append('Liked');
              }
            });
            
       
      call.fail(function (jqXHR, textStatus, errorThrown) {
      var response = JSON.parse(jqXHR.responseText);
      var message = response ? response.error.message.value : textStatus;
      alert("Call failed. Error: " + message);
      }); 

  }

  });
 
  }

  document.getElementById('VoteButton').addEventListener('click',()=>this.CreateItem(opt,CurntUser));
  
}

 CreateItem(opt,CurntUser)
{
  alert("coming");
  if (Environment.type === EnvironmentType.Local) {
    this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
  } 
  else{
    
  
  alert("Location is : "+opt);
  alert("name"+CurntUser);  
  if(IsUsrinList=='')
  {
      const spOpts: ISPHttpClientOptions = {
        body: `{ Locations: '${opt}', Voted_By: '${CurntUser}' }`
      };
      var Url= this.context.pageContext.web.absoluteUrl+ "/_api/web/lists/getByTitle('SAT_Votes')/Items";
      this.context.spHttpClient.post(
        Url, SPHttpClient.configurations.v1,spOpts)
        .then((response: SPHttpClientResponse) => {
          console.log("After creation response", response);

          response.json().then((responseJSON: JSON) => {
            console.log("JSON", responseJSON);
          });

          if (response.ok) {
            alert("added");
          
          }
          
          return;

        })
        .catch((error: SPHttpClientResponse) => {
          console.log(error);
          return;
        });
        
    }
    else
    {
      alert('comeupdate');
        pnp.sp.web.lists.getByTitle('SAT_Votes').items.getById(parseInt(IsUsrinList)).update({ Locations: opt});

    }
  }

}


// private getListsInfo(CurntUser) {
//   alert("asdasd"+CurntUser);
//   let html: string = '';
//   if (Environment.type === EnvironmentType.Local) {
//     this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
//   } else {
//   this.context.spHttpClient.get
//   (
//     this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getByTitle('SAT_Votes')/Items/?$select=Voted_By,Locations&$filter=(Voted_By eq '${CurntUser}')`, 
//     SPHttpClient.configurations.v1)
//     .then((response: SPHttpClientResponse) => {
//       response.json().then((listsObjects: any) => {
//         listsObjects.value.forEach(listObject => {
//           alert(listObject.Locations);
//           jQuery('#'+listObject.Locations+"sp").removeClass('glyphicon-thumbs-down');
//           jQuery('#'+listObject.Locations+"sp").addClass('glyphicon-thumbs-up');
//           jQuery('#'+listObject.Locations+"sp").empty();
//           jQuery('#'+listObject.Locations+"sp").append('Liked');
//         });
//       //  this.domElement.querySelector('#list').innerHTML = html;
//       });
//     });        
//   }
// } 


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
