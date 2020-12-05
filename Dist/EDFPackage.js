// (class overall takes 256 chars/bytes, excluding the channelInfos array)
export class EDFPackage {
    constructor(data) {
        Object.assign(this, data);
    }
    //edfVersion: number; // (8)
    get edfVersion() { return 0; }
    //chunkCount: number; // -1 for unknown (8)
    get chunkCount() { return this.chunks.length; } // (8)
    GetChannelSamplesPerSecond(channelIndex) {
        return this.channelInfos[channelIndex].sampleCountPerChunk / this.chunkDuration;
    }
}
// (class overall takes 256 chars/bytes)
export class ChannelInfo {
    constructor(data) {
        Object.assign(this, data);
    }
}
export class Chunk {
    constructor(data) {
        Object.assign(this, data);
    }
}
export function GeneratePrefilteringInfoStr(bandFilterInfo, notchFilterInfo) {
    let val = "HP:0.5Hz ";
    if (bandFilterInfo.type != "None") {
        if (bandFilterInfo.type === "Bandpass") {
            val = `${val}BP:${bandFilterInfo.cutoffFrequency}Hz `;
        }
        if (bandFilterInfo.type === "Highpass") {
            val = `${val}HP:${bandFilterInfo.cutoffFrequency}Hz `;
        }
        if (bandFilterInfo.type === "Lowpass") {
            val = `${val}LP:${bandFilterInfo.cutoffFrequency}Hz `;
        }
    }
    if (notchFilterInfo.type != "None") {
        val = `${val}N:${notchFilterInfo.cutoffFrequency}Hz `;
    }
    return val.padEnd(80);
}
