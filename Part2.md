# Part 2: Benchmarks and Case Studies of Forth Kernels

> This article first appeared in The Computer Journal #60 (March/April 1993).

# BENCHMARKS

これまで、設計に関するあらゆる質問に対する答えは、"コードを書いて理解しろ"であると思われてきました。もちろん、さまざまな方式を評価するために、Forthカーネル全体を何通りにも書き分けたいとは思わないでしょう。幸いなことに、Forthカーネルのほんの小さなサブセットだけで、非常に良い"感触"を得ることができます。

Guy Kelly [KEL92]は、19種類のIBM PC Forthについて、以下のコードサンプルを検証しています。

NEXT ..."内部インタプリタ"です。"スレッド"において、1つのForthワードから別のワードへと連鎖させてゆきます。これはすべてのコード定義の最後に使用され、Forthの実行速度における最も重要な要因の1つです。ITCとDTCですでにこの疑似コードを見たことがあると思います。STCではCALL/RETURNだけです。

ENTER ...DOCOLまたはDOCOLONとも呼ばれ、高レベルの"コロン"定義を実行させるコードフィールドの動作です。すべてのコロン定義の開始時に使用されますので、これも高速化のために重要です。STCでは本機能は必要ありません。

EXIT ...fig-Forthでは;Sと呼ばれ、コロン定義の実行を終了させるコードです。これは本質的に高レベルでのサブルーチンリターンであり、すべてのコロン定義の最後に現れます。STCでは、これは機械語のRETURNのみとなります。

NEXT、ENTER、EXITは、スレッド機構の性能を示す。これらは、ITC対DTC対STCを評価するようにコード化されるべきです。また、IP、W、RSPのレジスタの割り当ての良し悪しも反映されます。

DOVAR ...別名"VARIABLE"。すべての Forth VARIABLE(変数) に対するコードフィールドアクションである機械語の断片です。

DOCON ...別名"CONSTANT"。すべてのForth CONSTANT(定数)のコードフィールドアクションである機械語の断片です。

DOCONとDOVARは、ENTERとともに、実行中のワードのパラメータフィールドアドレスをいかに効率的に取得できるかを示しています。これは、どのレジスタをWレジスタとするかの選択を反映しています。DTC Forthでは、コードフィールドにJUMPやCALLを入れるかどうかも示しています。

LIT ...別名"literal"。これは、高レベルのスレッドからセル値をフェッチするForthワードです。このようなインラインパラメータを使用するワードがいくつかあり、これはその性能の良い指標となります。IPレジスタの選択を反映します。

@ ...Forthのメモリフェッチ演算子です。これは、高レベルのForthからどれだけ速くメモリにアクセスできるかを示しています。このワードは通常、スタックのTOSの恩恵を受けます。

! ...Forthのメモリストア演算子です。これも、メモリアクセスのもう一つの指標です。これはスタックから2つのアイテムを消費しますので、パラメータスタックアクセスの効率性を示しています。TOS-in-memoryとTOS-in-registerのトレードオフの良い指標になります。

+　...加算演算子は、Forthのすべての算術演算子および論理演算子の代表的な例です。ワードと同様、スタックアクセスのベンチマークであり、TOS-in-registerの利点を明確に示しています。

これは素晴らしいコードサンプルのセットです。私は、さらにいくつかのお気に入りがあります。

DODOES ...これは、DOES>で構築されたワードに対するコードフィールドアクションです。W、IP、RSPの有用性を反映していますが、これから新しいベンチマークの比較は得られません。Forthカーネルで最も複雑なコードであるため、これを含めています。DODOESのロジックをコーディングできれば、他のものは簡単にできます。DODOESの複雑さについては、次の記事で説明します。

SWAP ...単純なスタック演算子ですが、やはり勉強になります。

OVER ...もっと複雑なスタック演算子です。パラメータスタックに簡単にアクセスできることがよくわかります。

ROT ...さらに複雑なスタック演算子で、追加のテンポラリレジスタを必要とする可能性が最も高い演算子です。もし、"X"レジスタを必要とせずに ROT をコーディングできるのであれば、おそらく他でも"X"レジスタは必要ないでしょう。

