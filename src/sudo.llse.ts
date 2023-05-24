// LiteLoader-AIDS automatic generated
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="c:\Users\MnyaCat\Documents\LLSE/dts/HelperLib-master/src/index.d.ts"/>

/*
NOTE: LiteLoaderBDSのバグで`setPermLevel`でPermLevelを操作するとクライアントに同期されない
issue: https://github.com/LiteLDev/LiteLoaderBDS/issues/1194
BDSの内部関数を呼び出せば解決できるが、LLSEでは難しい
問題が解決されるまでの代替として、op/deopコマンドを採用
*/

function grantsOperator(target: Player) {
  // target.setPermLevel(1);
  mc.runcmd(`op ${target.name}`);
}

function revokesOperator(target: Player) {
  const _target = mc.getPlayer(target.xuid);
  // プレイヤーが切断して操作対象がおらず、エラーを防ぐためにプレイヤーを再取得
  if (_target != undefined) {
    // _target.setPermLevel(0);
    mc.runcmd(`deop ${target.name}`);
    mc.runcmd(`msg ${target.name} メンバーに降格しました。`);
  }
}

export function registerSudoCommand() {
  const cmd = mc.newCommand(
    "sudo",
    "プレイヤーに一時的にオペレーターのステータスを与えます。このステータスは300秒後に解除されます。",
    PermType.Any
  );
  cmd.mandatory("targets", ParamType.Player);
  cmd.overload(["targets"]);
  cmd.setCallback((_cmd, origin, output, result) => {
    const admin = Permission.getRole("admin");
    if (origin.player != null && admin.hasMember(origin.player.xuid)) {
      const targets = result.targets as Array<Player>;
      targets.forEach((player) => {
        grantsOperator(player);
        setTimeout(revokesOperator, 300000, player);
      });
      output.success("オペレーターに昇格しました。300秒後に解除されます。");
      return;
    }
    output.error(
      "このコマンドを使用する権限がありません。adminロールが必要です。"
    );
  });
  const result = cmd.setup();

  // 切断時にOPから降格させて、永続を防ぐ
  mc.listen("onLeft", (player) => {
    if (player.permLevel > 0) {
      log(`${player.name}.permLevel: ${player.permLevel}`);
      mc.runcmd(`deop ${player.name}`);
    }
  });

  if (result) {
    log("registered - sudo");
  } else {
    log("registration failed - sudo");
  }
}
