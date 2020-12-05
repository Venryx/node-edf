/// <reference types="node" />
import * as fs from "fs";
import { ChannelInfo, Chunk, EDFPackage } from "./EDFPackage";
export declare function WriteEDFPackage(pack: EDFPackage, stream: fs.WriteStream): void;
export declare function WriteEDFHeader(pack: EDFPackage, stream: fs.WriteStream): void;
export declare function AppendChunk(chunk: Chunk, stream: fs.WriteStream, channelInfos: ChannelInfo[]): void;
