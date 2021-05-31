# ToneOZDic 動態載入的前端中英字典
Frontend Chinese and English Dictionary framework. Support dynamic loading by splitting a big dictionary file into hundreds of small chunks, offline download mode available. free for commercial use. This project includes a Javascript Dictionary UI and a Google Script Dictionary Creator.<br>
完全前端架構的中英辭典框架, 提供切割工具將一個巨大的字典檔案分切成數百個小檔案, 付動態載入函式庫及範例, 可離線使用. 免費商用. 本專案包含Javascript字典介面及Google Script字典檔生成器.

![demoui](https://user-images.githubusercontent.com/14179988/119607032-00278200-be37-11eb-8474-f838e2c60280.JPG)

# Hightlight features 特色
- Pure frontend processing. No backend required.<br>
無需後端資料庫, 完全前端Javascript處理

- Optimized for low bandwidth usage. ToneOZDic gets data from a group of small Javascript JSON files, which are splitted from the original single big (>7MB) dictionary file. Each ToneOZDic file is around 50KB. Each online query only download a few required ToneOZDic files.<br>
傳輸量小, 使用時不用一次下載全部字典資料. ToneOZDic將一個巨大字典切割成數百個小檔案, 每個檔案僅數十KB, 線上使用時每次查詢時只會下載必要的檔案

- Support offline mode. Users can download all files to their PC and use any browser to open the ToneOZDic. Developers can also embed the ToneOZDic into any Apps <br>
可離線使用. 可將所有檔案全部下載後, 用任何瀏覽器開啟本機html使用, 也可內嵌到App應用.

- Open Source and Free for commercial use. MIT License.<br>
開源免費商用, (MIT授權條款)

# Google Script Dictionary Creator 字典檔生成器	
Convert the original dictionary file (Excel format) provided by the Ministry of Education (教育部) to ToneOZDic files (Javascript JSON format)<br>
將「教育部國語辭典公眾授權網」提供的字典檔(Excel表格格式), 轉換為ToneOZDic的字典檔(碎片化Javascript JSON格式)<br>
Source : 教育部國語辭典公眾授權網
https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html
			
# Library dependencies
- jquery.min.js : jQuery
			
# Files description	
- ToneOZDic.gs : Google app script for Google spreadsheet

- TZDicCreator_example.xlsx : example input for ToneOZDic.gs<br>
字典檔範例,格式與「國語辭典簡編本」相同

- tzdic.html : HTML UI for single dictionary query<br>
HTML介面, 負責單一查詢

- demo.html : HTML UI for end user to access the dictionary<br>
HTML介面, 一般使用者開啟此檔來使用字典

- tzdicui.js : Javascript for demo.html<br>
動態生成demo.html上面的查詢介面

			
# Usage Steps			
# Step 1.
Download the original dictionary file from  the Ministry of Education website (https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html). We recommand to use the 「國語辭典簡編本」. click「資料下載」to download	
到「教育部國語辭典公眾授權網」下載Excel字典檔. 我們建議使用「國語辭典簡編本」, 點選「資料下載」
教育部國語辭典公眾授權網
https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html
		
# Step 2.
Make sure there are at least 3 columns in the original dictionary file, and their contents are:<br>
請確認字典檔中至少有三個列, 這三個列的內容分別為:<br>
Word字詞, Desc1解釋一(注音), and Desc2解釋二<br>
<br>
Use the excel to sort all rows by the column "Word字詞"<br>
請利用Excel的排序功能, 以"Word字詞"這個列為基準, 對所有資料排序.<br>
<br>
P.S.: All data must be sorted.<br>
未排序的資料會造成查詢錯誤.
		
# Step 3.
Import the original dictionary file into Google Spreadsheet, rename the sheet to "input"
將原始Excel字典檔匯入 Google Spreadsheet, 將資料表sheet 名稱改為 "input"	
			
# Step 4.
Copy the ToneOZDic.gs into the Google Spreadsheet Script by <br>
匯入TZDicCreator.gs<br><br>

- In Google Spreadsheet, Select "Tools" -> "Script Editor"<br>
在 Google Spreadsheet, 點選 "Tools" -> "Script Editor"

- Rename the default script file "Code" to "TZDicCreator"<br>
將 default script file "Code" 改名為 "TZDicCreator"

- copy and paste the TZDicCreator.gs into it<br>
拷貝貼上整個 TZDicCreator.gs
			
# Step 5.
Review and modify the CONFIG in begin of ToneOZDic.gs . Please refer the the comments inline<br>
依需要調整ToneOZDic.gs開頭的參數,請參照註解中的說明	
			
# Step 6.
Create a folder "tzdic". Make sure the folder name is unique in your Google Drive.<br>
請在您的Google Drive中開一個新資料夾,取名為"tzdic". 請確保您的Google Drive中沒有其他同名的資料夾.	
			
# Step 7.
Run the function "Step1()" in ToneOZDic.gs . Grant all permissions if the Google Script permission dialog popup<br>
執行ToneOZDic.gs中的函式 Step1() . 第一次執行時Google Script會跳出App權限授權提示, 我們需要存取sheet以及寫入file的權限, 請核准.	
			
# Step 8.
Run the function "Step2()" in ToneOZDic.gs <br>
執行ToneOZDic.gs中的函式 Step2() . 	
			
# Step 9.
Right click on the folder "tzdic" to select download<br>
在資料夾"tzdic"上面敲右鍵選擇下載	
			
# Step 10.
Unzip the folder "tzdic" to the same folder with the file tzdic.html<br>
將下載後的zip解壓縮, 把資料夾"tzdic"放到與tzdic.html同一個資料夾	
			
# Step 11.
Use any browser to open the tzdic.html to use the dictionary<br>
使用瀏覽器開啟tzdic.html來使用字典

# Designed by <a href="https://toneoz.com">ToneOZ.COM 拼音注音編輯器 澳聲通</a>


