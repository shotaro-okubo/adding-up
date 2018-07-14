'use strict';
// const: 再宣言、再代入不可な変数
// require('モジュール名'): モジュールを拡張機能として使うことができる。
const fs = require('fs'); // モジュール'fs' (FileSystem): ファイルを扱うためのモジュール
const readline = require('readline'); // 'readline': ファイル（ストリーム）を１行ずつ読み込むためのモジュール
// Stream: 非同期で情報を取り扱うための概念。Streamに対してイベントを監視し、イベントが発生した時に呼び出される関数を設定することで、情報を利用する。
const rs = fs.ReadStream('./popu-pref.csv'); // ファイルの読み込みを行うStreamを生成
const rl = readline.createInterface({ 'input':rs, 'output': {} }); // Streamのインターフェースを持ったrlというオブジェクトを作成する。
const map = new Map(); // key: 都道府県  value: 集計データのオブジェクト
rl.on('line', (lineString) => { // lineというイベントが発生したらこの無名関数を呼ぶ。
  const columns = lineString.split(','); // lineStringで与えられた文字列をカンマで分割する。
  const year = parseInt(columns[0]); // parseInt(): 文字列を整数値に変換する関数
  const prefecture = columns [2];
  const popu = parseInt(columns[7]);
  if (year == 2010 || year == 2015) {
    let value = map.get(prefecture); // let: 再宣言不可、再代入は可能
    if (!value) { // valueの値がFalsyの場合に、初期値となるオブジェクトを代入する。
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year == 2010) {
      value.popu10 += popu;
    }
    if (year == 2015) {
      value.popu15 += popu;
    }
    map.set(prefecture, value);
  }
});
rl.resume(); // resumeメソッド: ストリームに情報を流し始める処理。オブジェクトの振る舞いを作ることのできる関数が設定されたプロパティのことをメソッドと呼ぶ。
rl.on('close', () => { // 'close'イベント: 全ての行を読み込み終わった際に呼び出される。
  for (let pair of map) { //for-of構文: Mapの中身をofの前の変数pairに代入してforループと同じことができる。
    const value = pair[1]; //pair[1]は値である集計オブジェクト
    value.change = value.popu15 / value.popu10;
  }
  const rankingArray = Array.from(map).sort((pair1, pair2) => { // Array.from(): 連想配列を普通の配列に変換する。
    return pair2[1].change - pair1[1].change;
  });
  const rankingStrings = rankingArray.map((pair) => { //map関数: Arrayの要素それぞれを、与えられた関数を適用した内容に変換する。
    return pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率:' + pair[1].change;
  });
  console.log(rankingStrings);
})
