# MOVING FORTH formatted with vivliostyle

Forthに関する文書、https://www.bradrodriguez.com/papers/moving1.htm の私訳作成。

vivliostyleでPDF化しています。

# インストールとPDF生成

`git clone`で展開後、`package.json`が存在することを確認したうえで、初期化する。
```
npm install
cd themes/mytheme
npm install
npm run watch:scss
```
最後のコマンド実行後シェルプロンプトが帰ってこない。どうやらscssファイルを常時監視しているらしい。ためらうことなく`^C`でコマンドを止めてよい。

PDF生成は build コマンドを実行する。
```
npm run build
```
スタイルファイル変更するごとに`npm run watch:scss`すること。


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
`code`の`color`, `background`の白黒を逆転させている。

# vivliostyle のインストール(2022-10-31現在)

WSL環境でvivliostyleでPDFファイルを生成できるようにするまでを記す。

最初に、本リポジトリをクローンしておき、その中で作業する。
```
git clone https://githuc.com/tendai22/moving-forth-vivliostyle.git
cd moving-forth-vivliostyle
```


## 1. Node.jsのインストール

> [Node.js を Linux 用 Windows サブシステム (WSL2) にインストールする](https://learn.microsoft.com/ja-jp/windows/dev-environment/javascript/nodejs-on-wsl)に基づく

まず nvm をインストールする。
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```
> `command -v nvm`で確認できる

nvm から Node.js LTS version をインストールする。npm も同時にインストールされているはず。

```
nvm install --lts
```
> Node.jsのバージョンは`nvm ls`で確認できる

## 2. npm install する(2か所)

本ディレクトリと、`themes/mytheme`の下で`npm install`する

`themes/mytheme`の下で`npm run watch:scss`する。これで
`scss` に記述された設定が`css`ファイルに反映される。

## 3. 必要なライブラリをインストールする

この段階でPDFビルド`npm run build`たたけるが、`libatk-1.0がない`と言われて怒られる。必要そうなものを以下のコマンドで突っ込む
```
sudo apt install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
```

## 4. 日本語フォントをインストールする。

これでPDFビルドは動くが、日本語文字が空白状態のPDFファイルが生成される。日本語フォントをインストールしよう。
```
sudo apt install fonts-ipafont fonts-ipaexfont
```
これでPDFファイルがビルドできるようになった。

## 注: `Create book`との関係

[Vivliostyleチュートリアル](https://vivliostyle.org/ja/tutorials/create-publications/) にはCreate Bookを使うとある。このやり方に従うと、何もないところに Vivliostyle 書籍環境をつくる。

書籍ファイルを git clone して、そのうえで`Create Book`するのはコンフリクトを起こしそうな気がする、というか、空ディレクトリでないと`Create Book`できなさそう。

基本的には、`nvm`, `npm`, `nodejs`, 必要なライブラリ, 日本語フォントがすでに入っているWSL環境なら、クローンの後、`npm install`2箇所だけで`npm run build`が走るようになる、たぶん。
