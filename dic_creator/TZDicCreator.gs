// ToneOZ Dictionary Creator
// Usage	: https://github.com/jeffreyxuan/ToneOZDic
// Author 	: Jeffrey Xuan jeffreyx@gmail.com
// Website  : https://toneoz.com (Pinyin Zhuyin Graphical Editor)
// License	: MIT License. Free for both commercial and personal uses

// begin CONFIG 參數 /////////////////////////
const strVer = "20210607"; // Version Control
// specify the column order mapping to the 3 fields in ToneOZDic
// In ToneOZDic we have 3 fields : WORD, DESC1, DESC2
// e.g.: 國語辭典簡編本 has 4 columns : 0字詞名,1注音一式,2釋義,3多音參見訊息
// source : https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html
const MOE_COLUMN_WORD = 0;        // the column 0字詞名 maps to field WORD
const MOE_COLUMN_DESC1 = 1;       // the column 1注音一式 maps to field DESC1
const MOE_COLUMN_DESC2 = 2;       // the column 2釋義 maps to field DESC2
const MOE_COLUMN_DESC3 = 3;       // the column 3多音參見訊息 maps to field DESC3 (not in used)

// split each dic file size to be around 32KB = 32 x 1024 = 32768
const OUTPUT_PREFER_FILE_LENGTH = 32768;

// use how many characters in the prefix of a phrase to build the dictionary index
// Must be sync between the fn.fnDftDicHash() in Google Script "TZDicCreator.cs"
// and the TZDicUI()->fnDftDicHash() in tzdicui.js 
const HASH_INDEX_LENGTH = 4;

// final out folders for all ToneOZDic files. Make sure the folder name is unique in your Google Drive
const OUTPUT_FOLDERNAME = "tzdata";

const SKIP_TITLE_ROW_COUNT = 1;
const INPUT_SHEETNAME = "input";
const OUTPUT_SHEETNAME = "output";

// In step2, while we write dic files, sometimes it take too long to write to the Google Drive
// that will timeout the Google Script hard limit timeout threadshold = 5 mins. 
// In the case of timeout, you can only output partial files per run by changing the STEP2_FILE_START and STEP2_FILE_MAX
const STEP2_FILE_START = 1;
const STEP2_FILE_MAX = 0; // to write all the files, set STEP2_FILE_MAX = 0

// How many lines "max" are there in the original dictionary file (row number in the Sheet "input")? 
// Google Spreadsheet has a max cells limited to 5,000,000. We need at least 3 cells per line => max lines are 1666666
const MAX_INPUT_ROW_COUNT = 1666666;
// e.g.: 國語辭典簡編本 has 44712 lines in 2021-05-26
//const INPUT_ROW_COUNT = 44712;
// const INPUT_ROW_COUNT = 119862;

// There could be duplicated entries for the same phrase with different pronunciation
// e.g.: 限量(xiàn liáng) / 限量(xiàn liàng) 和( hé   hè   huò   huó   hú  )
const MAX_DUPLICATED_DIC_ENTRY = 10;

// remove the prefix (一)(二)... from desc1 and desc3 (zhuyin)
const DESC1_REMOVE_QUOTE_ORDER_PREFIX = true;

// remove "&9b51._104_0.gif; ◎ → △" from desc2
const DESC2_REMOVE_MOE_SYMBOL = true;
// end CONFIG /////////////////////////