0= ...数少ない単項演算子で、TOS-in-registerの恩恵を受ける可能性が最も高い演算子の1つです。

+! ...スタックアクセス、算術演算、メモリフェッチ、ストアを組み合わせた、最もわかりやすい演算子です。このリストの他のワードより使用頻度は低いですが、私のお気に入りのベンチマークの1つです。

これらは、Forthカーネルで最もよく使われるワードの1つです。これらを最適化するのが得策です。これらすべての例を、疑似コードも含めて、6809について紹介します。他のCPUについては、特定の決定を説明するための例を選択して示します。

# CASE STUDY 1: THE 6809

8ビットCPUの世界では、6809はForthプログラマの夢のマシンです。なんとスタックが 2 つもあるのです。さらに、2 つのアドレスレジスタと、PDP-11 に次ぐ豊富な直交アドレスモードを備えています。("直交"とは、すべてのアドレスレジスタが同じ方法で動作し、同じオプションを持つという意味です)。2つの8ビットアキュムレータは1つの16ビットアキュムレータとして扱うことができ、16ビット演算も多数存在します。

プログラマからみた6809のモデルは[MOT83]にあります。

A - 8ビットアキュムレータ  
B - 8ビットアキュムレータ

ほとんどの算術演算は、アキュムレータを出力先として使用します。これらを連結して、1つの16ビットアキュムレータD(Aが上位バイト、Bが下位バイト)として扱うことができます。

X - 16ビットインデックスレジスタ  
Y - 16ビットインデックスレジスタ  
S - 16ビットスタックポインタ  
U - 16ビットスタックポインタ  

XとYのすべてのアドレス指定モードは、SとUのレジスタでも使用できます。

PC - 16ビット・プログラムカウンタ  
CC - 8ビット・コンディションコードレジスタ  
DP - 8ビット・ダイレクトページレジスタ  

6800ファミリーのダイレクトアドレッシングモードでは、8ビットアドレスを使用して、メモリページ0内の任意の場所に到達します。6809では、どのページでもダイレクトアドレッシングが可能で、このレジスタはアドレスの上位8ビットを提供します。

この2つのスタックポインタは、Forthで使用するために必要なものです。S がサブルーチンコールと割り込みに使われることを除けば、両者は等価です。一貫して、Sをリターンアドレスに使用し、Uをパラメータスタックに残すことにしましょう。

XとYは等価なので、とりあえずX=W, Y=IPとしましょう。

これで、スレッドモデルを選択することができます。STCとTTCを1から書いてみて、"伝統的な"Forthにします。実行性能の限界はNEXTルーチンにあります。これをITCとDTCの両方で見てみましょう。
```
ITC-NEXT: LDX ,Y++   (8) (IP)->W, increment IP
          JMP [,X]   (6) (W)->temp, jump to adrs in temp

DTC-NEXT: JMP [,Y++] (9) (IP)->temp, increment IP,
                         jump to adrs in temp
                         ("temp" is internal to the 6809)
```
DTC 6809では、NEXTは1命令です! つまり、2バイトでインラインコーディングできるので、JMP NEXTより小さく、かつ高速になります。比較のために、サブルーチンスレッドの"NEXT"のロジックをご覧ください。
```
        RTS           (5) ...at the end of one CODE word 
        JSR nextword  (8) ...in the "thread"
        ...               ...start of the next CODE word
```
STCでは、次のワードに移行するために13クロックかかるのに対し、DTCでは9クロックです。この理由は、サブルーチンスレッディングでは、リターンアドレスをpop, pushする必要がありますが、単純なDTCやITCのスレッディングでは、コードワード間にリターンアドレスのpush/popがないためです。

DTCを選択した場合、上位ワードのコードフィールドにジャンプやコールがあるかどうかを判断する必要があります。その際、その後に続くパラメータフィールドのアドレスをどれだけ早く取得できるかがポイントになります。コロン定義にENTERするコードを見てみましょう。Forthのシンボリックなレジスタ名を使って説明しています。

JSR命令(Call)を使用する場合:

