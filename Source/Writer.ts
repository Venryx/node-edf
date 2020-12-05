import * as fs from "fs";
import moment from "moment";
import {ChannelInfo, Chunk, EDFPackage} from "./EDFPackage";

export function WriteEDFPackage(pack: EDFPackage, stream: fs.WriteStream) {
	WriteEDFHeader(pack, stream);
	for (const chunk of pack.chunks) {
		AppendChunk(chunk, stream, pack.channelInfos);
	}
}

export function WriteEDFHeader(pack: EDFPackage, stream: fs.WriteStream) {
	stream.write(pack.edfVersion.toString().padEnd(8));
	stream.write(pack.patientID.padEnd(80));
	stream.write(pack.recordingID.padEnd(80));
	stream.write(moment(pack.startTime).format("DD.MM.YY"));
	stream.write(moment(pack.startTime).format("HH.mm.ss"));
	const headerBytes = 256 + (256 * pack.channelInfos.length); // class itself is 256 bytes, plus 256 per channel-info structure
	stream.write(headerBytes.toString().padEnd(8));
	stream.write(pack.reservedStr.padEnd(44));
	stream.write(pack.chunks.length.toString().padEnd(8));
	stream.write(pack.chunkDuration.toString().padEnd(8));
	stream.write(pack.channelInfos.length.toString().padEnd(4));
	pack.channelInfos.forEach(a=>stream.write(a.name.padEnd(16)));
	pack.channelInfos.forEach(a=>stream.write(a.type.padEnd(80)));
	pack.channelInfos.forEach(a=>stream.write(a.dimensions.padEnd(8)));
	pack.channelInfos.forEach(a=>stream.write(a.physicalMin.toString().padEnd(8)));
	pack.channelInfos.forEach(a=>stream.write(a.physicalMax.toString().padEnd(8)));
	pack.channelInfos.forEach(a=>stream.write(a.digitalMin.toString().padEnd(8)));
	pack.channelInfos.forEach(a=>stream.write(a.digitalMax.toString().padEnd(8)));
	pack.channelInfos.forEach(a=>stream.write(a.prefilteringInfo.toString().padEnd(80)));
	pack.channelInfos.forEach(a=>stream.write(a.sampleCountPerChunk.toString().padEnd(8)));
	pack.channelInfos.forEach(a=>stream.write(a.reservedStr.toString().padEnd(32)));
}

export function AppendChunk(chunk: Chunk, stream: fs.WriteStream, channelInfos: ChannelInfo[]) {
	// Data stays in channels x samples configuration
	// 2 Byte signed int litte-endian, 2's complement

	const totalSamplesPerChunk = channelInfos.map(ch=>ch.sampleCountPerChunk).reduce((total, a)=>total + a, 0);
	const buffer = Buffer.alloc(totalSamplesPerChunk * 2, "base64"); // each sample is 2 bytes

	let offset = 0;
	for (const channelSamples of chunk.channelSamples) {
		for (const sample of channelSamples) {
			buffer.writeInt16LE(Math.floor((sample * 32768) / 188000), offset);
			offset += 2;
		}
	}
	stream.write(buffer, "base64");
}