// LiteLoader-AIDS automatic generated
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="c:\Users\MnyaCat\Documents\LLSE/dts/HelperLib-master/src/index.d.ts"/>

import { db } from "amethyst-plugin/database.llse";
import { PlayerInfo } from "amethyst-plugin/models.llse";

const protectedBedsKey = "protected_beds";

class BedPos {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class ProtectedBed {
  player: PlayerInfo;
  pos: BedPos;

  constructor(player: PlayerInfo, pos: BedPos) {
    this.player = player;
    this.pos = pos;
  }
}

function intPosToBedPos(pos: IntPos) {
  return new BedPos(pos.x, pos.y, pos.z);
}

function setProtectedBeds(protectedBeds: Array<ProtectedBed>) {
  db.set(protectedBedsKey, JSON.stringify(protectedBeds));
}

function getProtectedBeds() {
  const jsonString = db.get(protectedBedsKey);
  if (jsonString != null) {
    return JSON.parse(jsonString) as Array<ProtectedBed>;
  }
  return [];
}

export function registerProtectedBed() {
  mc.listen("onBedEnter", (player, pos) => {
    let protectedBeds = getProtectedBeds();

    const protectedPlayer = new PlayerInfo(player.name, player.xuid);
    protectedBeds = protectedBeds.filter(
      (item) => item.player.xuid != player.xuid
    );
    protectedBeds.push(new ProtectedBed(protectedPlayer, intPosToBedPos(pos)));
    setProtectedBeds(protectedBeds);

    mc.runcmd(`msg ${player.name} ベッドが保護されました`);
    log(
      `${player.name}によってベッドが保護されました(${pos.x}, ${pos.y}, ${pos.z})`
    );
  });

  mc.listen("onDestroyBlock", (player, block) => {
    if (block.type != "minecraft:bed") {
      return true;
    }

    const nbt = block.getBlockState();
    const direction = Object.values(nbt)[0];
    const headPiece = Object.values(nbt)[1];
    let headX = block.pos.x;
    const headY = block.pos.y;
    let headZ = block.pos.z;
    // 足側を破壊しようとした場合は、ベッドの方角を元に頭側(=保護されている)座標を計算
    if (headPiece == 0) {
      switch (direction) {
        case 0:
          headZ += 1;
          break;
        case 1:
          headX -= 1;
          break;
        case 2:
          headZ -= 1;
          break;
        case 3:
          headX += 1;
      }
    }

    let protectedBeds = getProtectedBeds();

    const result = protectedBeds.find(
      (value) =>
        value.pos.x == headX && value.pos.y == headY && value.pos.z == headZ
    );
    if (result != null) {
      // xuidが不一致、かつOPでは無い場合はベッドを破壊できないようにする
      if (player.xuid != result.player.xuid && !player.isOP()) {
        mc.runcmd(
          `msg ${player.name} このベッドは${result.player.name}によって保護されています`
        );
        return false;
      } else {
        // 破壊できる場合は保護対象から外す
        protectedBeds = protectedBeds.filter((item) => item != result);
        setProtectedBeds(protectedBeds);
      }
    }

    return true;
  });
}
