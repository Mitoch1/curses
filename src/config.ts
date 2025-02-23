import {invoke} from "@tauri-apps/api/core";

enum AppMode {
  server,
  client
}

enum AppPlatform {
  app,
  web
}

type NativeFeatures = {
  background_input: boolean
}

type InitialData = {
  scene: string
}

type ClientNetwork = {
  serverId: string;
  host: string;
  port: string;
}
type ServerNetwork = {
  ip: string,
  host: string,
  port: string
}

class AppConfiguration {
  mode: AppMode            = AppMode.server;
  platform: AppPlatform    = AppPlatform.app;
  clientInitialState?: InitialData;
  features: NativeFeatures = {
    background_input: false
  }
  serverNetwork!: ServerNetwork;
  clientNetwork!: ClientNetwork;

  public isApp    = () => window.Config.platform === AppPlatform.app;
  public isWeb    = () => window.Config.platform === AppPlatform.web;
  public isClient = () => window.Config.mode === AppMode.client;
  public isServer = () => window.Config.mode === AppMode.server;

  // region ---INITIALIZERS---
  private loadBase() {
    // __TAURI_METADATA__ was deprecated in tauri@2, this ternary doesn't work anymore.
    // this.platform = window.__TAURI_METADATA__ ? AppPlatform.app : AppPlatform.web;
    this.platform = AppPlatform.app;
    this.mode     = window.location.pathname.startsWith('/client') ? AppMode.client : AppMode.server;
  }

  private async loadFeatures() {
    if (!this.isApp())
      return;
    this.features = await invoke<NativeFeatures>("get_native_features");
  }

  private async loadNetwork() {
    // client is always web
    // load network params from url query
    if (this.isClient()) {
      const q            = new URLSearchParams(window.location.search.substring(1));
      this.clientNetwork = {
        serverId: q.get("id") ?? "",
        host:     q.get("host") ?? location.hostname,
        port:     q.get("port") ?? location.port
      }
    }
      // server is always app
    // load network params from rust
    else {
      const appConfig    = await invoke<any>("plugin:web|config");
      this.serverNetwork = {
        ip:   appConfig.local_ip,
        host: "localhost",
        port: appConfig.port
      }
    }
  }

  async init() {
    this.loadBase();
    await Promise.all([
      this.loadFeatures(),
      this.loadNetwork()
    ]);
  }
  //endregion

}

export default AppConfiguration;