```
        JSR ENTER   (8)
        ...
ENTER:  PULS W      (7) get address following JSR into W reg
        PSHS IP     (7) save the old IP on the Return Stack
        TFR  W,IP   (6) Parameter Field address -> IP
        NEXT        (9) assembler macro for JMP [,Y++] 
                    37 cycles total
JMP命令を使用する場合:

        JMP ENTER   (4)
         ...
ENTER:  PSHS IP     (7) save the old IP on the Return Stack
        LDX -2,IP   (6) re-fetch the Code Field address
        LEAY 3,X    (5) add 3 and put into IP (Y) register
        NEXT        (9)
                    31 cycles total

                    (CPU cycle counts are in parentheses.)
```
DTC 6809のNEXTは、6809のアドレッシングモードが余分なレベルの間接アクセスを可能としているため、Wレジスタを使用しません。JMP版のENTERは、コードフィールドのアドレスを再取得し、パラメータフィールドのアドレスを得るために3を加算します。JSR版では、リターンスタックをポップすることで、パラメータフィールドアドレスを直接取得することができます。それでも、JMP版の方が速いです。(JSR版のENTERをS=PSP、U=RSPでコーディングしてみてください"。

いずれにせよ、EXITのコードは同じです。
```
EXIT:   PULS IP     pop "saved" IP from return stack
        NEXT        continue Forth interpretation
```
まだレジスタがいくつか残っており、それらも割り当てはできます。ユーザポインタをメモリに置いておいても、このForthはかなり高速になります。しかし、DPレジスタは無駄になってしまいますし、他にできることもあまりありません。上記の"トリック"を使って、UPの上位バイトをDPレジスタに保持することにしましょう。(UPの下位バイトは暗黙のうちに0となります)。

16ビットレジスタDが1つ残ります。ほとんどの算術演算はこのレジスタを必要とします。スクラッチレジスタとして空けるべきか、Top-of-Stackとして使用すべきか? 6809の命令では、メモリを1つのオペランドとして使用するので、2つ目のワーキングレジスタは不要かもしれません。もしスクラッチレジスタが必要なら、Dをプッシュしたりポップしたりするのは簡単です。

NEXT、ENTER、EXITはスタックを使用しないので、どちらの方法でも同じコードになります。

DOVAR、DOCON、LIT、OVER はどちらの方法でも同じ数の CPU サイクルを必要とします。これらは、TOS をレジスタに置くと、プッシュまたはポップが行われる場所が変わるだけであることが多いという、先ほどのコメントの現れになっています。

```
        TOS in D        TOS in memory   pseudo-code

DOVAR:  PSHU TOS        LDD  -2,IP      address of CF -> D
        LDD  -2,IP      ADDD #3         address of PF -> D
        ADDD #3         PSHU D          push D onto stack
        NEXT            NEXT

DOCON:  PSHU TOS        LDX  -2,IP      address of CF -> W
        LDX  -2,IP      LDD  3,X        contents of PF -> D
        LDD  3,X        PSHU D          push D onto stack
        NEXT            NEXT

LIT:    PSHU TOS        LDD  ,IP++      (IP) -> D, increment IP
        LDD  ,IP++      PSHU D          push D onto stack
        NEXT            NEXT

OVER:   PSHU D          LDD  2,PSP      2nd on stack -> D
        LDD  2,PSP      PSHU D          push D onto stack
        NEXT            NEXT
```
SWAP, ROT, 0=, @, +の全て、特に + は、TOSをレジスタに保持するほうが高速になります。
```
        TOS in D        TOS in memory   pseudo-code

SWAP:   LDX  ,PSP (5)   LDD  ,PSP (5)   TOS -> D
        STD  ,PSP (5)   LDX 2,PSP (6)   2nd on stack -> X
        TFR  X,D  (6)   STD 2,PSP (6)   D -> 2nd on stack
        NEXT            STX  ,PSP (5)   X -> TOS
                        NEXT

ROT:    LDX  ,PSP (5)   LDX  ,PSP (5)   TOS -> X
        STD  ,PSP (5)   LDD 2,PSP (6)   2nd on stack -> D
        LDD 2,PSP (6)   STX 2,PSP (6)   X -> 2nd on stack
        STX 2,PSP (6)   LDX 4,PSP (6)   3rd on stack -> X
        NEXT            STD 4,PSP (6)   D -> 3rd on stack
                        STX  ,PSP (5)   X -> TOS
                        NEXT 

0=:     CMPD #0         LDD  ,PSP       TOS -> D
        BEQ  TRUE       CMPD #0         does D equal zero?
                        BEQ  TRUE
  FALSE:LDD  #0         LDD  #0         no...put 0 in TOS
        NEXT            STD  ,PSP
                        NEXT
  TRUE: LDD  #-1        LDD  #-1        yes...put -1 in TOS
        NEXT            STD  ,PSP
                        NEXT  

@:      TFR TOS,W (6)   LDD [,PSP] (8)  fetch D using TOS adrs
        LDD  ,W   (5)   STD  ,PSP  (5)  D -> TOS
        NEXT            NEXT

+:      ADDD ,U++       PULU D          pop TOS into D
        NEXT            ADDD ,PSP       add new TOS into D
                        STD  ,PSP       store D into TOS
                        NEXT
```
! と +! はTOSをレジスタに保持すると遅くなります。
```
        TOS in D        TOS in memory   pseudo-code

!:      TFR TOS,W (6)   PULU W   (7)    pop adrs into W
        PULU D    (7)   PULU D   (7)    pop data into D
        STD  ,W   (5)   STD  ,W  (5)    store data to adrs
        PULU TOS  (7)   NEXT
        NEXT

+!:     TFR TOS,W (6)   PULU W   (7)    pop adrs into W
        PULU TOS  (7)   PULU D   (7)    pop data into D
        ADDD ,W   (6)   ADDD ,W  (6)    add memory into D
        STD  ,W   (5)   STD  ,W  (5)    store D to memory
        PULU TOS  (7)   NEXT
        NEXT
```
これらのワードが遅い理由は、ほとんどのForthメモリ参照ワードはスタックの先頭のアドレスを期待するので、余分なTFR命令が必要だからです。このため、TOSレジスタがアドレスレジスタであると助かるのです。残念ながら、6809のアドレスレジスタはすべて使用済みで、TOSよりもW、IP、PSP、RSPがアドレスレジスタであることの方がずっと重要なのです。TOSをレジスタに保持する場合の!と+！のペナルティは、多くの算術演算とスタック演算の利点を上回るはずです。

# CASE STUDY 2: THE 8051

6809がForth書き(Forthwrights)にとっての夢のマシンであるなら、8051は悪夢のCPUと言えます。汎用アドレスレジスタが1つしかなく、アドレス指定モードも1つで、常に1つの8ビットアキュムレータを使用します。

すべての算術演算と多くの論理演算は、アキュムレータを使用する必要があります。16ビット演算は、INC DPTRのみです。ハードウェアスタックは 128 バイトのオンチップレジスタファイルを使用しなければなりません。[SIG92] このようなCPUは胃潰瘍を作りかねません。

8051 Forth の中には完全な 16bit モデルを実装したものがありますが (例えば[PAY90])、私の好みからするとこれは遅すぎます。トレードオフのバランスを見直して、より高速な8051 Forthを作ろうではありませんか。

きびしい現実の筆頭は、アドレス・レジスタが1つしかないことです。そこで、8051のProgram CounterをIPとして使おうという考え、つまり、サブルーチンスレッド型のForthを作ることに至ります。コンパイラが可能な限り3バイトのLCALLを使わずに2バイトのACALLを使用すれば、STCコードのほとんどはITCやDTCコードと同じくらい小さくなるはずです。

サブルーチンスレッディングは、リターンスタックポインタがハードウェアスタックポインタであることを意味します。オンチップレジスタファイルには64セルのスペースがあり、複数のタスク・スタックを置くには十分なスペースがありません。この時点で、次の方針を選ぶことが可能です。

a) このForthをシングルタスクに限定する。  
b) Forthの全定義をコード化し、エントリー時に外部RAMのソフトウェアスタックにリターンアドレスを移動させる。  
c) 外部RAMとの間でリターンスタック全体をスワップすることにより、タスクスイッチを行う。

