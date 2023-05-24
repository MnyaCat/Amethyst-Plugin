// LiteLoader-AIDS automatic generated
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="c:\Users\MnyaCat\Documents\LLSE/dts/HelperLib-master/src/index.d.ts"/>

export class PlayerInfo {
  name: string;
  xuid: string;

  constructor(name: string, xuid: string) {
    this.name = name;
    this.xuid = xuid;
  }

  static fromPlayer(player: Player) {
    return new PlayerInfo(player.name, player.xuid);
  }
}

export class Coordinates {
  x: number;
  y: number;
  z: number;
  dimId: 0 | 1 | 2;
  constructor(x: number, y: number, z: number, dimId: 0 | 1 | 2) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.dimId = dimId;
  }

  static fromIntPos(pos: IntPos) {
    return new Coordinates(pos.x, pos.y, pos.z, pos.dimid);
  }

  toCoordString() {
    const result = `${this.x}, ${this.y}, ${this.z}`;
    switch (this.dimId) {
      case 1:
        return result + "(ネザー)";
      case 2:
        return result + "(ジ・エンド)";
      default:
        return result;
    }
  }
}
