// LiteLoader-AIDS automatic generated
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="c:\Users\MnyaCat\Documents\LLSE/dts/HelperLib-master/src/index.d.ts"/>

import { db } from "amethyst-plugin/database.llse";
import { Coordinates, PlayerInfo } from "amethyst-plugin/models.llse";

const coordinatesNotesKey = "coordinates_notes";
const nameConflictErrorText =
  "と同じ名前のノートが存在します。別の名前を入力してください。";

class CoordinatesNote {
  name: string;
  coord: Coordinates;
  description: string | undefined;
  player: PlayerInfo | undefined;

  constructor(
    name: string,
    pos: Coordinates,
    description: string | undefined,
    player: PlayerInfo | undefined
  ) {
    this.name = name;
    this.coord = pos;
    this.description = description;
    this.player = player;
  }

  toResultString(includePlayer: boolean) {
    const coord = this.coord.toCoordString();
    const parts: Array<string> = [this.name, coord];
    if (this.description != undefined) {
      parts.push(this.description);
    }
    if (includePlayer && this.player != undefined) {
      parts.push(`by ${this.player.name}`);
    }
    return parts.join(" : ");
  }
}

function setCoordinatesNotes(coordinatesNotes: Map<string, CoordinatesNote>) {
  const json = JSON.stringify([...coordinatesNotes]);
  db.set(coordinatesNotesKey, json);
  log(json);
}

function getCoordinatesNotes() {
  const jsonString = db.get(coordinatesNotesKey);
  if (jsonString != null) {
    const data = JSON.parse(jsonString);
    const map = new Map<string, CoordinatesNote>();

    for (const [name, noteData] of data) {
      const note = new CoordinatesNote(
        name,
        new Coordinates(
          noteData.coord.x,
          noteData.coord.y,
          noteData.coord.z,
          noteData.coord.dimId
        ),
        noteData.description,
        noteData.player
      );
      map.set(name, note);
    }

    return map;
  }
  return new Map<string, CoordinatesNote>();
}