(b)は遅い! タスクスイッチのたびに128バイトを移動させる方が、Forthワードのたびに2バイトを移動させるより速いのです。とりあえず、私は(a)を選びますが、将来的には(c)を選ぶ可能性もあります。

唯一無二の"実"アドレスレジスタであるDPTRは、複数の役割を担わなければなりません。これが、多目的ワーキングレジスタ"W"となります。

実は、外部メモリをアドレス指定できるレジスタは、他に2つあります。R0とR1です。これらは***8ビット***のアドレスしか提供できず、上位8ビットは明示的にポート2に出力される。しかし、スタックは256バイトの空間に限定できるので、これは許容範囲の制限です。そこで、R0をPSPとして使ってみましょう。

この同じ256バイトのスペースは、ユーザデータに使用することができます。このため、P2"ポート2"がユーザポインタの上位バイトとなり、6809と同様に下位バイトはゼロと暗示されることになります。

ここまでで8051のプログラマモデルはどうなっているのでしょうか? 
```
    reg 8051   Forth
   adrs name   usage

      0  R0    low byte of PSP
      1  R1
      2  R2
      3  R3
      4  R4
      5  R5
      6  R6
      7  R7 
  8-7Fh        120 bytes of return stack
    81h  SP    low byte of RSP (high byte=00)
 82-83h  DPTR  W register
    A0h  P2    high byte of UP and PSP
    E0h  A
    F0h  B
```
これは、レジスタバンク0のみを使用することに注意してください。08h から 1Fh までの 3 つのレジスタバンクと、20h から 2Fh までのビットアドレス可能な領域は、Forth では使用されません。バンク 0 を使用すると、リターンスタック用に最も大きな連続したスペースが残ります。後で必要であれば、リターンスタックを縮小することができます。

