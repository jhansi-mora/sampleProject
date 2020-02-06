
//who wrote this program??

// Tooltips Initialization
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream;                      //stream from getUserMedia()
var rec;                            //Recorder.js object
var input;                          //MediaStreamAudioSourceNode we'll be recording
var c = 1;
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record
var isReRecording = false;


function startRecording(recordButton, pauseButton, stopButton, addNewButton, submittButton) {
   
    console.log("recordButton clicked");
    recordButton.textContent == "Re-Record" ? (isReRecording = true) : (isReRecording = false);
    /*
        Simple constraints object, for more advanced audio features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */
    
    var constraints = { audio: true, video:false }

    /*
        Disable the record button until we get a success or fail from getUserMedia() 
    */

   //recordButton.className = "disabled";
    recordButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false;
    addNewButton.disabled = true;
    submittButton.disabled = true;
    
    //  pauseButton.className = "disabled";

    /*
        We're using the standard promise based getUserMedia() 
        https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device

        */
        audioContext = new AudioContext();

        //update the format 
        
        /*Format: 1 channel*/   //document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"
        
        gumStream = stream;   /*  assign to gumStream for later use  */
        
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        /* 
            Create the Recorder object and configure to record mono sound (1 channel)
            Recording 2 channels  will double the file size
        */
        rec = new Recorder(input,{numChannels:1})

        //start the recording process
        rec.record()

        console.log("Recording started");

    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true;
        addNewButton.disabled = false;
        submittButton.disabled = false;
    });
}

function pauseRecording(){
    console.log("pauseButton clicked rec.recording=",rec.recording );
    if (rec.recording){
        //pause
        rec.stop();
        pauseButton.innerHTML="Resume";
    }else{
        //resume
        rec.record()
        pauseButton.innerHTML="Pause";

    }
}

var i=0;
var rowNumber, noOfQuestions;

function stopRecording(recordButton, pauseButton, stopButton, addNewButton, submittButton, noOfQuestions) {
    console.log("stopButton clicked");
   
    
    if(noOfQuestions == 1){
   // if(noOfQuestions == 10){
        addNewButton.className = "btn btn-primary disabled"; 
        document.getElementById('addNewQuestion2').className ="btn btn-primary";
    }
    else if(noOfQuestions == 3){
    //else if(noOfQuestions == 20){
        addNewButton.className = "btn btn-primary disabled"; 
        document.getElementById('addNewQuestion3').className ="btn btn-primary";
    }
    else if(noOfQuestions == 4){
   // else if(noOfQuestions == 30){
        addNewButton.className = "btn btn-primary disabled"; 
        submittButton.className = "btn btn-primary"
    }
   
    var recordButtonId = recordButton.id;
    rowNumber = noOfQuestions;
    i++;
    //disable the stop button, enable the record too allow for new recordings
    recordButton.disabled = false;
    stopButton.disabled = true;
    pauseButton.disabled = true;
    addNewButton.disabled = false;
    submittButton.disabled = false;

    //reset button just in case the recording is stopped while paused
    pauseButton.innerHTML="Pause";
    
    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the MP3 blob and pass it on to createDownloadLink
    rec.exportMP3(createDownloadLink);
    recordButton.textContent = 'Re-Record';
    console.log('created')
}

var r=c;
var blob_list = {};
function createDownloadLink(blob) {
    
    var url = URL.createObjectURL(blob);     //createing a url from my audio blob
    var au = document.createElement('audio');   //creating audio tag
    //var li = document.createElement('li');        //creating list of recorded audio
    var link = document.createElement('a');     //creating link to download   <a>  </a>
    //name of .wav file to use during upload and download (without extendion)
    var filename = new Date().toISOString();

    //add controls to the <audio> element
    au.controls = true;  //like this <audio controls> </audio>
    au.src = url;         

    //save to disk link
    link.href = url; 
        
    link.download = filename+".mp3"; //download forces the browser to donwload the file using the  filename
    link.innerHTML = "Save to disk";

    //add the new audio element to li 
    isReRecording ? (r = rowNumber) : r;
    var l=document.getElementById('recordingsList_' + r);
    var old_element = document.querySelector('#recordingsList_'+ r);
    var new_element = au;
    isReRecording && (old_element != null) ?  old_element.replaceWith(new_element) : l.appendChild(au);
    r++;
    isReRecording ? (blob_list[rowNumber] = blob) : (blob_list[i] = blob);
    //blob_list[i] = blob;

}

