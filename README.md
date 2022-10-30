# MOVING FORTH formatted with vivliostyle

Forthに関する文書、https://www.bradrodriguez.com/papers/moving1.htm の私訳作成。

vivliostyleでPDF化しています。

# インストールとPDF生成

`git clone`で展開後、`package.json`が存在することを確認したうえで、初期化する。
```
npm install
```

PDF生成は build コマンドを実行する。
```
npm run build
```

# カスタマイズ

`vivliostyle.config.js`を書き換える。

* ソースコード: *.md ファイルを指定する。
* title, author, size(ページサイズ, A4, JIS-B5など)
* 作業フォルダ(workspaceDir)
* 書式: thema-techbookをカスタマイズしてthemes/mythemeに置いている。

# 書式

`themes/mytheme`下で`npm run watch:scss`する。最初に`npm install`することになるだろう。
```
cd themes/mytheme
npm install
(scss/*.scssを編集)
npm run watch:scss
```
`code`の`color`, `background``の白黒を逆転させている。
