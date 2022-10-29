# Part 5: The Z80 Primitives

> This article first appeared in The Computer Journal #67 (May/June 1994).

# THE CODE I PROMISED

ついに、ANSI準拠のForthであるCamelForth[1]の完全なソースコードを発表する準備が整いました。知的な訓練として、そして明確な著作権を保証するために、私はこのコードを完全にゼロから書きました。(もちろん、私の様々なForthsの経験が、設計上の決定に影響を与えたことは間違いありません。

スペースの関係で、ソースコードは4回に分けて紹介します(待ちきれない方は、GEnieで完全なファイルを公開します)。

1. Z80 Forth "プリミティブ"、アセンブラソースにて
2. 8051 Forth "primitives"、同じく
3. Z80/8051 高レベルカーネル、同様に
4. 完全な6809カーネル(メタコンパイラソース)

CamelForthについて、私はパブリックドメインのツールだけを使うようにしました。Z80はCP/MのZ80MRアセンブラ[3]、8051はIBM PCのA51クロスアセンブラ[4]、6809はF83のメタコンパイラでCP/M、IBM PC、Atari STで使用しています。

"カーネル"とは、コンパイラとインタプリタを含む基本的なForthシステムを構成するワードの集合(word set)を意味します。CamelForthでは、これはANS Forth Coreワードセットと、Coreワードセットを実装するために必要な非ANSIワードです。Forthカーネルは通常、一部は機械語(コードワード)で書かれ、一部は高レベルForthで書かれています。機械語で書かれたワードは"プリミティブ"と呼ばれています。最終的にはこれらのワードだけでForthシステム全体が定義されるからです。

まさに、どのワードを機械語コードで書くべきなのか? 最適なプリミティブのセットを選択することは、興味深い議論です。プリミティブの数が少なければ、移植は容易ですが、性能は落ちます。移植を容易にするために設計されたeForth [2]では、もっと余裕のある31個のプリミティブが用意されていました。私のルールはこうです。

1. 基本的な算術演算子、論理演算子、記憶演算子はコードにします。
2. あるワードが他のForthのワードで簡単または効率的に書けない(あるいは全く書けない)場合、それはコードであるべきです(例えば、U<、RSHIFT)。
3. 単純なワードが頻繁に使われる場合、コードにする価値があるかもしれません(例：NIP、TUCK)。
4. コードで書くと必要なバイト数が少なくなるワードはそうする(Charles Curleyから学んだルール)。
5. ワードの機能をサポートする命令がプロセッサにある場合は、コードで記述する(例：Z80や8086のCMOVEやSCAN)。
6. スタック上で多くのパラメータを扱うが、比較的単純なロジックのワードは、パラメータをレジスタに保持できるコードに置いた方が良い場合がある。
7. ロジックや制御の流れが複雑なワードは、高水準のForthの方がよいでしょう。

Z80 CamelForthの場合、約70個のプリミティブが用意されています。([表1](glosslo.md)参照) ForthのモデルやCPUの使い方は既に決まっているので(以前のTCJの記事参照)、このような開発手順で進めていきました。

1. ANSI Coreのワードセットのうち、プリミティブとなるサブセットを選択する。(もちろん、改訂される可能性があります)。
2. ANSIの記述から、これらのワードのアセンブラ定義とプロセッサの初期化コードを記述する。
3. ソースコードの誤りを修正しながら、これをアセンブラで実行する。
4. 作成したアセンブリ言語プログラムが、動作する機械語コードが生成できるかどうかテストする。私は通常、初期化が完了したら文字を出力するよう、アセンブラコードを数行追加する。この一見些細なテストが重要なのです! ハードウェア、アセンブラ、"ダウンローダー"(EPROMエミュレータなど)、シリアル通信がすべて動作していることを確認するのです!
5. (組み込みシステムのみ) 別のアセンブラコードを追加して、シリアルポートを読み、それをエコーバックする...つまり、通信を双方向でテストします。
6. Forthのプリミティブを使って、文字を出力するための高レベルのForth断片コードを書きます。(通常、"LIT,33h,EMIT,BYE" のようなもの) これはForthのレジスタ初期化、スタック、およびスレッド機構をテストします。この段階での問題は、通常、NEXTや初期化のロジックエラー、またはデータスタックの不具合(ROM内のスタックなど)に由来することが普通です。
7. 文字を出力するコロンの定義を書き、手順6の高レベルの断片コードに含めます。(例: BLIPを "LIT,34h,EMIT,EXIT" と定義し、"LIT,33h,EMIT, BLIP,BYE" という断片コードをテストする). この段階での問題は、通常、DOCOLONやEXITのロジック、リターンスタックの不具合です。
8. この時点で、デバッグに役立つツール、例えばスタック上の数値を16進数で表示するワードを書くことができます。[リスト1](cameltst.md)は、終わりのないメモリダンプを行う簡単なテストルーチンです(キーボードが機能しない場合にも便利です)。これは、DUP、EMIT、EXIT、C@、><、LIT、1+、BRANCHのプリミティブと、いくつかのレベルのネストをテストしています。さらに、しばしば動作させるのが難しいDO..LOOPを使用していません。このコードが動けば、あなたのForthの基本モデルが有効であるという確信が持てます。
9. DO..LOOP、UM/MOD、UM*、DODOESは特にやっかいなプリミティブです。私の好みは、次に初歩的なインタプリタを動かして、対話的にワードをテストできるようにすることです。

このプリミティブのセットがあれば、Forthのコードを書き始めることができます。もちろん、Forthコンパイラではなくアセンブラを使わなければなりませんが、リスト1が示すように、高レベルの制御フローとネストを使えば、アセンブラでは難しいような便利なコードを書くことができます。

# READ THE CODE!

今日の分の抽象的な表現を書きつくしました。Forthカーネルがどのように動作し、どのように書かれているのかについてもっと学びたい場合は、[リスト2](camel80.txt)を勉強してください。これは、ドキュメントのための Forth の慣習に従ったものです。
```
WORD-NAME    stack in -- stack out    description
```
***WORD-NAME***は、Forthが知っているワードの名前です。これらの名前には独特のASCII文字が含まれていることが多いため、アセンブララベルを定義する際には近似値を使用しなければなりません(例えば、Forthのワード1+にはONEPLUSと指定します)。

***stack in*** は、このワードがスタック上に表示する引数で、スタックの最上位は常に右側にあります。***stack out***は、このワードがスタックに残す引数です。

ワードがリターンスタック効果を持つ場合(ネスト以外、です)、"R:" の後にリターンスタック・コメントが追加されます。
```
stack in -- stack out    R: stack in -- stack out 
```
ANSI Forth では、符号付き単セル数を表す"n"、符号なし単セル数を表す"u"、文字を表す"c"など、スタック引数の有用な略語を多数定義しています。[Table 1](glosslo.txt) を参照してください。

# REFERENCES

[1] Definition of a camel: a horse designed by committee.

[2] Ting, C. H., eForth Implementation Guide, July 1990, available from Offete Enterprises, 1306 South B Stret, San Mateo, CA 94402 USA.

[3] Z80MR, a Z80 Macro Assembler by Mike Rubenstein, is public-domain, available on the GEnie CP/M Roundtable as file Z80MR-A.LBR. Warning: do not use the supplied Z1.COM program, use only Z80MR and LOAD. Z1 has a problem with conditional jumps.

[4] A51, PseudoCorp's freeware Level 1 cross-assembler for the 8051, is available from the Realtime and Control Forth Board, (303) 278-0364, or on the GEnie Forth Roundtable as file A51.ZIP. PseudoCorp's commercial products are advertised here in TCJ.

Source code for Z80 CamelForth is available on this site at http://www.camelforth.com/public_ftp/cam80-12.zip.

Continue with Part 6 | Back to publications page