NEXT、ENTER、EXITルーチンは、サブルーチンスレッド化されたForthでは必要ありません。

スタックの先頭はどうなっているのでしょうか? レジスタはたくさんありますし、8051でのメモリ操作は高価です。TOSを"R3:R2" (インテル流にR3を上位バイトとする)に置いてみましょう。B:Aは使えないことに注意してください。Aレジスタは、すべてのメモリ参照でデータが移動する漏斗(通り道)なのです。

## Harvard architectures


8051は"ハーバード"アーキテクチャを採用しており、プログラムとデータは別々のメモリに保存されます(Z8とTMS320が他の2つの例です)。8051の場合、プログラムメモリに書き込む手段が物理的に存在しないのです。このとき、Forth野郎(Forthwright)は次の2つのうちのいずれかを行うことができます。

a) アプリケーションを含むすべてをクロスコンパイルし、8051にインタラクティブなForthコンパイラを載せる望みをすべてあきらめる。あるいは

b) プログラムメモリの一部または全部をデータ空間にも出現させる。最も簡単な方法は、active low の/PSENと/RDのストローブ信号を外部ANDゲートで論理和して、2つの空間を完全にオーバーラップさせることです。

Z8とTMS320C25は、プログラム・メモリへの書き込みアクセスが可能で、より文化的です。Forthカーネルの設計に与える影響については、次回以降に説明する予定です。

# CASE STUDY 3: THE Z80

Z80は、非直交なCPUの極端な例として参考になります。Z80は***4つの異なる種類の***アドレスレジスタを持っているのです。ある演算はAをディスティネーションとし、ある演算は任意の8ビットレジスタ、ある演算はHL、ある演算は任意の16ビットレジスタ、といった具合です。演算命令の多く("EX DE,HL"など)は、1つのレジスタの組み合わせに対してのみ定義されています。

Z80(あるいは8086!も)のようなCPUでは、Forthの機能の割り当てをCPUのレジスタの能力に注意深く適合させてやらねばなりません。さらに多くのトレードオフを評価する必要があり、多くの場合、異なる割り当てのためのサンプルコードをそれぞれ書くしかありません。この記事では、Forthコードの無限の並べ替えに紙面を割くのではなく、多くのZ80コードの実験を経て得られた1つのレジスタ割り当てを紹介します。これらの選択は、先に概説した一般的な原則の観点から合理化できることがわかりました。

