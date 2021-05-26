// Begin CONFIG======
// the dic URL 
const tzDicEntryHTML = "tzdic.html";
// End CONFIG======
function TZDicUI(){				
	this.init = function(){
		// events init
		$("body").on('input selectionchange propertychange keydown click focus', ".tzTextarea", function() {
			UpdateDic();
		});	
		$(document).on('mouseup', function() {
			UpdateDic();
		});	
	};	

	let tmrUpdateDic = null;
	function UpdateDic(){		
		if(tmrUpdateDic){
			clearTimeout(tmrUpdateDic);
			tmrUpdateDic = null;
		}		
		tmrUpdateDic = setTimeout(function(){
			// get selected string
			let posStart = $('.tzTextarea').prop("selectionStart");
			let posEnd = $('.tzTextarea').prop("selectionEnd");
			let clength = posEnd-posStart;
			if(clength<1){
				clength = 1;
			}
			if(posStart == posEnd && posStart!=0){
				posStart--;
			}
			let s = $('.tzTextarea').val().substr(posStart, clength);
			// get query parameters for ToneOZDic
			let carray = splitx(s);
			let qArray = [];
			let tmpq, id;
			for(let i in carray){
				let c = carray[i];	
				let isChinese = true;
				if(c.length > 0){
					isChinese = chkChinese(c[0]);
				}				
				let hash = c;
				if(!isChinese && c.length > 1){
					hash = c[0]+c[1];
				}
				id = tzdicidx[hash];
				if(i == 0 && (clength > 1 && c.trim() == s[0])){
					tmpq = {
						q:s
					}
					if(id !== undefined){
						tmpq.id = id;				
					}	
					qArray.push(tmpq);				
				}
				tmpq = {
					q:c
				}				
				if(id !== undefined){
					tmpq.id = id;				
				}	
				qArray.push(tmpq);				
			}
			let dicURLParam = JSON.stringify(qArray);
			
			// do dictionary query
			let dicURLBase = tzDicEntryHTML + '?q=';			
			let URL = dicURLBase+dicURLParam;
			console.log(URL);
			$(".tzIFrame").attr("src", URL).show();
			tmrUpdateDic = null;
		},200);
	};	
	
	
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
}

