# ToneOZ Dictionary 動態載入的前端中英字典
ToneOZDic is a Chinese and English Dictionary frontend framework. 
Support dynamic loading by splitting a big dictionary file into hundreds of small chunks. 
Offline download mode is available. 
Free for commercial use. 
This project includes a Javascript Dictionary UI and a Google Script Dictionary Creator.<p>
澳聲通字典 是一個可動態載入的完全前端架構中英字典框架, 
提供切割工具將一個巨大的字典檔案分切成數百個小檔案, 能使用最少頻寬提供動態載入, 也可離線使用。 
免費商用(MIT開源授權)。
本專案包含Javascript字典介面及Google Script字典檔生成器。

## Demo

* https://buttaiwan.github.io/bpmfvs/
	
	Mandarin Chinese Dictionary with Zhuyin IVS Fonts 
	
	國語注音字典 整合 字嗨IVS注音字型輸入工具
	
* https://buttaiwan.github.io/taigivs/
	
	Taiwanese Hokkien Dictionary with Taiwan Minnanyu Luomazi Pinyin IVS Fonts
	
	台羅字典 整合  字咍台語IVS字型輸入工具
	
## Designed by <a href="https://toneoz.com">Graphical Pinyin Editor ToneOZ 拼音注音編輯器 澳聲通</a>
	
