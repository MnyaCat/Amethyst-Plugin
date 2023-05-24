# coordinatesNote 　 command

座標を記録するコマンド。

## コマンド構造

coordinatesNote
├ add
├ delete
├ edit
├ show
└ list

## コマンド引数

### add

引数に座標が与えられなかった場合は現在の座標を記録。

- name, coord, [description]
- name [description]

### delete

一致するノートを削除する。
登録したプレイヤー、もしくは OP 権限を持つプレイヤーのみ実行可能。

- name

### edit

一致するノートの情報を上書きする。
登録したプレイヤー、もしくは OP 権限を持つプレイヤーのみ実行可能。

- name, section{name, coord, description, player}, newValue
- name, newName, newCoord, newDescription, newPlayer

### show

一致するノート情報を表示する。

- name

### list

登録されているノートを表示する。1 ページにつき 10 個表示。

- [page]

## 出力のフォーマット

ベッド : -10, 71, 29 : 普段使っているベッド by MnyaCat
