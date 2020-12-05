import moment from "moment";
export function WriteEDFPackage(pack, stream) {
    WriteEDFHeader(pack, stream);
    for (const chunk of pack.chunks) {
        AppendChunk(chunk, stream, pack.channelInfos);
    }
}
function Str(length, val) {
    const result = (val !== null && val !== void 0 ? val : "").toString();
    if (result.length > length)
        throw new Error(`Val "${result}" exceeded string-length limit of ${length}.`);
    return result.padEnd(length);
}
export function WriteEDFHeader(pack, stream) {
    stream.write(Str(8, pack.edfVersion));
    stream.write(Str(80, pack.patientID));
    stream.write(Str(80, pack.recordingID));
    stream.write(Str(8, moment(pack.startTime).format("DD.MM.YY")));
    stream.write(Str(8, moment(pack.startTime).format("HH.mm.ss")));
    const headerBytes = 256 + (256 * pack.channelInfos.length); // class itself is 256 bytes, plus 256 per channel-info structure
    stream.write(Str(8, headerBytes));
    stream.write(Str(44, pack.reservedStr));
    stream.write(Str(8, pack.chunks.length));
    stream.write(Str(8, pack.chunkDuration));
    stream.write(Str(4, pack.channelInfos.length));
    pack.channelInfos.forEach(a => stream.write(Str(16, a.name)));
    pack.channelInfos.forEach(a => stream.write(Str(80, a.type)));
    pack.channelInfos.forEach(a => stream.write(Str(8, a.dimensions)));
    pack.channelInfos.forEach(a => stream.write(Str(8, a.physicalMin)));
    pack.channelInfos.forEach(a => stream.write(Str(8, a.physicalMax)));
    pack.channelInfos.forEach(a => stream.write(Str(8, a.digitalMin)));
    pack.channelInfos.forEach(a => stream.write(Str(8, a.digitalMax)));
    pack.channelInfos.forEach(a => stream.write(Str(80, a.prefilteringInfo)));
    pack.channelInfos.forEach(a => stream.write(Str(8, a.sampleCountPerChunk)));
    pack.channelInfos.forEach(a => stream.write(Str(32, a.reservedStr)));
}
export function AppendChunk(chunk, stream, channelInfos) {
    // Data stays in channels x samples configuration
    // 2 Byte signed int litte-endian, 2's complement
    const totalSamplesPerChunk = channelInfos.map(ch => ch.sampleCountPerChunk).reduce((total, a) => total + a, 0);
    const buffer = Buffer.alloc(totalSamplesPerChunk * 2, "base64"); // each sample is 2 bytes
    let offset = 0;
    for (const channelSamples of chunk.channelSamples) {
        for (const sample of channelSamples) {
            //buffer.writeInt16LE(parseInt(((sample * 32768) / 188000).toString()), offset);
            //buffer.writeInt16LE(Math.floor((sample * 32768) / 188000), offset);
            buffer.writeInt16LE(sample, offset);
            offset += 2;
        }
    }
    stream.write(buffer, "base64");
}