/**
* Read data from the sheet "input". Assign a File ID to each input row
* Write data to the sheet "output"
* "input" example:
* 	和服	ㄏㄜˊ　ㄈㄨˊ	"日本的傳統服裝。長衣、前襟交疊，腰部綁以寬帶。 &9b51._104_0.gif;現在的日本人只有在較正式的傳統禮儀場合才穿著和服了。　◎"
* 	和樂	ㄏㄜˊ　ㄌㄜˋ	"安和快樂。&9b51._104_0.gif;本公司員工彼此和樂相處，情如一家人。"
* "output" example:
* 	238	龍頭	"龍頭":{"z":"ㄌㄨㄥˊ　ㄊㄡˊ","d":"1.像龍頭部形狀的。龍頭枴杖<br>2.借指領袖人物。龍頭老大<br>3.自來水管出水的控鈕。水龍頭"},	ㄌㄨㄥˊ　ㄊㄡˊ	1.像龍頭部形狀的。龍頭枴杖<br>2.借指領袖人物。龍頭老大<br>3.自來水管出水的控鈕。水龍頭
*/
function Step1(){
  doParseEdudic({
    inputsheetname:INPUT_SHEETNAME
    , maxInputRowCount:MAX_INPUT_ROW_COUNT
    , outputsheetname:OUTPUT_SHEETNAME
    , maxLengthPerFile:OUTPUT_PREFER_FILE_LENGTH
  });
  
  function doParseEdudic(param){
    const {inputsheetname
    , maxInputRowCount
    , outputsheetname
    , maxLengthPerFile} = param;
    // read query mandarin
    let InputSheet = SpreadsheetApp.getActive().getSheetByName(inputsheetname);  
    let InputRange = InputSheet.getRange("A1:D"+(maxInputRowCount));    
    let InputValues = InputRange.getValues();
    let OutputValues = [];
    let prevPhraseHash = "";
    let fileID = 1;
    let charCount = 0;
    let phraseDuplicateDic = {};
    let rowInFile = 0;
    let fileLength = 0;
    let outputcount = 0;
    let outputLineBuffer = [];
    //let hashLengthDic = {};
    let uniLengthDic = {};    
    let uniSortedArr = [];
    let tmpuniLengthDic, tmpuniSortedArr;
    for(let rowindex in InputValues){
      if(rowindex < SKIP_TITLE_ROW_COUNT){
        continue;
      }      
      let phrase = ""+InputValues[rowindex][MOE_COLUMN_WORD];
      if(!phrase){
        continue;
      }
      
      // build a hash to locate file of the phrase
      let phraseHash;
      let isChinese = fn.chkChinese(phrase[0]);
      phraseHash = fn.fnDftDicHash({
        phrase : phrase
        , ischinese : isChinese
      });
      
       
      let desc1 = ""+InputValues[rowindex][MOE_COLUMN_DESC1]; // zhuyin with (一)(二)....
      let desc2 = ""+InputValues[rowindex][MOE_COLUMN_DESC2];
      let desc3 = ""+InputValues[rowindex][MOE_COLUMN_DESC3]; // zhuyin with (一)(二)....
      
      rowInFile++;      
      
      // remove line break in phrase
      phrase = phrase.replaceAll("\n","");
      
      // remove the prefix (一)(二)... from zhuyin
      if(DESC1_REMOVE_QUOTE_ORDER_PREFIX){
        let posQuoteInZhuyin = desc1.indexOf(")");
        if(posQuoteInZhuyin >= 0){
          desc1 = desc1.trim().substr(posQuoteInZhuyin+1);
        }
        if(desc3){
          posQuoteInZhuyin = desc3.indexOf(")");
          if(posQuoteInZhuyin >= 0){
            desc3 = desc3.trim().substr(posQuoteInZhuyin+1);
          }
        }
      }
      
      // remove &9b51._104_0.gif;
      if(DESC2_REMOVE_MOE_SYMBOL){
        desc2 = fn.RemoveEDUDICGIF({
          input : desc2
        }).trim().replaceAll("\n","<br>");
        
        // remove ; ◎ → △
        desc2 = desc2.replaceAll(";","").replaceAll("◎","");    
      }
      
      // prevent duplicated entries. Up to 5 duplicated entries
      let phraseNoDuplicate = phrase;
      for(let idup=0; idup<MAX_DUPLICATED_DIC_ENTRY; idup++){
        if(phraseDuplicateDic[phraseNoDuplicate]){
          phraseNoDuplicate = phrase+(idup+1);
        } else {
          break;
        }
      }      
      phraseDuplicateDic[phraseNoDuplicate] = 1;
      
      // push to output
      let jsonDic = {
        z: desc1
        , d : desc2
      };        
      let jsonRow = "\""+phraseNoDuplicate + "\":" + JSON.stringify(jsonDic) + ",";
      let outputRowArray = ["" // leave the File ID blank, update it later
        , phrase, jsonRow, desc1, desc2, desc3];
      let jsonRowLength = fn.strByte(jsonRow);
      fileLength += jsonRowLength;
      
      // build hash unicode array in length HASH_INDEX_LENGTH
      tmpuniLengthDic = uniLengthDic;
      tmpuniSortedArr = uniSortedArr;
      for(let ip=0; ip<HASH_INDEX_LENGTH; ip++){        
        let code = 0;
        if(ip < phrase.length){
          code = fn.getUni32(phrase[ip]);
        }
        if(!tmpuniLengthDic[code]){
          tmpuniLengthDic[code] = {
            uniLengthDic : {} ,
            uniSortedArr : []
          };
          tmpuniSortedArr.push(code);          
        }
        if(ip == HASH_INDEX_LENGTH-1){
          if(!tmpuniLengthDic[code].length){
            tmpuniLengthDic[code].length = 0;
          }
          tmpuniLengthDic[code].length += jsonRowLength;
        }
        
        tmpuniSortedArr = tmpuniLengthDic[code].uniSortedArr;
        tmpuniLengthDic = tmpuniLengthDic[code].uniLengthDic;
      }
            
      outputLineBuffer.push({
        phraseHash:phraseHash
        , phrase: phrase
        , jsonRowLength : jsonRowLength
        , outputRowArray : outputRowArray
      });
      
      outputcount++;
    }
    
    // Assign File ID for each hash unicode array entry based on OUTPUT_PREFER_FILE_LENGTH
    fileID = 1;
    fileLength = 0;
    reBuildFileID({
      arr:uniSortedArr,
      dic:uniLengthDic,
      hashlevel:0,
      maxhashlevel:HASH_INDEX_LENGTH-1,
      maxLengthPerFile:maxLengthPerFile, 
      fileLength:fileLength,
      fileID:fileID
    });
    
    // Assign File ID for each row based on its hash unicode
    for(let lineCount=0 ; lineCount < outputLineBuffer.length; lineCount++){
      phrase = outputLineBuffer[lineCount].phrase;
      let newfileID;
      // get hash unicode
      let hashInfo = fn.fnDftDicHash({phrase:phrase});
      let outputRowArray = outputLineBuffer[lineCount].outputRowArray;

      let tmpSearchHashLengthDic = uniLengthDic;
      for(let hashlevel =0; hashlevel < HASH_INDEX_LENGTH; hashlevel++){
        let codedic = tmpSearchHashLengthDic[hashInfo.hashArr[hashlevel]];
        if(codedic){
          if(codedic.fileID){
            newfileID = codedic.fileID;
          }
          if(codedic.uniLengthDic){
            tmpSearchHashLengthDic = codedic.uniLengthDic;
          } else {
            break;
          }
        }
      }            

      // update File ID
      outputRowArray[0] = newfileID;
      OutputValues.push(outputRowArray);         
    }
    
    // final output
    try{
      let OutputSheet = SpreadsheetApp.getActive().getSheetByName(outputsheetname); 
      OutputSheet.deleteColumns(6,19);
      let OutputRange = OutputSheet.getRange("A1:F"+(outputcount));    
      OutputRange.setValues(OutputValues);
    } catch(e){
      throw new Error( "Please delete & create a blank \"output\" sheet. " + e );
    }
  }    
  
  /**
  * Asssign fileID to each unicode hash. Recursively called up to 4(HASH_INDEX_LENGTH) charaacters
  */
  function reBuildFileID(param){
    let {arr, dic,
    hashlevel,
    maxhashlevel,
    maxLengthPerFile, 
    fileLength, fileID,
    debugprefix
    } = param;
    
    if(!debugprefix){
      debugprefix = "";
    }
    
    // sort integer hash array
    arr.sort(function(a, b){return a - b});
    
    for(let ih=0; ih<arr.length; ih++){
      let unicode = arr[ih];
      let debugnextprefix = debugprefix + "" + unicode;
      
      if(hashlevel == maxhashlevel){
        let phraselength = dic[unicode].length; 
        if(fileLength+phraselength > maxLengthPerFile){
          fileID++;
          fileLength = phraselength;
        } else {
          fileLength += phraselength;
        }
        dic[unicode].fileID = fileID; 
      } else {
        let nextlevelhash = reBuildFileID({
          arr:dic[unicode].uniSortedArr,
          dic:dic[unicode].uniLengthDic,
          hashlevel:hashlevel+1,
          maxhashlevel:maxhashlevel,
          maxLengthPerFile:maxLengthPerFile, 
          fileLength:fileLength,
          fileID:fileID,
          debugprefix: debugnextprefix
        });
        fileLength = nextlevelhash.fileLength;
        fileID =  nextlevelhash.fileID;
      }      
    }   
    return{
      fileLength:fileLength,
      fileID:fileID
    };
  }  
}