var table2;
var table3;
var table1;
//table1 = document.getElementById('POITable1');
function hideTable(){
    table1 = document.getElementById('POITable1');
    table2 = document.getElementById('POITable2');
    table3 = document.getElementById('POITable3');
    table3.style.display = 'none';
    table2.style.display = 'none';
    table1.style.display = 'none';
}

function addRow(table, levelOfQuestion){
   
    table.style.display = 'block';
    var row = document.createElement('tr')   
    row.id = 'row_' + c;
    row.levelOfQuestion = levelOfQuestion;

    var question_no = document.createElement('td');
    question_no.id = 'question_no_' + c;
    question_no.innerText = c
    row.append(question_no)
    
    var question = document.createElement('td');
    question.id = 'question_' + c;
    var quest_input = document.createElement('input')
    quest_input.id = 'quest_input_' + c;
    quest_input.type = "text";
    quest_input.class = "form-control"
    quest_input.placeholder="Enter Your Question Here"
    question.append(quest_input)
    row.append(question)    
    
    //division for   recordingsList
    
    var record = document.createElement('td');
    record.id = 'record_' + c;
    record.class = "col-sm-7";
    var recordingsList = document.createElement('div');
    recordingsList.id = 'recordingsList_' + r;
    recordingsList.innerHTML = ' ';
    row.append(recordingsList)
    record.innerHTML = record_buttons(c)
    row.append(record)
    table.append(row)
    var hr=document.createElement('hr');
    row.append(hr);
    c++;
   
}

var e;
var questionExists = false;
var infoMessage = '';
var activeAddNewButton;

function addnew(button){
  var addNewButtonId = button.id;
  var levelOfQuestion = button.getAttribute('data-questionLevel');
    isErrorExists ? hideErrorMessage() : '';
    if(!selectedSkill || !levelOfExperience){
        error = "Please select \'Skill\' and  \'Level of Experience\' to add a question";
        checkForErrors(error);
    }
    
	else{
        if(c == 1)
        {
            table1 = document.getElementById('POITable1');
            addRow(table1, levelOfQuestion);
            activeAddNewButton = addNewButtonId;
        }
       else if(c>1 && c < 3)
        //else if(c>1 && c < 11)
        {
            
            if(checkFormData(c, table1.id) != false)
            {
                isErrorExists ? hideErrorMessage() : '';
                addRow(table1, levelOfQuestion);
            }
            else
            {
                error = "Please enter both the question and its recording to add a new question";
                checkForErrors(error);
            }    
        }
        else if(c > 2 && c < 4)
       // else if(c > 10 && c < 21)
        {
            activeAddNewButton = addNewButtonId;

            if(c == 3)
           // if(c == 11)
            {
                table2 = document.getElementById('POITable2');
                addRow(table2, levelOfQuestion);
            }

            else if(c > 2 && c < 4 && checkFormData(c, table2.id) != false )
           // else if(c > 10 && c < 21 && checkFormData(c, table2.id) != false )
            {
                isErrorExists ? hideErrorMessage() : '';
                addRow(table2, levelOfQuestion);
            }
            else
            {
                error = "Please enter both the question and its recording to add a new question";
                checkForErrors(error);
            }
        }   
        else if(c > 3 && c < 5)
       // else if(c > 20 && c < 31)
        {
            activeAddNewButton = addNewButtonId;

            if(c == 4)
           // if(c == 21)
            {
                table3 = document.getElementById('POITable3');
                addRow(table3, levelOfQuestion);
            }
            else if(c > 3 && c < 5 && checkFormData(c, table3.id) != false )
           // else if(c > 21 && c < 31 && checkFormData(c, table3.id) != false )
            {
                isErrorExists ? hideErrorMessage() : '';
                addRow(table3, levelOfQuestion);
            }
            else
            {
                error = "Please enter both the question and its recording to add a new question";
                checkForErrors(error);
            }
        }   
        }
}