![toneozdic_20210601-1](https://user-images.githubusercontent.com/14179988/120260354-14f19300-c2d9-11eb-8906-4e511b62aff6.jpg)

## Hightlight features 特色
- Pure frontend processing. No backend required.<p>
無需後端資料庫, 完全前端Javascript處理

- Optimized for low bandwidth usage. ToneOZDic gets data from a group of small Javascript JSON files, which are splitted from the original single big (>7MB) dictionary file. Each ToneOZDic file is around 50KB. Each online query only download a few required ToneOZDic files.<p>
傳輸量小, 使用時不用一次下載全部字典資料. ToneOZDic將一個巨大字典切割成數百個小檔案, 每個檔案僅數十KB, 線上使用時每次查詢時只會下載必要的檔案

- Support offline mode. Users can download all files to their PC and use any browser to open the ToneOZDic. Developers can also embed the ToneOZDic into any Apps <p>
可離線使用。可將所有檔案全部下載後，用任何瀏覽器開啟本機html使用, 也可內嵌到App應用。
	
- Support multiple phrases and words in a single query.
可在單次查詢中包含多個詞與字。例如：在一個查詢頁面中同時列出三個詞的解釋：「和平」，「和」，及「平」。

- Open Source and Free for commercial use. MIT License.<p>
開源免費商用, (MIT授權條款)
			
## Library dependencies
- jquery.min.js : jQuery
			
## Files description	
- dic_creator/ToneOZDic.gs : Google app script for Google spreadsheet

- dic_creator/TZDicCreator_example.xlsx : example input for ToneOZDic.gs<p>
字典檔範例,格式與「國語辭典簡編本」相同

- tzdata/ : All dictionary files
字典檔存放資料夾

- web/demo.html : HTML UI for end user to access the dictionary<p>
HTML介面, 一般使用者開啟此檔來使用字典

- tzdic/tzdicui.js : Main ToneOZDic Javascript for demo.html<p>
動態生成demo.html上面的查詢介面

- tzdic/tzdic.html : 
- tzdic/tzlib/tzdicentry.js : HTML UI for single dictionary query<p>
HTML介面, 負責單一查詢

## How to install 如何安裝
Include the Main ToneOZDic Javascript in your page<br>

	<script src="tzdic/tzdicui.js" charset="utf-8" /></script>

Init the ToneOZDic on document ready

	$(document).ready(function () {	
		// Init ToneOZDic
		let tzDicUI = new TZDicUI();
		let tzDicObjs = tzDicUI.init();
		
		// Set results display position
		tzDicObjs.objOutput.css({
			position:"fixed"
			, top: "10px"
			, right: "10px"
			, width: "45%"
			, height: "90%"
			, "background-color" :"#000"
		});
	});

## Usage Quick Guide 快速使用說明
- Query any selected text 查詢任何滑鼠選取的文字
	
- Use your mouse to select any string on your webpage. 
The dictionary query result will be displayed at the right.<p>
用滑鼠選取網頁上的任意字串, 字典查詢結果會顯示在右方。<p>

- In an editable input, click or select anything to query the character or the string from the cursor<p>
點選可輸入的區域時, 會自動查詢游標所在的文字, 也支援選取查詢。<br>

- The default demo dictionary file contains only few words. Please refer to the Google Script Dictionary Creator Usage to get a complete dictionay file.<p>
本專案隨付的示範字典檔僅包含"宣聲和樂"四個字. 請參考以下的 字典檔製作說明 來獲取完整字典。

## Google Script Dictionary Creator 字典檔生成器	
Convert the original dictionary file (Excel format) provided by the Ministry of Education (教育部) to ToneOZDic files (Javascript JSON format)<p>
將「教育部國語辭典公眾授權網」提供的字典檔(Excel表格格式), 轉換為ToneOZDic的字典檔(碎片化Javascript JSON格式)<br>
Source : 教育部國語辭典公眾授權網
https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html

			
# Usage : Dictionary File Creator TZDicCreator.gs 字典檔生成器使用說明
## Step 1.
Download the original dictionary file from  the Ministry of Education website (https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html). We recommand to use the 「國語辭典簡編本」. click the 「資料下載」 to download<p>
到「教育部國語辭典公眾授權網」下載Excel字典檔. 我們建議使用「國語辭典簡編本」, 點選「資料下載」
教育部國語辭典公眾授權網
https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html
		
## Step 2.
Make sure there are at least 3 columns in the original dictionary file, and their contents are:<br>
請確認字典檔中至少有三個列, 這三個列的內容分別為:<br>
- Word字詞
- Desc1解釋一(注音)
- Desc2解釋二

Example:<p>
![toneozdic_20210601-2](https://user-images.githubusercontent.com/14179988/120260736-cee8ff00-c2d9-11eb-9aa5-8f7e86ccbc7f.jpg)
	
	和服	ㄏㄜˊ　ㄈㄨˊ	"日本的傳統服裝。長衣、前襟交疊，腰部綁以寬帶。 &9b51._104_0.gif;現在的日本人只有在較正式的傳統禮儀場合才穿著和服了。　◎"<p>
	和樂	ㄏㄜˊ　ㄌㄜˋ	"安和快樂。&9b51._104_0.gif;本公司員工彼此和樂相處，情如一家人。"<p>
		
## Step 3.
Import the original dictionary file into Google Spreadsheet, rename the sheet to "input"<p>
將原始Excel字典檔匯入 Google Spreadsheet, 將資料表sheet 名稱改為 "input"

![toneozdic_20210601-3](https://user-images.githubusercontent.com/14179988/120261057-79f9b880-c2da-11eb-92bc-630ad1aaaaf9.jpg)
		
## Step 4.
Copy and pasted the dic_creator/TZDicCreator.gs into the Google Spreadsheet Script by <p>
將本專案中的 dic_creator/TZDicCreator.gs 拷貝貼上到 Script Editor
	
- In Google Spreadsheet, Select "Tools" -> "Script Editor"<p>
在 Google Spreadsheet, 點選 "Tools" -> "Script Editor"

![toneozdic_20210601-4](https://user-images.githubusercontent.com/14179988/120261220-c9d87f80-c2da-11eb-9124-a05048a3377f.jpg)
	
- Rename the default script file "Code" to "TZDicCreator"<p>
將 default script file "Code" 改名為 "TZDicCreator"

- copy and paste the TZDicCreator.gs into it<p>
拷貝貼上整個 TZDicCreator.gs
	
![toneozdic_20210601-5](https://user-images.githubusercontent.com/14179988/120261469-51be8980-c2db-11eb-88af-d565319215a4.jpg)
	
## Step 5.
Review and modify the CONFIG in begin of ToneOZDic.gs . Please refer the the comments inline<p>
依需要調整ToneOZDic.gs開頭的參數,請參照註解中的說明. e.g.: 建議調整這些參數:

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
	
## Step 6.
In the Google Spreadsheet, create a blank sheet, rename it to "output". Then run the function "Step1()" in ToneOZDic.gs . 
在Google Spreadsheet中開一個新的資料表sheet 名稱改為 "output". 
執行ToneOZDic.gs中的函式 Step1(). 

![toneozdic_20210601-7](https://user-images.githubusercontent.com/14179988/120261895-33a55900-c2dc-11eb-96b8-4f84e31d780d.jpg)

In the first run, please grant all permissions if the Google Script permission dialog popup.<p>
第一次執行時Google Script會跳出App權限授權提示, 我們需要存取sheet以及寫入file的權限, 請核准.	
![toneozdic_20210601-10](https://user-images.githubusercontent.com/14179988/120263192-8a139700-c2de-11eb-94e6-3d13ba91499a.jpg)
![toneozdic_20210601-11](https://user-images.githubusercontent.com/14179988/120263202-8d0e8780-c2de-11eb-8e4a-21a98bcdb4a3.jpg)
![toneozdic_20210601-12](https://user-images.githubusercontent.com/14179988/120263205-8f70e180-c2de-11eb-8f5d-106ee7eec7fe.jpg)
![toneozdic_20210601-13](https://user-images.githubusercontent.com/14179988/120263211-913aa500-c2de-11eb-8710-7530e46331d9.jpg)
	
			
## Step 7.
Create a folder "tzdata". Make sure the folder name is unique in your Google Drive. Please delete this "tzdata" folder and create a new one each time before you run the function "Step2()" in the next step.<p>
請在您的Google Drive中開一個新資料夾,取名為"tzdata". 請確保您的Google Drive中沒有其他同名的資料夾. 建議 : 每次執行以下提到的函式 Step2() 之前, 手動將舊的tzdata資料夾刪除後再重新開一個空的tzdata資料夾。

![toneozdic_20210601-6](https://user-images.githubusercontent.com/14179988/120261686-c09be280-c2db-11eb-9284-c7acb71f6710.jpg)

## Step 8.
Run the function "Step2()" in ToneOZDic.gs <p>
執行ToneOZDic.gs中的函式 Step2() . 	
			
## Step 9.
Right click on the folder "tzdata" to select download<p>
在資料夾"tzdata"上面敲右鍵選擇下載	

![toneozdic_20210601-8](https://user-images.githubusercontent.com/14179988/120262257-cd6d0600-c2dc-11eb-8508-8afb6c1220f7.jpg)
			
## Step 10.
Unzip the folder "tzdata" to the same folder (tzdic/) with the file tzdic/tzdic.html<p>
將下載後的zip解壓縮, 把資料夾"tzdata"放到與tzdic/tzdic.html同一個資料夾 (tzdic/)

![toneozdic_20210601-9](https://user-images.githubusercontent.com/14179988/120262381-f7262d00-c2dc-11eb-8788-4164dabedb32.jpg)
	
## Step 11.
Use any browser to open the demo.html to use the dictionary<p>
使用瀏覽器開啟demo.html來使用字典



