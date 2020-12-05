// (class overall takes 256 chars/bytes, excluding the channelInfos array)
export class EDFPackage {
	constructor(data?: Partial<Omit<EDFPackage, "edfVersion">>) {
		Object.assign(this, data);
	}

	//edfVersion: number; // (8)
	get edfVersion() { return 0; }

	/** The code by which the patient is known in the hospital administration.
	- sex (English, so F or M)
	- birthdate in dd-MMM-yyyy format using the English 3-character abbreviations of the month in capitals; 02-AUG-1951 is OK, while 2-AUG-1951 is not
	- the patients name */
	patientID: string; // (80)

	/** String identifying the specific recording/session. Common contents:
	- The startdate itself in dd-MMM-yyyy format using the English 3-character abbreviations of the month in capitals.
	- The hospital administration code of the investigation, i.e. EEG number or PSG number.
	- A code specifying the responsible investigator or technician.
	- A code specifying the used equipment. */
	recordingID: string; // (80)

	startTime: number; // ms since epoch (16)
	reservedStr: string; // (44)
	//chunkCount: number; // -1 for unknown (8)
	get chunkCount() { return this.chunks.length; } // (8)
	chunkDuration: number; // in ms (8)

	GetChannelSamplesPerSecond(channelIndex: number) {
		return this.channelInfos[channelIndex].sampleCountPerChunk / this.chunkDuration;
	}

	// (4 chars for channel-count; see class for chars per channel)
	channelInfos: ChannelInfo[];

	// (see class for chars per chunk)
	chunks: Chunk[];
}
// (class overall takes 256 chars/bytes)
export class ChannelInfo {
	constructor(data?: Partial<ChannelInfo>) {
		Object.assign(this, data);
	}

	name: string; // (16)
	type: string; // ex: "Gold spring electrode" (80)
	dimensions: string; // ex: "uV" (8)
	physicalMin: number; // ex: -32768 (8)
	physicalMax: number; // ex: 32767 (8)
	digitalMin: number; // ex: -32768 (8)
	digitalMax: number; // ex: 32767 (8)
	prefilteringInfo: string; // ex: "HP:0.1Hz LP:75Hz N:50Hz" (80)
	sampleCountPerChunk: number; // (8)
	reservedStr: string; // (32)
}

export class Chunk {
	constructor(data?: Partial<Chunk>) {
		Object.assign(this, data);
	}
	channelSamples: ChannelSamplesInChunk[];
}
// for the given channel, this array's length must match the channel's specified "sampleCountPerChunk" value (in the header)
export type ChannelSamplesInChunk = number[];

// prefiltering info
// ==========

export type FilterInfo = {
	type: "None" | "Bandpass" | "Highpass" | "Lowpass";
	cutoffFrequency: number;
}
export function GeneratePrefilteringInfoStr(bandFilterInfo: FilterInfo, notchFilterInfo: FilterInfo) {
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