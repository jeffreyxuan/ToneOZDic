// begin CONFIG 參數 /////////////////////////
// How many lines are there in the original dictionary file?
// e.g.: 國語辭典簡編本 has 44712 lines in 2021-05-26
const INPUT_ROW_COUNT = 44712;

// specify the column order mapping to the 3 fields in ToneOZDic
// In ToneOZDic we have 3 fields : WORD, DESC1, DESC2
// e.g.: 國語辭典簡編本 has 4 columns : 0字詞名,1注音一式,2釋義,3多音參見訊息
const INPUT_COLUMN_WORD = 0; // the column 0字詞名 maps to field WORD
const INPUT_COLUMN_DESC1 = 1; // the column 1注音一式 maps to field DESC1
const INPUT_COLUMN_DESC2 = 2; // the column 2釋義 maps to field DESC2

// max 25 chars in each ToneOZDic file
const OUTPUT_MAX_CHAR_PER_FILE = 25; 

// switch to a new file in the next char if we already have > 200 lines in this file
const OUTPUT_PREFER_LINE_COUNT_PER_FILE = 200; 

// final out folders for all ToneOZDic files. Make sure the folder name is unique in your Google Drive
const OUTPUT_FOLDERNAME = "tzdata";

const SKIP_TITLE_ROW_COUNT = 1;
const INPUT_SHEETNAME = "input";
const OUTPUT_SHEETNAME = "output";
// end CONFIG /////////////////////////


function Step1(){
  doParseEdudic(
    INPUT_SHEETNAME,INPUT_ROW_COUNT
    , OUTPUT_SHEETNAME
    , OUTPUT_MAX_CHAR_PER_FILE  
    , OUTPUT_PREFER_LINE_COUNT_PER_FILE 
  );
  
  function chkChinese(str){
    const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
    return REGEX_CHINESE.test(str);
  }
  
  /**
	* Dictionary Index Hash function. 
	* Must be sync between the Step1()->dftDicHash() in Google Script "TZDicCreator.cs"
    * and the TZDicUI()->dftDicHash() in tzdicui.js 
	*/
  function dftDicHash(param){
    let {phrase, ischinese = false} = param;
    let hash = phrase;
    if(!ischinese && phrase.length > 1){
      hash = phrase[0]+phrase[1];
    } else if (phrase.length >= 1){
      hash = phrase[0];
    }
    return hash;
  }
  
  function doParseEdudic(inputsheetname, rowcount, outputsheetname, charPerFile, maxRowPerFile){
    // read query mandarin
    let InputSheet = SpreadsheetApp.getActive().getSheetByName(inputsheetname);  
    let InputRange = InputSheet.getRange("A1:D"+(rowcount));    
    let InputValues = InputRange.getValues();
    let OutputValues = [];
    let prevPhraseHash = "";
    let filecount = 1;
    let charCount = 0;
    let phraseDuplicateDic = {};
    let rowInFile = 0;
    let outputcount = 0;
    for(let rowindex in InputValues){
      if(rowindex < SKIP_TITLE_ROW_COUNT){
        continue;
      }
      let phrase = InputValues[rowindex][INPUT_COLUMN_WORD];
      if(!phrase){
        continue;
      }
      // build a hash to locate file of the phrase
      let phraseHash;
      let isChinese = chkChinese(phrase[0]);
      phraseHash = dftDicHash({
        phrase : phrase
        , ischinese : isChinese
      });
       
      let desc1 = InputValues[rowindex][INPUT_COLUMN_DESC1]; // zhuyin with (一)(二)....
      let desc2 = InputValues[rowindex][INPUT_COLUMN_DESC2];
      
      // control file index
      if(prevPhraseHash == phraseHash){
        phraseHash = "";
      } else {
        prevPhraseHash = phraseHash;
        charCount++;
        // put all phrases with the same char0 in the same file
        if(charCount > charPerFile
          || rowInFile >= maxRowPerFile){
          charCount = 0;      
          rowInFile = 0;
          filecount ++;
        }      
      }    
      rowInFile++;
      
      // remove line break in phrase
      phrase = phrase.replaceAll("\n","");
      
      // remove the prefix (一)(二)... from zhuyin
      let posQuoteInZhuyin = desc1.indexOf(")");
      if(posQuoteInZhuyin >= 0){
        desc1 = desc1.trim().substr(posQuoteInZhuyin+1);
      }
      
      // remove &9b51._104_0.gif;
      desc2 = RemoveEDUDICGIF({
        input : desc2
      }).trim().replaceAll("\n","<br>");
      
      // remove ; ◎ → △
      desc2 = desc2.replaceAll(";","").replaceAll("◎","");    
      
      // prevent duplicated entries
      let phraseNoDuplicate = phrase;
      if(phraseDuplicateDic[phraseNoDuplicate]){
        phraseNoDuplicate = phrase+"1";
        if(phraseDuplicateDic[phraseNoDuplicate]){
          phraseNoDuplicate = phrase+"2";
          if(phraseDuplicateDic[phraseNoDuplicate]){
            phraseNoDuplicate = phrase+"3";
            if(phraseDuplicateDic[phraseNoDuplicate]){
              phraseNoDuplicate = phrase+"4";
            }
          }
        }
      }
      phraseDuplicateDic[phraseNoDuplicate] = 1;
      
      // push to output
      let jsonDic = {
        z: desc1
        , d : desc2
      };        
      let jsonRow = "\""+phraseNoDuplicate + "\":" + JSON.stringify(jsonDic) + ",";
      let outputRowArray = [filecount, phraseHash, jsonRow,phrase, desc1, desc2];
      OutputValues.push(outputRowArray);
      outputcount++;
    }
    
    // final output
    let OutputSheet = SpreadsheetApp.getActive().getSheetByName(outputsheetname);  
    let OutputRange = OutputSheet.getRange("A1:F"+(outputcount));    
    OutputRange.setValues(OutputValues);
  }

  function RemoveEDUDICGIF(param){
    let {input, begin="&", end=".gif"} = param;
    // remove &9b51._104_0.gif;
    let output = "";
    let inputRight = input;
    let beginLength = begin.length;
    let endLength = end.length;
    for(let itry=0; itry<20; itry++){
      // search begin
      let posEnd = 0;
      let posBegin = inputRight.indexOf(begin);
      if(posBegin<0){
        output += inputRight;
        break;
      } else {
        output += inputRight.substr(0, posBegin);
        inputRight = inputRight.substr(posBegin+beginLength);
        // search end
        posEnd = inputRight.indexOf(end);
        if(posEnd<0){
          output += inputRight;
          break;
        } else {
          inputRight = inputRight.substr(posEnd+endLength);
        }
      }
    }
    return output;
  }
}