/**
* Read data from the sheet "output".
* Write dictionary files to the folder "tzdata" based on the File ID assigned in Step1()
* Write the dictionary index file to the folder "tzdata"
* exampl output files:
* https://github.com/jeffreyxuan/ToneOZDic/tree/main/web/tzdic/tzdata
*/
function Step2(){
  doWriteToneOZDicFile(
    OUTPUT_SHEETNAME
    , MAX_INPUT_ROW_COUNT
    , OUTPUT_FOLDERNAME
  );    
  
  function doWriteToneOZDicFile(inputsheetname, maxInputRowCount, outputfoldername){
    var InputSheet = SpreadsheetApp.getActive().getSheetByName(inputsheetname);  
    var InputRange = InputSheet.getRange("A1:C"+(maxInputRowCount));    
    var InputValues = InputRange.getValues();
    
    let fileDic = {};
    let uniIndexDic = {};
    
    // folder
    let dir;
    try{
      dir = DriveApp.getFoldersByName(outputfoldername).next();
    } catch(e){
      throw new Error( "Please create a folder \""+OUTPUT_FOLDERNAME+"\" . " + e );
    }
    

    let fileContent = "";
    let filename = "";
    let fileID;
    let fileMax = 0;
    for(let rowindex in InputValues){
      fileID = InputValues[rowindex][0];
      if(fileID == "" 
        || fileID === undefined){
        continue;
      }
      fileID = parseInt(fileID);
      let phrase = ""+InputValues[rowindex][1];      
      
      fileContent = InputValues[rowindex][2];

      if(!fileDic[fileID]){
        fileDic[fileID] = "";
      }
      fileDic[fileID] += fileContent;
      if(fileID > fileMax){
        fileMax = fileID;
      }
      
      // update index file
      let hashInfo = fn.fnDftDicHash({phrase:phrase});
      if(!uniIndexDic[fileID]){
        uniIndexDic[fileID]={
          min:[null,null]
          , max : [null,null]
        }
      }
      // update index min max range
      if(uniIndexDic[fileID].max[0]==null 
        || uniIndexDic[fileID].max[0]<hashInfo.hashArr[0]
        || (uniIndexDic[fileID].max[0] == hashInfo.hashArr[0]
            && uniIndexDic[fileID].max[1] < hashInfo.hashArr[1])){
        uniIndexDic[fileID].max = hashInfo.hashArr;
      }
      if(uniIndexDic[fileID].min[0]==null 
        || uniIndexDic[fileID].min[0]>hashInfo.hashArr[0]
        || (uniIndexDic[fileID].min[0] == hashInfo.hashArr[0]
            && uniIndexDic[fileID].min[1] > hashInfo.hashArr[1])){
        uniIndexDic[fileID].min = hashInfo.hashArr;
      }
    }
    
    try{
      //output each file
      let uniIndexArr = [];
      for(fileID=1; fileID<=fileMax; fileID++){
        uniIndexArr.push(uniIndexDic[fileID].min);
        if((fileID >= STEP2_FILE_START)
            && (!STEP2_FILE_MAX || fileID <= STEP2_FILE_MAX)){
          filename = "" + fileID;
          fileContent = "";
          if(strVer){
            fileContent += "window.tzdic[\"ver" + filename +"\"] = \"" + strVer + "\";\n";
          }
          fileContent += "window.tzdic[\"" + filename +"\"] = {"
            + fileDic[fileID]
            + "}";
          fileContent = fileContent.replace(",};","};");
          let file = dir.createFile(filename + ".js", fileContent);
        }
      }
          
      // write index file
      if(!STEP2_FILE_MAX || STEP2_FILE_MAX >= fileMax ){
        let uniIndexArrJSON = JSON.stringify(uniIndexArr);      
        filename = "tzdicidx.js";
        fileContent = "";
        if(strVer){
          fileContent += "window.tzdicver = \"" + strVer + "\";\n";
        } 
        fileContent += "window.tzdicidx = " + uniIndexArrJSON + ";";
        file = dir.createFile(filename, fileContent);
      }
    } catch(e){
      throw new Error( "File Write in \""+OUTPUT_FOLDERNAME+"\" . " + e );
    }
  }  
}