export function registerCoordinatesNote() {
  const cmd = mc.newCommand("coordnote", "座標を記録します。", PermType.Any);
  // cmd.setAlias("coordNote");

  cmd.setEnum("AddAction", ["add"]);
  cmd.setEnum("DeleteAction", ["delete"]);
  cmd.setEnum("EditAction", ["edit"]);
  cmd.setEnum("ShowAction", ["show"]);
  cmd.setEnum("ListAction", ["list"]);
  cmd.mandatory("action", ParamType.Enum, "AddAction", 1);
  cmd.mandatory("action", ParamType.Enum, "DeleteAction", 1);
  cmd.mandatory("action", ParamType.Enum, "EditAction", 1);
  cmd.mandatory("action", ParamType.Enum, "ShowAction", 1);
  cmd.mandatory("action", ParamType.Enum, "ListAction", 1);

  cmd.setEnum("EditName", ["name"]);
  cmd.setEnum("EditCoord", ["coord"]);
  cmd.setEnum("EditDescription", ["description"]);
  cmd.setEnum("EditPlayer", ["player"]);
  cmd.setEnum("EditAll", ["all"]);
  cmd.mandatory("editPart", ParamType.Enum, "EditName", 1);
  cmd.mandatory("editPart", ParamType.Enum, "EditCoord", 1);
  cmd.mandatory("editPart", ParamType.Enum, "EditDescription", 1);
  cmd.mandatory("editPart", ParamType.Enum, "EditPlayer", 1);
  cmd.mandatory("editPart", ParamType.Enum, "EditAll", 1);
  cmd.mandatory("newName", ParamType.String);
  cmd.mandatory("newCoord", ParamType.BlockPos);
  cmd.mandatory("newDescription", ParamType.String);
  cmd.mandatory("newPlayer", ParamType.Player);

  cmd.mandatory("name", ParamType.String);
  cmd.optional("coord", ParamType.BlockPos);
  cmd.optional("description", ParamType.String);

  cmd.optional("page", ParamType.Int);

  // overload
  cmd.overload(["AddAction", "name", "coord", "description"]);
  cmd.overload(["AddAction", "name", "description"]);

  cmd.overload(["DeleteAction", "name"]);

  cmd.overload(["EditAction", "name", "EditName", "newName"]);
  cmd.overload(["EditAction", "name", "EditCoord", "newCoord"]);
  cmd.overload(["EditAction", "name", "EditDescription", "newDescription"]);
  cmd.overload(["EditAction", "name", "EditPlayer", "newPlayer"]);
  cmd.overload([
    "EditAction",
    "name",
    "EditAll",
    "newName",
    "newCoord",
    "newDescription",
    "newPlayer",
  ]);

  cmd.overload(["ShowAction", "name"]);

  cmd.overload(["ListAction", "page"]);

  cmd.setCallback((_cmd, origin, output, result) => {
    const originPlayer = origin.player;
    const playerInfo =
      originPlayer != undefined
        ? new PlayerInfo(originPlayer.name, originPlayer.xuid)
        : undefined;

    const notes = getCoordinatesNotes();

    switch (result.action) {
      case "add": {
        const name = result.name as string;
        const coord =
          (result.coord as IntPos | undefined) ?? originPlayer?.blockPos;
        const description = result.description as string | undefined;

        if (coord == undefined) {
          output.error(
            "座標を取得できません。座標を入力して実行してください。"
          );
          return;
        }

        if (notes.has(name)) {
          output.error(name + nameConflictErrorText);
          return;
        }

        const coordinates = Coordinates.fromIntPos(coord);
        const note = new CoordinatesNote(
          name,
          coordinates,
          description,
          playerInfo
        );
        notes.set(name, note);
        setCoordinatesNotes(notes);

        output.success(`ノートを追加しました:\n${note.toResultString(false)}`);
        return;
      }
      case "delete": {
        const name = result.name as string;

        if (!notes.has(name)) {
          // eslint-disable-next-line no-useless-escape
          output.error(`\"${name}\"と一致するノートが見つかりません`);
          return;
        }

        notes.delete(name);
        setCoordinatesNotes(notes);
        // eslint-disable-next-line no-useless-escape
        output.success(`\"${name}\"と一致するノートを削除しました`);
        return;
      }

      case "edit": {
        const name = result.name as string;
        const note = notes.get(result.name);
        if (note == undefined) {
          // eslint-disable-next-line no-useless-escape
          output.error(`\"${name}\"と一致するノートが見つかりません`);
          return;
        }
        const editPart = result.editPart as string | undefined;
        switch (editPart) {
          case "name": {
            const oldName = note.name;
            const newName = result.newName as string;
            if (notes.has(newName)) {
              output.error(newName + nameConflictErrorText);
            }
            note.name = newName;
            notes.set(note.name, note);
            if (oldName !== note.name) {
              notes.delete(oldName);
            }
            output.success(
              // eslint-disable-next-line no-useless-escape
              `\"${oldName}\"の名前を編集しました:\n${oldName} -> ${newName}`
            );
            break;
          }
          case "coord": {
            const oldCoord = note.coord;
            const newCoord = result.newCoord as IntPos;
            note.coord = Coordinates.fromIntPos(newCoord);
            notes.set(note.name, note);
            output.success(
              // eslint-disable-next-line no-useless-escape
              `\"${
                note.name
                // eslint-disable-next-line no-useless-escape
              }\"の座標を編集しました:\n${oldCoord.toCoordString()} -> ${note.coord.toCoordString()}`
            );
            break;
          }
          case "description": {
            const oldDescription = note.description;
            const newDescription = result.newDescription as string;
            note.description = newDescription;
            notes.set(note.name, note);
            output.success(
              // eslint-disable-next-line no-useless-escape
              `\"${note.name}\"の説明を編集しました:\n${oldDescription} -> ${note.description}`
            );
            break;
          }
          case "player": {
            const oldPlayer = note.player;
            const newPlayer = result.newPlayer as Array<Player>;
            if (newPlayer.length > 1) {
              output.error(
                "プレイヤーのターゲットが多すぎます。ターゲットを1人にして入力してください。"
              );
              return;
            }
            note.player = PlayerInfo.fromPlayer(newPlayer[0]);
            notes.set(note.name, note);
            output.success(
              // eslint-disable-next-line no-useless-escape
              `\"${note.name}\"の記録者を編集しました: ${oldPlayer?.name} -> ${note.player.name}`
            );
            break;
          }
          case undefined: {
            const oldNote = note;
            const newName = result.newName as string;
            const newCoord = result.newCoord as IntPos;
            const newDescription = result.newDescription as string;
            const newPlayer = result.newPlayer as Array<Player>;
            if (newPlayer.length > 1) {
              output.error(
                "プレイヤーのターゲットが多すぎます。ターゲットを1人にして入力してください。"
              );
              return;
            }
            const newNote = new CoordinatesNote(
              newName,
              Coordinates.fromIntPos(newCoord),
              newDescription,
              PlayerInfo.fromPlayer(newPlayer[0])
            );
            notes.set(newNote.name, newNote);
            if (oldNote.name !== note.name) {
              notes.delete(oldNote.name);
            }
            output.success(
              // eslint-disable-next-line no-useless-escape
              `\"${note.name}\"を編集しました\n` +
                `${oldNote.toResultString(true)} -> ${newNote.toResultString(
                  true
                )}`
            );
            break;
          }
          default: {
            output.error(
              "予期しないエラーが発生しました: editPartの入力が不正です。"
            );
            return;
          }
        }

        setCoordinatesNotes(notes);
        return;
      }

      case "show": {
        const name = result.name as string;
        const note = notes.get(name);
        if (note == undefined) {
          // eslint-disable-next-line no-useless-escape
          output.error(`\"${name}\"と一致するノートが見つかりません`);
          return;
        }
        output.success(note.toResultString(true));
        return;
      }

      case "list": {
        const perPage = 10;
        const page = result.page ?? 1;
        if (notes.size == 0) {
          output.error("ノートが存在しません");
          return;
        }
        if (page < 1) {
          output.error(
            "pageの数値が小さすぎます。1以上の数値を入力してください。"
          );
          return;
        }

        const sortedNotes = Array.from(
          notes.values()
        ).sort() as Array<CoordinatesNote>;
        const maxPage = Math.ceil(sortedNotes.length / perPage);
        if (maxPage < page) {
          output.error(
            `指定されたページは存在しません。最大ページは${maxPage}です。`
          );
          return;
        }

        const end = perPage * page;
        // 1ページにつき10個表示
        const resultNotes = sortedNotes.slice(end - perPage, end);
        const cmdResult = resultNotes
          .map<string>((note) => note.toResultString(true))
          .join("\n");
        output.success(cmdResult + `\n<${page} / ${maxPage}>`);
        return;
      }
      default: {
        output.error(
          "予期しないエラーが発生しました: actionの入力が不正です。"
        );
        return;
      }
    }
  });

  const result = cmd.setup();

  if (result) {
    log("registered - coordinatesNote");
  } else {
    log("registration failed - coordinatesNote");
  }
}