私は、ダイレクトスレッディングを使用するものの、"伝統的な"Forthを望んでいます。"古典的な"仮想レジスタはすべて必要です。

代替レジスタを脇に置くと、Z80には6つのアドレスレジスタがあり、その機能は次のとおりです。

```
   BC,DE - LD A indirect, INC, DEC
           also exchange DE/HL

      HL - LD r indirect, ALU indirect, INC, DEC, ADD, ADC, 
           SBC, exchange w/TOS, JP indirect

   IX,IY - LD r indexed, ALU indexed, INC, DEC, ADD, ADC,
           SBC, exchange w/TOS, JP indirect  (all slow)

      SP - PUSH/POP 16-bit, ADD/ADC/SUB to HL/IX/IY
```
BC、DE、HLは8ビット単位で操作することもできます。

8ビットのレジスタAは、非常に多くのALU命令やメモリ参照操作命令の先となるため、スクラッチレジスタとして残しておく必要があります。

HLは間違いなく最も汎用性の高いレジスタであり、しばしばForthの仮想レジスタのいずれかに使いたくなるものです。しかし、その**汎用性ゆえに**、また、バイト単位でフェッチ可能**かつ**間接ジャンプで使用できる唯一のレジスタであるがゆえに、HLはForthの汎用作業レジスタであるWに使用されるべきです。

Forthのスタックポインタには、ALU演算で使用できるインデックスドアドレッシングモードであるIXとIYが考えられるかもしれません。しかし、これには2つの問題があります。それは、SPの仕事がなくなることと、IX/IYが遅すぎることです。どちらのスタックでも、ほとんどの演算は 16 ビット量のプッシュまたはポップを伴います。これは SP では 1 命令ですが、IX や IY では**4 命令**必要です。Forthのスタックのうち1つはSPを使用すべきです。そして、これはパラメータスタックであるべきで、リターンスタックよりも頻繁に使用されるからです。

ForthのIPはどうでしょうか? ほとんどの場合、IPはメモリからフェッチしてオートインクリメントするので、BC/DEよりもIX/IYを使うことにプログラミング上の利点はありません。しかし、IPはスピードが命ですし、BC/DEの方が速いのです。IPをDEに入れましょう。HLとスワップできるという利点があり、汎用性が増します。

16ビット演算のためには、W以外にもう1つZ80のレジスタペアが必要になります。BCは2番目のワーキングレジスタ"X"にすべきなのか、それともTop-of-Stackにすべきなのか? コードを見てみないと分かりませんが、楽観的に考えて、とりあえずBC=TOSとして様子をみましょう。

ここで、RSPとUPは未割当で、IXとIYレジスタは未使用のままです。IXとIYは等価なので、IX=RSP、IY=UPと割り当ててみましょう。

こうして、Z80 Forthのレジスタの割り当ては、次のようになります。
```
   BC = TOS   IX = RSP
   DE = IP    IY = UP
   HL = W     SP = PSP
```
DTC ForthのNEXTを見てみると:
```
DTC-NEXT: LD A,(DE) (7) (IP)->W, increment IP
          LD L,A    (4)
          INC DE    (6)
          LD A,(DE) (7)
          LD H,A    (4)
          INC DE    (6)
          JP (HL)   (4) jump to address in W
```
別の版を見ると(クロックサイクルは同数です)
```
DTC-NEXT: EX DE,HL  (4) (IP)->W, increment IP
NEXT-HL:  LD E,(HL) (7)
          INC HL    (6)
          LD D,(HL) (7)
          INC HL    (6)
          EX DE,HL  (4)
          JP (HL)   (4) jump to address in W
```
セルはメモリ上では低位バイトから順に格納されることに注意してください。また、IPをHLにしておくと有利に思えるかもしれませんが、実はそうでもありません。Z80はJP(DE)ができないからです。NEXT-HLというエントリポイントは、まもなく使われるようになります。

