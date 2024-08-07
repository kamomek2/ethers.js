import { defineProperties } from "../utils/index.js";
import { AbstractSigner } from "./abstract-signer.js";

import type { TypedDataDomain, TypedDataField } from "../hash/index.js";

import type {
    BlockTag, Provider, TransactionRequest, TransactionResponse
} from "./provider.js";
import type { Signer } from "./signer.js";


export class NonceManager extends AbstractSigner {
    signer!: Signer;

    #noncePromise: null | Promise<number>;
    #delta: number;

    constructor(signer: Signer) {
        super(signer.provider);
        defineProperties<NonceManager>(this, { signer });

        this.#noncePromise = null;
        this.#delta = 0;
    }

    async getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    connect(provider: null | Provider): NonceManager {
        return new NonceManager(this.signer.connect(provider));
    }

    async getNonce(blockTag?: BlockTag): Promise<number> {
        if (blockTag === "pending") {
            if (this.#noncePromise == null) {
                this.#noncePromise = super.getNonce("pending");
            }
            return (await this.#noncePromise) + this.#delta;
        }

        return super.getNonce(blockTag);
    }

    increment(): void {
        this.#delta++;
    }

    reset(): void {
        this.#delta = 0;
        this.#noncePromise = null;
    }

    async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
        const noncePromise = this.getNonce("pending");
        this.increment();

        tx = await this.signer.populateTransaction(tx);
        tx.nonce = await noncePromise;

        // @TODO: Maybe handle interesting/recoverable errors?
        // Like don't increment if the tx was certainly not sent
        return await this.signer.sendTransaction(tx);
    }

    signTransaction(tx: TransactionRequest): Promise<string> {
        return this.signer.signTransaction(tx);
    }

    signMessage(message: string | Uint8Array): Promise<string> {
        return this.signer.signMessage(message);
    }

    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return this.signer.signTypedData(domain, types, value);
    }
}
