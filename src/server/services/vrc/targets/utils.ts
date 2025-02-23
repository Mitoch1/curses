import { invoke } from "@tauri-apps/api/core";

export function sendOsc(path: string, args: any[]) {
  invoke("plugin:osc|send", {
    rpc: {
      path,
      args,
    },
  });
}
