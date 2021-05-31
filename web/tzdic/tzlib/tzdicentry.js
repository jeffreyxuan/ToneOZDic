// BEGIN CONFIG /////////
const defaultDataFolder = "./tzdata/";
// END CONFIG /////////
let tzQuery, tzQueryArray, tzCss;
let winSearch = window.location.search;
if(!window.tzdic){
	window.tzdic = {};
}
if(winSearch){
	const urlParams = new URLSearchParams(winSearch);
	tzQuery = urlParams.get("q");	
	tzCss = urlParams.get("css");	
	tzQueryArray = JSON.parse(tzQuery);	
	if(tzCss){
		document.write('<link rel="stylesheet" href="'+tzCss+'" />');
	}
	if(tzQueryArray){
		for(let qIdx in tzQueryArray){
			if(tzQueryArray[qIdx].id){
				document.write('<script type="text/javascript" src="' 
				+ defaultDataFolder
				+ (""+tzQueryArray[qIdx].id)+'.js">\x3C/script>');
			}
		}			
	}	
}

let poyinMaxCount = 6;
$(document).ready(function () {
	let outputDom = $("<div>").appendTo("body");
	if(tzdic){
		for(let qIdx in tzQueryArray){
			let item = tzQueryArray[qIdx];
			let dicSlot = null;
			if(item.id){
				dicSlot = ""+item.id;
			}
			if(item.q){					
				let unsortPoyinArray = [];
				for(let pi = 0; pi < poyinMaxCount; pi++){
					// lookup each poyin option
					let posfix = "";
					let result=null,resultDom, qDom, zDom, dDom;
					if(pi>0){
						posfix = pi;
					}
					if(item.q){	
						if(tzdic[dicSlot]){
							result = tzdic[dicSlot][item.q+posfix];
						}
						if(result || pi==0){
							qDom = $("<div class='dicq'>").html(item.q); // phrase
							resultDom = $("<div class='diccard'>")
								.append(qDom)
								.appendTo(outputDom);
						}
						if(result){
							zDom = $("<div class='dicz'>").html(result.z); // zhuyin
							dDom = $("<div class='dicd'>").html(result.d); // desc						
							resultDom
								.append(zDom)
								.append(dDom);
						}
					}
				}
			}
		}	
	}
	parent.postMessage("ready " + tzQuery, "*");
});