比較のために、ITCのNEXTを見てみましょう。先ほどの疑似コードでは、もう1つテンポラリレジスタ"X"が必要ですが、その内容は間接ジャンプに使うことができます。DE=X、BC=IPとします。TOSはメモリ上に保持する必要があります。
```
ITC-NEXT: LD A,(BC) (7) (IP)->W, increment IP
          LD L,A    (4)
          INC BC    (6)
          LD A,(BC) (7)
          LD H,A    (4)
          INC BC    (6)

          LD E,(HL) (7) (W)->X
          INC HL    (6)
          LD D,(HL) (7)
          EX DE,HL  (4) jump to address in X
          JP (HL)   (4)  
```
このため、"W"は1つインクリメントされ、DEレジスタに残ります。Wの内容を必要とするコードは、どこでそれを見つけ、どの程度調整すればよいかを知っているのです。

DTCが7命令であるのに対し、ITC NEXTは11命令です。そして、Z80のITCはTOSをレジスタに保持する機能を失っています。私はDTCを選択します。

インラインでコード化すると、DTC NEXTはコードワードごとに7バイト必要です。一般的なNEXTルーチンにジャンプすれば、3バイトで済みますが、10クロックサイクルが追加されます。これは、Forthカーネルを設計する際のトレードオフの判断の1つです。この例では、インラインのNEXTでスピードを選択するのが妥当でしょう。しかし、NEXTが非常に巨大であったり、メモリが逼迫していたりするので、JMP NEXTを使用するのが賢明な判断である場合もあります。

次に、ENTER のコードを見てみましょう。CALL を使って、ハードウェアスタックをポップし、パラメータフィールドアドレスを取得します。
```
        CALL ENTER  (17)
        ...
ENTER:  DEC IX      (10) push the old IP on the return stack
        LD (IX+0),D (19)
        DEC IX      (10)
        LD (IX+0),E (19)
        POP DE      (10) Parameter Field address -> IP
        NEXT        (38) assembler macro for 7 instructions
```
実際は、POP HLを使った方が高速です。その場合、NEXTの最後の6命令が使えます(EX DE,HLを除く6命令):
```
        CALL ENTER  (17)
        ...
ENTER:  DEC IX      (10) push the old IP on the return stack
        LD (IX+0),D (19)
        DEC IX      (10)
        LD (IX+0),E (19)
        POP HL      (10) Parameter Field address -> HL
        NEXT-HL     (34) see DTC NEXT code, above
                    119 cycles total
```
JP命令を使う場合、Wレジスタ(HL)はコードフィールドを指したままです。パラメータフィールドはその3バイト後ろです。
```
        JP ENTER    (10)
        ...
ENTER:  DEC IX      (10) push the old IP on the return stack
        LD (IX+0),D (19)
        DEC IX      (10)
        LD (IX+0),E (19)
        INC HL      ( 6) Parameter Field address -> IP
        INC HL      ( 6)
        INC HL      ( 6) 
        NEXT-HL     (34)
                    120 cycles total
```
ここでも、NEXTの別のエントリポイントが使えるので、IPの新しい値をDEレジスタペアに入れる必要はありません。

CALLバージョンは、1サイクル高速です。組み込み用Z80では、1バイトのRST命令を使用することで、速度向上とスペース節約を**同時に達成**することができます。このオプションは、多くのZ80ベースのパーソナルコンピュータでは利用できません。

# CASE STUDY 4: THE 8086

8086も学ぶところの多いCPUです。設計の過程を見るよりも、IBM PC用の新しいシェアウェアのForthの1つ、Pygmy Forth [SER90]を見てみましょう。

Pygmy はダイレクトスレッド Forth で、Top-of-Stackはレジスタに保持されています。8086のレジスタの割り当ては以下の通りです。
```
   AX = W         DI = scratch
   BX = TOS       SI = IP
   CX = scratch   BP = RSP
   DX = scratch   SP = PSP
```
ほとんどの8086ForthはIPにSIレジスタを使用しているので、NEXTはLODSW命令で書き込むことができます。PygmyではDTCのNEXTは
```
NEXT:  LODSW
       JMP AX
```
これは、すべてのコードワードにインラインで含めるに十分な短さです。

