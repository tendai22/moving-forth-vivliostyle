# Part 4: Assemble or Metacompile?

> This article first appeared in The Computer Journal #64 (November/December 1993).

# How do you build a Forth system for the Very First Time?

Forthのコードのほとんどが高レベルの「スレッド」で、通常は単なるアドレスの羅列としてコンパイルされていることは、もうご存知でしょう。fig-Forthの初期には、アセンブラが唯一のプログラミングツールであることがよくありました。Forthのコードワードを書く分には問題ないのですが、高レベルのスレッドは一連のDWディレクティブとして書かなければならなかったのです。たとえば、Forthのワード

``` 
: MAX ( n n - n)   OVER OVER < IF SWAP THEN DROP ;
```
は次のように記述されます[TAL80]。
```
      DW OVER,OVER,LESS,ZBRAN
      DW MAX2-$
      DW SWAP
MAX2: DW DROP,SEMIS
```
その後、Forthシステムが普及すると、Forth書き(Forthwrights)はForthコンパイラをクロスコンパイラに変更し始めました[CAS80]。こうして、CP/Mマシン（あるいはApple IIなど)のForthで、他のCPU用のForthプログラムを書くことができるようになりました...そのCPU用のまったく新しいForthシステムまで含めて。

Forthの中から新しいForthを作るので、これらはしばしばメタコンパイラと呼ばれます。コンピュータサイエンスの純粋主義者はこれに反対するので、一部のForth屋(Forthie)は "クロスコンパイラ" や "リコンパイラ" という言葉を使います。違いは、リコンパイラが生成できるのは同じCPU用の新しいForthだけであることです。

現在、ほとんどのPC用Forthはメタコンパイラで作成されていますが、組み込みシステムの分野では意見が分かれています[TIN91,ROD91,SER91]。Forthを書くのにアセンブラを使う論拠は以下の通りです。

1. メタコンパイラは暗号のようなもので理解しにくく、メタコンパイラを使うには徹底的に理解しなければならない。
2. アセンブラは一般のプログラマが理解できる。
3. アセンブラは新しいCPUには必ずと言っていいほど付いている。
4. アセンブラは多くの最適化（例：ショートブランチとロングブランチ)を行うことができる。
5. アセンブラは前方参照や特殊なアドレスモードを扱えるが、多くのメタコンパイラでは扱えない。
6. アセンブラは使い慣れた編集・デバッグツールを使うことができる。
7. コード生成は完全に可視化され、プログラマから「隠される」ことはない。
8. メタコンパイラの内部には、多くの設計上の決定が影響するので、Forthモデルの微調整が容易である。

メタコンパイラに対する議論は、

1. 見た目が「普通」のForthコードを書くことができ、読みやすく、デバッグしやすくなります。
2. メタコンパイラを理解すれば、新しいCPUへの移植が容易になる。
3. 必要な道具は、コンピュータ用のForthだけです。

特に最後は、最近のクロスアセンブラはPCやワークステーションを必要とするものが多いので、PCをお持ちでない方にもおすすめです。

私はそれぞれの方法でForthをいくつか書いてきましたので、トレードオフの関係は痛いほど分かっているつもりです。私がメタコンパイラが好きなのは認めます。MAXのForthコードは、アセンブラの同等品よりずっと読みやすく、理解しやすいと思う。メタコンパイラに対する議論のほとんどは、最近の"プロフェッショナル"コンパイラによって克服されています。もしあなたが仕事でForthを使っているならば、商用製品に投資することを強くお勧めします。しかし、（私自身のものも含め)パブリックドメインのメタコンパイラは、まだ時代遅れで、不格好で、難解なものです。

そこで私は、Forthプログラマとしては過激な立場をとり、自分で選べと言うことにしています。6809のコードはメタコンパイラの形で公開し、F83（IBM PC、CP/M、Atari ST)用のメタコンパイラを供給することにします[ROD92]。Z80 のコードは CP/M 用のアセンブラで書かれます。8051 のコードは、パブリックドメインの PC クロスアセンブラ用に書かれます。

## Forth in C?