function record_buttons(c){
rec_id = 'recordButton_' + c
text = ` <button id="recordButton_${c}" class="recordButton btn btn-primary rounded-pill"  style="display:inline-block;" onclick="rec_event_handler(this);">&nbsp;&nbsp;&nbsp;&nbsp;Record <i class="fas fa-microphone"></i> &nbsp;&nbsp;&nbsp;&nbsp;</button>\
<button id="pauseButton_${c}" class="pauseButton btn btn-primary rounded-pill" style="display:inline-block;" onclick="rec_event_handler(this);" disabled>&nbsp;&nbsp;&nbsp;&nbsp;Pause&nbsp;&nbsp;&nbsp;&nbsp;</button> \
<button id="stopButton_${c}" class="stopButton btn btn-primary rounded-pill" onclick="rec_event_handler(this);" style="display:inline-block;" disabled> Stop </button> `;
return text
}


function rec_event_handler(id) {
console.log(id.id, typeof(id.id))
class_idx = id.id.split('_');
class_name = class_idx[0];startRecording
idx = class_idx[1];
noOfQuestions = parseInt(idx);
var recordButton = document.getElementById(`recordButton_${idx}`);
var stopButton = document.getElementById(`stopButton_${idx}`);
var pauseButton = document.getElementById(`pauseButton_${idx}`);
var addNewButton = document.getElementById(activeAddNewButton);
var submittButton = document.getElementById('submitButton');

console.log(class_name)
    if (class_name == 'recordButton') 
    {
        startRecording(recordButton, pauseButton, stopButton, addNewButton, submittButton);
    }
else if (class_name == 'stopButton')
    {
        stopRecording(recordButton, pauseButton, stopButton, addNewButton, submittButton, noOfQuestions)
    }
}



//get selected items and questions code in tree view options

var levelOfExperience;
//var levelOfQuestion;
var questionLevelCode;
var experienceCode;
function getLevelOfExperience(event) { 
    isErrorExists ? hideErrorMessage() : '';
	var target = event.target || event.srcElement;
    var experience = target.parentElement.offsetParent.id === 'levelOfQuestions';
    if(experience){
        levelOfExperience =  target.text;
        experienceCode = target.id.charAt(target.id.length-1); 
	    document.getElementById('selectedExperience').innerHTML = levelOfExperience+' ';    
    }
    else{
        levelOfExperience = target.parentElement.offsetParent.id;
      //  levelOfQuestion = target.textContent; 
        experienceCode = target.parentElement.offsetParent.className; 
        questionLevelCode = target.id.charAt(target.id.length-1); 
        document.getElementById(target.id).className = 'disabled';
        document.getElementById('selectedExperience').innerHTML = levelOfExperience;   
        //document.getElementById('selectedLevelOfQuestion1').innerHTML = "Questions Level: " + levelOfQuestion;  
        
        // document.getElementById('selectedLevelOfQuestion2').innerHTML = "Questions Level: " + levelOfQuestion;  document.getElementById('selectedLevelOfQuestion3').innerHTML = "Questions Level: " + levelOfQuestion;  
    }     
            
} 


//get selected skills

var selectedSkill;
var skillcode;
function getSkills(event){
 isErrorExists ? hideErrorMessage() : '';
 selectedSkill = event.target.text;
 skillcode = event.target.id.charAt(event.target.id.length-1);
 document.getElementById('selectedSkill').innerHTML = selectedSkill+ ' ';
}

//handle onChange
function onChange(){
    hideErrorMessage();
}


//get eMail
var emailField = document.getElementById('emailField');
var email;
var isEmailExists;
function getEmail(){
    if(emailField == null || emailField == undefined){
        error = "Please enter your Email Id before submission";
        checkForErrors();
        isEmailExists = false;
    }
    else{
        email = emailField.value;
       isEmailExists = true;
    }
}

//Check if there are any errors and show or hide accordingly
var error;
var isErrorExists = false;

function checkForErrors(msg){
    if(msg !='' && msg!='undefined'){
        isErrorExists = true;
       showErrorMessage(msg);
    }
    else{
        isErrorExists = false;
        hideErrorMessage();
    }
}

function showErrorMessage(msg){
    window.scrollTo(0, 0);
    var element =  document.getElementById("errorMessage")
    if(msg == error) {
        element.className = "alert alert-danger fade in";
    }
    else if (msg == infoMessage){
        element.className = "alert alert-primary";
    }
    else{
        element.className = "alert alert-success";
    }
    
    element.innerHTML = msg;
    element.style.display = "block";
    error ='';
    infoMessage = '';
}
function hideErrorMessage(){
    document.getElementById("errorMessage").style.display = "none";
}

