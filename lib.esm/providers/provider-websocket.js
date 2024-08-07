import { WebSocket as _WebSocket } from "./ws.js"; /*-browser*/
import { SocketProvider } from "./provider-socket.js";
export class WebSocketProvider extends SocketProvider {
    #connect;
    #websocket;
    get websocket() {
        if (this.#websocket == null) {
            throw new Error("websocket closed");
        }
        return this.#websocket;
    }
    constructor(url, network) {
        super(network);
        if (typeof (url) === "string") {
            this.#connect = () => { return new _WebSocket(url); };
            this.#websocket = this.#connect();
        }
        else if (typeof (url) === "function") {
            this.#connect = url;
            this.#websocket = url();
        }
        else {
            this.#connect = null;
            this.#websocket = url;
        }
        this.websocket.onopen = async () => {
            try {
                await this._start();
                this.resume();
            }
            catch (error) {
                console.log("failed to start WebsocketProvider", error);
                // @TODO: now what? Attempt reconnect?
            }
        };
        this.websocket.onmessage = (message) => {
            this._processMessage(message.data);
        };
        /*
                this.websocket.onclose = (event) => {
                    // @TODO: What event.code should we reconnect on?
                    const reconnect = false;
                    if (reconnect) {
                        this.pause(true);
                        if (this.#connect) {
                            this.#websocket = this.#connect();
                            this.#websocket.onopen = ...
                            // @TODO: this requires the super class to rebroadcast; move it there
                        }
                        this._reconnect();
                    }
                };
        */
    }
    async _write(message) {
        this.websocket.send(message);
    }
    async destroy() {
        if (this.#websocket != null) {
            this.#websocket.close();
            this.#websocket = null;
        }
        super.destroy();
    }
}
//# sourceMappingURL=provider-websocket.js.map