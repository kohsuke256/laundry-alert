# 洗濯アラート

## 概要
雨が降り出しそうなタイミングで、LINE・メールに通知を送るシステム。  
また、雨が止んだタイミングもお知らせする。

## 使用API等
- [LINE Notify](https://notify-bot.line.me/ja/)
- [Google Apps Script (GAS)](https://workspace.google.co.jp/intl/ja/products/apps-script/)，[Google スプレッドシート](https://www.google.com/intl/ja_jp/sheets/about/)等各種 Google サービス
- [YOLP 気象情報API (Yahoo!)](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/weather.html)
- [Weather (Rakuten Rapid API)](https://api.rakuten.net/weatherbit/api/weather/endpoints)

## 実装方法
YOLP 気象情報API を利用し、雨雲の発生を検知したとき、  
YOLP 気象情報API，Weather API を併用し、雨が止んだ時に、  
LINE Notify，Eメール を利用し、家族に通知を送るプログラムを、  
GAS を利用して実装・10分おきに実行。
データは Google スプレッドシート に保存。

## 注意事項
参考までに、作成したプログラムをアップロードしていますが、  
本プログラム利用に関するいかなる問題の発生においても、  
責任を負いません。ご了承ください。

## 利用方法
Google ドライブにて Google スプレッドシート を新規作成。  
シート名を*Main*に変更。  
ID (URL末尾の"*edit#gid=0*"などを除く数十文字の文字列 例:docs\.google\.com/spreadsheets/d/**{ID}**/edit#gid=0)を確認。  
Data.tsv の形式に倣い、  
セルB1に LINE Notify のアクセストークン  
セルB2に 東経、セルB3に 北緯 (天気取得地点)  
セルB4に [Yahoo! アプリケーションID](https://developer.yahoo.co.jp/)  
セルB5に TRUE  
セルB6に 稼働してほしいときに真を返す関数、あるいは常にTRUE(真)  
セルB7に Weather API key  
セルB8に weatherbit-v1-mashape.p.rapidapi.com
セルB9に 送りたいメールアドレス(csv形式)
をそれぞれ取得し、記入。  
Google ドライブにて Google Apps Script を新規作成。  
Main.js の内容を複製し保存。ただし、一行目、二重引用符内を確認したIDに書き換え、保存。  
保存したスクリプトに、
関数 *main* を *10分おき* に実行するトリガーを作成。  

## メッセージ例
### 例1
>\[{トークン名}]  2021/08/01 12:00  
> 0  
> 0  
>█▏ 0.95  
>█████▊ 4.63  
> 0  
>██▏ 1.75  
>▒▒▒▒▒▒▒▒ 6.25  
> 0  
> 0  
> 0  
> 0  
> 0  
> 0  
### 説明1
2021/08/01 12:00 → 予報時刻  
0  
0  
█▏ 0.95  
:  
0  
→ 五分ごとの降水量予報及び棒グラフ(環境依存文字使用)。
### 例2
[{トークン名}]  2021/08/01 12:00  
>向こう一時間、降水はない模様です  
>0 %  
>15 %  
>15 %  
### 説明1
2021/08/01 12:00 → 予報時刻  
0 %  
5 %  
10 %  
→ 一時間ごとの降水確率。