高レベルワードと"定義された"ワードでは、機械語コードに実行が移る際にJMP(相対ジャンプ)を使用します。したがって、ENTER ルーチン(Pygmy では 'docol' と呼ばれます)は W からパラメータフィールドアドレスを取得しなければなりません。
```
ENTER:  XCHG SP,BP
        PUSH SI
        XCHG SP,BP
        ADD AX,3    Parameter Field address -> IP
        MOV SI,AX
        NEXT
```
2 つのスタックポインタを交換するために XCHG を使用していることに注意してください。これにより、両方のスタックに PUSH と POP 命令を使用することができ、BP の間接アクセスを使用するよりも高速になります。
```
EXIT:   XCHG SP,BP
        POP SI
        XCHG SP,BP
        NEXT 
```
## Segment model

Pygmy ForthはシングルセグメントのForthで、すべてのコードとデータは1つの64Kバイトのセグメントに含まれています(Turbo Cの用語でいう"タイニーモデル"です)。(現在までに発表されているForthの標準規格は、すべて単一のメモリ空間に収まっており、同じフェッチ＆ストア演算子でアクセスできることを前提にしています。

しかし、IBM PCのForthでは、最大で5種類のデータに対して複数のセグメントを使用するものが出始めています[KEL92,SEY89]。これらは

CODE ...機械語コード  
LIST ...高レベルForthスレッド(別名THREADS)  
HEAD ...すべてのForthワードのヘッダ  
STACK ...パラメータスタックとリターンスタック  
DATA ...変数とユーザ定義データ  

これにより、16ビットCPUに32ビットForthを実装するコストをかけずに、PC Forthが64Kの制限を突破することができます。マルチセグメントモデルの実装や、Forthカーネルへの影響は、この記事の範囲外です。

## STILL TO COME...

この後の記事で見てゆく内容です。
- Forthのヘッダと辞書検索における設計上のトレードオフ
- CONSTANT、VARIABLE、およびその他のデータ構造のロジック
- 定義ワードのメカニズム、CREATE...;CODEとCREATE...DOES>。
- アセンブラとメタコンパイラの問題
- Forthカーネルを構成するアセンブラと高レベルコード
- カーネルに対するマルチタスクの修正

# REFERENCES

[KEL92] Kelly, Guy M., "Forth Systems Comparisons," Forth Dimensions XIII:6 (Mar/Apr 1992). Also published in the 1991 FORML Conference Proceedings. Both available from the Forth Interest Group, P.O. Box 2154, Oakland, CA 94621. 多くの 8086 Forth の設計のトレードオフを、コードの断片とベンチマークで説明しています。 -- おススメです!

[MOT83] Motorola Inc., 8-Bit Microprocessor and Peripheral Data, Motorola data book (1983).

[SIG92] Signetics Inc., 80C51-Based 8-Bit Microcontrollers, Signetics data book (1992).

## Forth Implementations

[PAY90] Payne, William H., Embedded Controller FORTH for the 8051 Family, Academic Press (1990), ISBN 0-12-547570-5. これは 8051 Forth のための完全な"キット"で、IBM PC 用のメタコンパイラも 含まれています。ハードコピーのみで、ファイルは GEnie からダウンロードできます。初心者向けではありません

[SER90] Sergeant, Frank, Pygmy Forth for the IBM PC, version 1.3 (1990). Distributed by the author, available from the Forth Interest Group. Version 1.4 is now available on GEnie, and worth the extra effort to obtain.

[SEY89] Seywerd, H., Elehew, W. R., and Caven, P., LOVE-83Forth for the IBM PC, version 1.20 (1989). A shareware Forth using a five-segment model. Contact Seywerd Associates, 265 Scarboro Cres., Scarborough, Ontario M1M 2J7 Canada.

Author's note for web publication: the files formerly available on the GEnie online service are now available from the Forth Interest Group FTP server, ftp://ftp.forth.org/pub/Forth.

