//import IPFS from "ipfs-core/src/components";
//import fs from "fs";
import { DataSourceFile } from ".";

/**
 * Storage on the distributed web {@link https://ipfs.io}
 */
export class DataSourceIpfs extends DataSourceFile {
  constructor(dataSource, factory, name) {
    super(dataSource, factory, name);
  }

  // async readFile(hydrate) {
  //   if (fs.existsSync(this.name)) {
  //     const cid = fs.readFileSync(this.name, "utf-8");
  //     const node = await IPFS.create();
  //     const stream = node.cat(cid);
  //     for await (const chunk of stream) {
  //       // chunks of data are returned as a Buffer, convert it back to a string
  //       data += chunk.toString();
  //     }
  //     return hydrate(new Map(JSON.parse(data), this.revive)) || new Map();
  //   }
  //   return new Map();
  // }

  // async writeFile() {
  //   const node = await IPFS.create();
  //   // add your data to to IPFS - this can be a string, a Buffer,
  //   // a stream of Buffers, etc
  //   const results = node.add(JSON.stringify([...this.dataSource]));

  //   // we loop over the results because 'add' supports multiple
  //   // additions, but we only added one entry here so we only see
  //   // one log line in the output
  //   for await (const { cid } of results) {
  //     // CID (Content IDentifier) uniquely addresses the data
  //     // and can be used to get it again.
  //     console.log(cid.toString());
  //   }
  //   fs.writeFileSync(this.name, cid.toString());
  // }
}
