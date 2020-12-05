export declare class EDFPackage {
    constructor(data?: Partial<Omit<EDFPackage, "edfVersion">>);
    get edfVersion(): number;
    /** The code by which the patient is known in the hospital administration.
    - sex (English, so F or M)
    - birthdate in dd-MMM-yyyy format using the English 3-character abbreviations of the month in capitals; 02-AUG-1951 is OK, while 2-AUG-1951 is not
    - the patients name */
    patientID: string;
    /** String identifying the specific recording/session. Common contents:
    - The startdate itself in dd-MMM-yyyy format using the English 3-character abbreviations of the month in capitals.
    - The hospital administration code of the investigation, i.e. EEG number or PSG number.
    - A code specifying the responsible investigator or technician.
    - A code specifying the used equipment. */
    recordingID: string;
    startTime: number;
    reservedStr: string;
    get chunkCount(): number;
    chunkDuration: number;
    GetChannelSamplesPerSecond(channelIndex: number): number;
    channelInfos: ChannelInfo[];
    chunks: Chunk[];
}
export declare class ChannelInfo {
    constructor(data?: Partial<ChannelInfo>);
    name: string;
    type: string;
    dimensions: string;
    physicalMin: number;
    physicalMax: number;
    digitalMin: number;
    digitalMax: number;
    prefilteringInfo: string;
    sampleCountPerChunk: number;
    reservedStr: string;
}
export declare class Chunk {
    constructor(data?: Partial<Chunk>);
    channelSamples: ChannelSamplesInChunk[];
}
export declare type ChannelSamplesInChunk = number[];
export declare type FilterInfo = {
    type: "None" | "Bandpass" | "Highpass" | "Lowpass";
    cutoffFrequency: number;
};
export declare function GeneratePrefilteringInfoStr(bandFilterInfo: FilterInfo, notchFilterInfo: FilterInfo): string;
