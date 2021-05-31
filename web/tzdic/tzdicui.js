// Begin CONFIG ====================================================
// the dic URL 
const tzDicFolder = "tzdic/";
const tzDicEntryHTML = tzDicFolder+"tzdic.html";
const tzIframeCss = {
	width:"100%"
	, height:"100%"
};
// End CONFIG ======================================================

if (typeof $ === "undefined") {
	document.write('<script type="text/javascript" src="'+tzDicFolder+'tzlib/jquery.min.js">\x3C/script>');
}
if(!window.tzdicidx){
	document.write('<script type="text/javascript" src="'+tzDicFolder+'tzdata/tzdicidx.js">\x3C/script>');
}

function TZDicUI(){	
	let tzparam = {
		inputObj : null
		, outputObj : null
		, iframeObj : null
		, fnGetPhrases : null
		, fnGetHash : null
		, tzVer : ""
	};
	this.init = function(initparam){
		// read parameters
		if(initparam){
			Object.assign(tzparam, initparam);
			if(tzparam.outputObj && !tzparam.iframeObj){
				tzparam.iframeObj = $("<iframe>")
					.addClass("tzIFrame")
					.appendTo(tzparam.outputObj);
			}
		}
		if(tzIframeCss){
			tzparam.iframeObj.css(tzIframeCss);
		}
		if(!tzparam.fnGetHash){
			tzparam.fnGetHash = dftDicHash;
		}
		
		// events init
		tzparam.inputObj.on('input selectionchange propertychange keydown click focus', function(event) {
			tzUpdateEvent({event:event});
		});	
		
		$(document).on('mouseup', function(event) {
			tzUpdateEvent({event:event});
		});	
	};	
	
	window.tzUpdateEvent = function(dicParam){		
		if(tzparam.fnGetPhrases){
			let phrasesInfo = tzparam.fnGetPhrases(dicParam);
			if(!phrasesInfo.phrases){
				// not a valid query
				return;
			}
			Object.assign(dicParam, phrasesInfo);
		}
		UpdateDic(dicParam);
	}

	let tmrUpdateDic = null;
	function UpdateDic(dicparam){				
		if(tmrUpdateDic){
			clearTimeout(tmrUpdateDic);
			tmrUpdateDic = null;
		}		
		if(!dicparam){
			dicparam = {};
		}
		let {event, phrases, rawstr} = dicparam;
		tmrUpdateDic = setTimeout(function(){
			let qArray = [];
			let tmpq, id, hash, isChinese;

			if(!phrases && !rawstr){
				// get selected string from a textarea
				rawstr = GetSelectedString(tzparam.inputObj);				
			}
			if(rawstr){
				// query each words in the selected string
				let rawstrarr = splitx(rawstr);
				if(!phrases){
					phrases = [];
				}
				phrases = phrases.concat(rawstrarr);
				// add selected string as the first query phrase
				qArray.push(GetQuery({
					phrase : rawstr
				}));				
			}
			
			// get query parameters for ToneOZDic
			for(let idxPhrase in phrases){
				let phrase = phrases[idxPhrase];
				qArray.push(GetQuery({
					phrase : phrase
				}));
			}
			
			let dicURLParam = JSON.stringify(qArray);
			
			// do dictionary query
			let dicURLBase = tzDicEntryHTML + "?" 
				+ (tzparam.tzVer ? "v="+tzparam.tzVer+"&" : "");
			let URL = dicURLBase+"q="+dicURLParam;			
			if(tzparam.cssDicPath){
				URL += "&css=" + encodeURIComponent(tzparam.cssDicPath);
			}
			tzparam.iframeObj.attr("src", URL).show();
			tmrUpdateDic = null;
			console.log(URL);
		},200);
	};	
	
	function GetQuery(param){
		let {phrase} = param;
		
		let isChinese = true;
		if(phrase.length > 0){
			isChinese = chkChinese(phrase[0]);
		}				
		let hash = tzparam.fnGetHash({
			phrase : phrase
			,ischinese : isChinese
		})
		let id = tzdicidx[hash];

		let tmpq = {
			q:phrase
		}				
		if(id !== undefined){
			tmpq.id = id;				
		}	
		
		return tmpq;
	}
	
	function GetSelectedString(inputObj){
		let posStart = inputObj.prop("selectionStart");
		let posEnd = inputObj.prop("selectionEnd");
		let clength = posEnd-posStart;
		if(clength<1){
			clength = 1;
		}
		if(posStart == posEnd && posStart!=0){
			posStart--;
		}			
		let s = inputObj.val().substr(posStart, clength);
		return s;
	}
	
	/**
	* split an input string to a words array. 
	* e.g. "你們call out我ok?" => ["你","們","call","out","我","ok","?"]
	* @param {any} s : input string. Support mixed with Chinese and English
	* @return {array} words: output words array
	*/
	function splitx(s){		
		let splittedStr = [...s];
		let arrayLength = splittedStr.length;
		let words = [];
		let englishWord = "";
		let i;
		for (i = 0; i < arrayLength; i += 1) {
			if (/^[a-zA-Z]+$/.test(splittedStr[i])) {
				englishWord += splittedStr[i];
			} else if (/(\s)+$/.test(splittedStr[i])) {
				if (englishWord !== "") {
					words.push(englishWord);
					englishWord = "";
				}
			} else {
				if (englishWord !== "") {
					words.push(englishWord);
					englishWord = "";
				}
				words.push(splittedStr[i]);        
			}
		}

		if (englishWord !== "") {
			words.push(englishWord);
		}
		return words;
	}
	
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
}