function Step2(){
  doWriteToneOZDicFile(
    OUTPUT_SHEETNAME
    , INPUT_ROW_COUNT
    , OUTPUT_FOLDERNAME
  );
  
  function doWriteToneOZDicFile(inputsheetname, rowcount, outputfoldername){
    var InputSheet = SpreadsheetApp.getActive().getSheetByName(inputsheetname);  
    var InputRange = InputSheet.getRange("A1:C"+(rowcount));    
    var InputValues = InputRange.getValues();
    
    let charIndexDic = {}; //記錄哪個字放在哪個檔案
    
    // folder
    let dir = DriveApp.getFoldersByName(outputfoldername).next();
    
    let filecount = 0;
    let fileContent = "";
    let filename = "";
    for(let rowindex in InputValues){
      let fileOrder = InputValues[rowindex][0];
      if(fileOrder == "" || fileOrder === undefined){
        continue;
      }
      let rowChar = InputValues[rowindex][1];
      
      if(fileOrder != filecount){      
        
        if(filecount!=0){
          // do output
          fileContent += "}";
          fileContent = fileContent.replace(",}","}");
          filename = ""+filecount;
          let file = dir.createFile(filename + ".js", fileContent);
          fileContent = "";
        }
        filecount ++;
        filename = ""+filecount;
        fileContent = "window.tzdic[\"" + filename +"\"] = {";
      }
      charIndexDic[rowChar] = filecount;
      fileContent += InputValues[rowindex][2];
      
    }
    
    // output last file    
    fileContent += "};";
    fileContent = fileContent.replace(",};","};");
    filename = ""+filecount;
    let file = dir.createFile(filename+ ".js", fileContent);
    fileContent = "";
    
    // write index file
    let charIndexDicJson = JSON.stringify(charIndexDic);
    filename = "tzdicidx.js";
    fileContent += "window.tzdicidx = " + charIndexDicJson + ";";
    file = dir.createFile(filename, fileContent);
  }  
}

String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};