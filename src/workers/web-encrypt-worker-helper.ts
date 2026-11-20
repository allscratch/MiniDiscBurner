// Version ESM de makeGetAsyncPacketIteratorOnWorkerThread de netmd-js.
// Le module d'origine est du CommonJS et casse sous Vite 8 en dev
// ("exports is not defined"). Le worker, lui, est notre version ESM locale.
type Packet = {
    key: Uint8Array<ArrayBuffer>;
    iv: Uint8Array<ArrayBuffer>;
    data: Uint8Array<ArrayBuffer>;
};

export function makeGetAsyncPacketIteratorOnWorkerThread(
    worker: Worker,
    progressCallback?: (progress: { totalBytes: number; encryptedBytes: number }) => void,
) {
    return function getAsyncPacketIteratorOnWorkerThread({
        data,
        frameSize,
        kek,
        chunkSize,
    }: {
        data: ArrayBuffer;
        frameSize: number;
        kek: Uint8Array;
        chunkSize: number;
    }): AsyncIterableIterator<Packet> {
        let resolveChunk: ((packet: Packet | null) => void) | undefined;
        let encryptedBytes = 0;
        const totalBytes = data.byteLength;
        const chunks: Array<Promise<Packet | null>> = [];

        const queueNextChunk = () => {
            const chunkPromise = new Promise<Packet | null>((resolve) => {
                resolveChunk = (packet) => {
                    if (packet !== null) {
                        encryptedBytes += packet.data.byteLength;
                        progressCallback?.({ totalBytes, encryptedBytes });
                        queueNextChunk();
                    }
                    resolve(packet);
                };
            });
            chunks.push(chunkPromise);
            worker.postMessage({ action: 'getChunk' });
        };

        const iterator = (async function* (): AsyncGenerator<Packet> {
            await new Promise<void>((resolve) => {
                worker.onmessage = () => resolve();
                worker.postMessage(
                    { action: 'init', data, frameSize, kek, chunkSize },
                    [data],
                );
            });

            worker.onmessage = (event: MessageEvent<Packet | null>) => {
                resolveChunk?.(event.data);
            };
            queueNextChunk();

            for (let i = 0; ; i++) {
                const packet = await chunks[i];
                delete chunks[i];
                if (packet === null) return;
                yield packet;
            }
        })();

        return iterator;
    };
}