//Check if there is both question and its recording beofre adding a new question
function checkFormData(questionNumber, table){
    var tableContent = document.querySelector('#'+table);
    var trData = tableContent.querySelectorAll('tr');
    var tr;
    questionNumber < 11  ?  (tr = trData[questionNumber-1]) :  (tr = trData[trData.length-1]);
    
    let quesTemp = tr.firstChild.innerText;
    let temp = tr.querySelector('input');
    let recordTemp = tr.querySelector('audio');

    if (((temp != null || temp != undefined) && temp.value != '') && 
        (quesTemp != null || quesTemp != undefined) &&
          (recordTemp != null || recordTemp != undefined))
        {
            return true;
        }
    else
        {
            return false;
        }   
	
}


var isRowIncomplete = false;
// we submitting all data i.e., 10 question at a time
function submitFormDataEvent(e) {
    //checkForErrors();
    var tableContent1 = document.querySelector('#POITable1');
    var tableContent2 = document.querySelector('#POITable2');
    var tableContent3 = document.querySelector('#POITable3');
    var trData1 = tableContent1.querySelectorAll('tr');
    var trData2 = tableContent2.querySelectorAll('tr');
    var trData3 = tableContent3.querySelectorAll('tr');
    var trData = [];
    var trData = [...trData1, ...trData2, ...trData3];
    trData = trData.filter(x => x.rowIndex != 0);
    var questionWithAudio = [];
    var allQuestionsWithAudio = [];
    var questionLevelArray = [];
    var allUserInput = [];
    var allQuestions = [];
	var formdata = new FormData();

    trData.forEach(tr => {
        if(tr.rowIndex >0) 
        {
            //if(checkFormData(tr.rowIndex) != false){
                let quesTemp = tr.firstChild.innerText;
                let temp = tr.querySelector('input');
                let recordTemp = tr.querySelector('audio');
                let level = tr.levelOfQuestion;
                let rowId = tr.id.split('_')[1];
                if ((temp != null || temp != undefined) && 
                    (quesTemp != null || quesTemp != undefined) &&
                    (recordTemp != null || recordTemp != undefined))
                {
                    let questionText = temp.value;
                    questionWithAudio = {[questionText] : blob_list[parseInt(rowId)] };
                    allQuestionsWithAudio = Object.assign(allQuestionsWithAudio, questionWithAudio);
                    questionLevelArray = {[level] : allQuestionsWithAudio};

                    // formdata.append(questionText,blob_list[parseInt(rowId)]);
                    //var experienceArray = {[experience] : questionLevelArray};
                    //allUserInput = {[skill] : experienceArray};	

                    // allAudios.push(audio);
                   // formdata.append(audioName,blob_list[tr.rowIndex]);
                   // allQuestions.push(questionText);

                    // if(questionText.length != 0) 
                    // {
                    //     allQuestions.push(questionText);
                    //     isRowIncomplete = false;
                    // }
                    // else
                    // {
                    //     error = "Please enter both the question and its recording before clicking on Submit";
                    //     isRowIncomplete = true;
                    //     checkForErrors();
                    // };
                
                }
            //}
            else
            {
                error = "Please enter both the question and its recording before clicking on Submit";
                isRowIncomplete = true;
                checkForErrors();
            }
         }
         
    });
    
     if( !isRowIncomplete && isEmailExists && allQuestions.length>0) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			document.write(this.responseText);
		}
        xhr.open('POST', "https://127.0.0.1:5000/save",true);
        formdata.append('email', email);
		formdata.append("skill", selectedSkill);
		formdata.append("experience", levelOfExperience);
        //formdata.append("level of question", levelOfQuestion);
        formdata.append("questions code", skillcode+experienceCode+questionLevelCode);
		formdata.append("all questions", JSON.stringify(allQuestions));
		xhr.send(formdata);
	}
	else{
        isRowIncomplete ? ( error = "Please enter both the question and its recording before clicking on Submit") :
        (!isEmailExists ? error = "Please enter your email before submission" :
        (error ="Please enter atleast one question and its audio recording to submit"));
        checkForErrors();
	}
}
