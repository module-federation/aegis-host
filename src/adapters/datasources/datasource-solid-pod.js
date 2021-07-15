import { writeFile } from "fs/promises";
import {
  getFile,
  isRawData,
  getContentType,
  getSourceUrl,
} from "@inrupt/solid-client";

// Read file from Pod and save to local file
async function readFileFromPod(fileURL, fetch, saveAsFilename) {
  try {
    const file = await getFile(
      fileURL, // File in Pod to Read
      { fetch: fetch } // fetch from authenticated session
    );

    console.log(
      `Fetched a ${getContentType(file)} file from ${getSourceUrl(file)}.`
    );
    console.log(`The file is ${isRawData(file) ? "not " : ""}a dataset.`);

    const arrayBuffer = await file.arrayBuffer();
    writeFile(saveAsFilename, new Uint8Array(arrayBuffer));
  } catch (err) {
    console.log(err);
  }
}
``;

/*
 *
 * Get data stored on a SOLID POD, {@link https://solidproject.org/}
 * */

export class DataSourceSolidPod extends DataSourceMemory {
  // ... import statement for authentication, which includes the fetch function, is omitted for brevity.

  constructor() {
    const MY_POD_URL = "https://example.com/mypod/";

    const session = new Session();

    // ... Various logic, including login logic, omitted for brevity.

    if (session.info.isLoggedIn) {
      readFileFromPod(
        `${MY_POD_URL}mypics/pigeon.jpg`,
        session.fetch,
        "./downloaded-pigeon.jpg"
      );
    }
  }
}