let fn = {
  /**
  * Dictionary Index Hash function. 
  * Must be sync between 
  *     - the Step1()->fnDftDicHash() in Google Script "TZDicCreator.cs"
  *     - the TZDicUI()->fnDftDicHash() in tzdicui.js 
  * @param {any} phrase : input string to be hash
  * @return {array} hashArr: output an array for progressive hash
  * @return {any} hash: output single hash string
  */
  fnDftDicHash : function(param){
    let {phrase, hashlength=HASH_INDEX_LENGTH} = param;
    let hash = "";
    let hashArr = [];
    for(let ip=0; ip<=hashlength;ip++){
      let hashcode = 0;
      if(ip<phrase.length){
        hashcode = fn.getUni32(phrase[ip]);
      }
      hashArr.push(hashcode);
      hash += ("0000000000000000"+hashcode).slice (-16);
      if(ip >= hashlength-1){
        break;
      }
    }
    
    return{
      hash : hash
      , hashArr : hashArr
    };
  },
  
  /**
  * Convert UTF16 character to a 32bits intenger by Unicode
  * @param {any} c : input UTF16 character
  * @return {any} a 32bits intenger
  */
  getUni32 : function(c){
    let code1st = c.charCodeAt(0);
    let code2nd = c.charCodeAt(1);
    if(isNaN(code2nd)){
      code2nd = 0;
    }
    return code1st + (code2nd<<16);
  },
  
  /**
  * remove &9b51._104_0.gif;
  */
  RemoveEDUDICGIF : function(param){
    let {input, begin="&", end=".gif"} = param;    
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
  },
  
  chkChinese : function(str){
    const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
    return REGEX_CHINESE.test(str);
  },
  
  strByte : function(s) {
    return encodeURI(s).split(/%..|./).length - 1;    
  }    
};

String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};