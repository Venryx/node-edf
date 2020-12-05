# Node EDF

NodeJS library for reading and writing EDF files. (WIP)

### Installation

```
npm install node-edf --save-exact
```

The `--save-exact` flag is recommended (to disable version-extending), since this package uses [Explicit Versioning](https://medium.com/sapioit/why-having-3-numbers-in-the-version-name-is-bad-92fc1f6bc73c) (`Release.Breaking.FeatureOrFix`) rather than SemVer (`Breaking.Feature.Fix`).

For `FeatureOrFix` version-extending (recommended for libraries), prepend "`~`" in `package.json`. (for `Breaking`, prepend "`^`")

### Usage

```
import {EDFPackage, WriteEDFHeader, WriteEDFPackage, AppendChunk, ChannelInfo, Chunk} from "node-edf";

function ExportNightEEGData(sessionFolderName: string, exportChannelsInOneFile = true) {
	const path = GetSessionFolderPath(sessionFolderName); // project-specific
	console.log(`Starting export of session: ${sessionFolderName}`);
	
	// project-specific
	const sessionInfo = JSON.parse(ReadFileTextSync_Safe(paths.join(path, "SessionInfo.json")) ?? `{}`)
	const data = {
		Forehead_Left: new Float32Array(GetEEGSamples("EEG_Left.json")),
		Forehead_Right: new Float32Array(EEGDataToArray(rightEEG, false, 0)),
		Ear_Left: new Float32Array(EEGDataToArray(leftEarEEG, false, 0)),
		Ear_Right: new Float32Array(EEGDataToArray(rightEarEEG, false, 0)),
	};

	if (exportChannelsInOneFile) {
		const exportFolder = GetSessionSubPath(sessionFolderName, "Export_SleepApp"); // project-specific
		fs.mkdirSync(exportFolder, {recursive: true}); // marked recursive, just so doesn't error if folder already exists

		const pack = new EDFPackage({
			patientID: "User_Unknown",
			recordingID: `Folder_${sessionFolderName}`,
			startTime: sessionInfo.startTime,
			chunkDuration: 30, // 30 seconds per chunk
			channelInfos: [
				CreateChannelInfo({name: "Forehead_Left"}),
				CreateChannelInfo({name: "Forehead_Right"}),
				CreateChannelInfo({name: "Ear_Left"}),
				CreateChannelInfo({name: "Ear_Right"}),
			],
			chunks: [],
		});

		const stream = fs.createWriteStream(paths.join(exportFolder, "EEGData.edf"));
		//WriteEDFHeader(pack, stream);

		const samplesPerChunk = pack.channelInfos[0].sampleCountPerChunk;
		for (let chunkI = 0; ; chunkI++) {
			const sampleStartI = chunkI * samplesPerChunk;
			const sampleEndI = sampleStartI + samplesPerChunk;
			if (sampleEndI >= data.Ear_Left.length) break;

			const channelSamples = [] as number[][];
			for (const channel of pack.channelInfos) {
				const samplesForThisChannel = [] as number[];
				for (let i = sampleStartI; i < sampleEndI; i++) {
					samplesForThisChannel.push(data[channel.name][i]);
				}
				channelSamples.push(samplesForThisChannel);
			}
			const chunk = new Chunk({
				channelSamples,
			});
			pack.chunks.push(chunk);

			//AppendChunk(chunk, stream, pack.channelInfos);
			console.log(`Wrote chunk ${chunkI}.`);
		}

		WriteEDFPackage(pack, stream);
		stream.close();
	} else {
		// channel-per-file exporting example not yet written
	}
}

function CreateChannelInfo(data: Partial<ChannelInfo>) {
	const data_final = E(
		{
			type: "MuseS",
			dimensions: "unknown",
			physicalMin: -32768,
			physicalMax: 32767,
			digitalMin: -1000,
			digitalMax: 1000,
			prefilteringInfo: "unknown",
			sampleCountPerChunk: 256 * 30,
		},
		data,
	);
	return new ChannelInfo(data_final);
}
```