この話題は、新しい傾向を抜きにしては語れないでしょう。C言語で書かれたForthには、アセンブラよりも移植性が高いという利点があります--理論的には、どのCPUでも同じソースコードを再コンパイルすればいいだけです。一方、デメリットもあります。

1. 設計上の判断の自由度が低い。例えば、ダイレクトスレッド化されたコードはおそらく不可能で、レジスタ割り当てを最適化することもできません。
2. 新しいプリミティブを追加するには、C言語のソースを再コンパイルする必要がある。
3. Forthのワードは、C言語のコール＆リターンのオーバーヘッドを担っている。
4. C Forthの中には、CASE文などの非効率的なスレッディング技術を使用しているものがある。
5. ほとんどのCコンパイラは、優秀なアセンブリ言語プログラマよりも効率の悪いコードを生成します。

しかし、アセンブラを嫌うUnixシステムやRISCワークステーションでは、これがForthを立ち上げて動かすための唯一の方法かもしれません。公開されているC言語のForthの中で最も完全で広く使われているのは、TILE (TILE_21.ZIP, GEnie's Forth Roundtableのファイル番号2263)です (出版時)。Unix を使っていないのであれば、代わりに Genie ファイル HENCE4TH_1.2.A (#2490) と CFORTHU.ARC (#2079) を見てみてください。

前回の比較の続きで、HENCE4TH [MIS90]のMAXの定義を紹介します。わかりやすくするために、辞書のヘッダは省略しています。
```
_max() { 
    OVER  OVER  LESS IF  SWAP  ENDIF  DROP }
```
アセンブラの代わりにC言語を使って、カーネル内のコードワードを記述します。例えば、ここにHENCE4THのSWAPがあります。
```
_swap() { 
    register cell i = *(dsp);
    *(dsp) = *(dsp + 1);
    *(dsp + 1) = i;
}
```
(注意：C言語でのForthのワードの書き方はかなり多様なので、CFORTHやTILEではこれらのワードは根本的に違って見えるかもしれません)。

68000やSPARCでは、これはかなり良いコードを生成するかもしれません。Z80や8051では、全く逆です。しかし、C言語でForthを書こうと思っても、アセンブラでForthがどう動くかを理解する必要があります。それでは、次週の"MOVING FORTH"にご期待ください。

# REFERENCES

[CAS80] Cassady, John J., METAFORTH: A Metacompiler for Fig- Forth, Forth Interest Group (1980).

[MIS90] HenceFORTH in C, Version 1.2, distributed by The Missing Link, 975 East Ave. Suite 112, Chico, CA 95926, USA (1990). This is a shareware product available from the GEnie Forth Roundtable.

[ROD91] Rodriguez, B.J., letter to the editor, Forth Dimensions XIII:3 (Sep/Oct 1991), p.5.

[ROD92] Rodriguez, B.J., "Principles of Metacompilation," Forth Dimensions XIV:3 (Sep/Oct 1992), XIV:4 (Nov/Dec 1992), and XIV:5 (Jan/Feb 1993). Note that the published code is for a fig-Forth variant and not F83. The F83 version is on GEnie as CHROMIUM.ZIP

[SER91] Sergeant, Frank, "Metacompilation Made Easy," Forth Dimensions XII:6 (Mar/Apr 1991).

[TAL80] Talbot, R.J., fig-Forth for 6809, Forth Interest Group, P.O. Box 2154, Oakland, CA 94621 (1980).

[TIN91] Ting, C.H., "How Metacompilation Stops the Growth Rate of Forth Programmers," Forth Dimensions XIII:1 (May/Jun 1991), p.17.

Web版のための著者注：以前GEnieオンラインサービスで利用可能だったファイルは、現在Forth Interest Group FTPサーバー、ftp://ftp.forth.org/pub/Forth から入手可能です。また、この記事が最初に書かれてから、いくつかの新しい Forths-in-C が出版されています。最新のリストは ftp://ftp.forth.org/pub/Forth/FAQ にある "systems" FAQ を参照してください。

Continue with Part 5 | Back to publications page