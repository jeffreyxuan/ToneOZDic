# ToneOZDic 澳聲通Web字典UI
Web Dictionary with only Frontend Javascript requied, free for commercial use. <br>
一個Javascript的網頁字典, 完全前端架構, 無需後端, 免費商用.

# By <a href="https://toneoz.com">ToneOZ.COM 拼音注音編輯器 澳聲通</a>
This project includes a Javascript Dictionary UI and a Google Script Dictionary Creator.<br>
本Project包含Javascript字典介面及Google Script字典檔生成器


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
https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html"
			
# Library dependencies
- jquery.min.js : jQuery
			
# Files description	
- ToneOZDic.gs : Google app script for Google spreadsheet

- tzdic.html : HTML UI for single dictionary query<br>
HTML介面, 負責單一查詢

- demo.html : HTML UI for end user to access the dictionary<br>
HTML介面, 一般使用者開啟此檔來使用字典

-tzdicui.js : Javascript for demo.html<br>
動態生成demo.html上面的查詢介面

			
# Usage Steps			
# Step 1
Download the original dictionary file from  the Ministry of Education website (https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html). We recommand to use the 「國語辭典簡編本」. click「資料下載」to download	
到「教育部國語辭典公眾授權網」下載Excel字典檔. 我們建議使用「國語辭典簡編本」, 點選「資料下載」
教育部國語辭典公眾授權網
https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html"
			
# Step 2
Import the original dictionary file into Google Spreadsheet, rename the sheet to "input"
將原始Excel字典檔匯入 Google Spreadsheet, 將資料表sheet 名稱改為 "input"	
			
# Step 3
Copy the ToneOZDic.gs into the Google Spreadsheet Script by <br>
匯入TZDicCreator.gs<br><br>

- In Google Spreadsheet, Select "Tools" -> "Script Editor"<br>
在 Google Spreadsheet, 點選 "Tools" -> "Script Editor"

- Rename the default script file "Code" to "TZDicCreator"<br>
將 default script file "Code" 改名為 "TZDicCreator"

- copy and paste the TZDicCreator.gs into it<br>
拷貝貼上整個 TZDicCreator.gs
			
# Step 4
Review and modify the CONFIG in begin of ToneOZDic.gs . Please refer the the comments inline<br>
依需要調整ToneOZDic.gs開頭的參數,請參照註解中的說明	
			
# Step 5
Create a folder "tzdic". Make sure the folder name is unique in your Google Drive.<br>
請在您的Google Drive中開一個新資料夾,取名為"tzdic". 請確保您的Google Drive中沒有其他同名的資料夾.	
			
# Step 6
Run the function "Step1()" in ToneOZDic.gs . Grant all permissions if the Google Script permission dialog popup<br>
執行ToneOZDic.gs中的函式 Step1() . 第一次執行時Google Script會跳出App權限授權提示, 我們需要存取sheet以及寫入file的權限, 請核准.	
			
# Step 7
Run the function "Step2()" in ToneOZDic.gs <br>
執行ToneOZDic.gs中的函式 Step2() . 	
			
# Step 8
Right click on the folder "tzdic" to select download<br>
在資料夾"tzdic"上面敲右鍵選擇下載	
			
# Step 9
Unzip the folder "tzdic" to the same folder with the file tzdic.html<br>
將下載後的zip解壓縮, 把資料夾"tzdic"放到與tzdic.html同一個資料夾	
			
# Step 10
Use any browser to open the tzdic.html to use the dictionary<br>
使用瀏覽器開啟tzdic.html來使用字典
