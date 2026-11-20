/// <reference lib="webworker" />

// Version ESM du worker de chiffrement netmd-js.
// Le fichier d'origine est du CommonJS ; Vite 8 le sert en module ESM en dev,
// ce qui provoque "exports is not defined" et bloque l'upload avant le premier paquet.
import { getAsyncPacketIterator } from 'netmd-js/dist/encrypt-generator';
import CryptoJS from '@originjs/crypto-js-wasm';

type Packet = { key: Uint8Array; iv: Uint8Array; data: Uint8Array };
type InitMessage = {
    action: 'init';
    data: ArrayBuffer;
    frameSize: number;
    kek: Uint8Array;
    chunkSize: number;
};
type GetChunkMessage = { action: 'getChunk' };
type WorkerMessage = InitMessage | GetChunkMessage;

const scope = self as unknown as DedicatedWorkerGlobalScope;

let iterator: AsyncIterableIterator<Packet> | undefined;

scope.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    if (message.action === 'init') {
        await CryptoJS.DES.loadWasm();
        iterator = getAsyncPacketIterator({
            data: message.data,
            frameSize: message.frameSize,
            kek: message.kek,
            chunkSize: message.chunkSize,
        });
        scope.postMessage({ init: true });
        return;
    }

    if (message.action === 'getChunk') {
        if (!iterator) return;
        const { value, done } = await iterator.next();
        if (done) {
            scope.postMessage(null);
            scope.close();
            return;
        }
        const packet = value as Packet;
        scope.postMessage(packet, [packet.data.buffer as ArrayBuffer]);
    }
};
