import { DataSourceFile } from ".";
// import auth from "solid-auth-cli";
// import FC from "solid-file-client";

const credentials = {
  idp: process.env.SOLID_POD_IDP, // "https://pod.inrupt.com",
  username: process.env.SOLID_POD_USER,
  password: process.env.SOLID_POD_PASS,
};

// const fc = new FC(auth);

const PODURL = "https://pod.inrupt.com/tysonrm/models/";

async function login() {
  // let session = await auth.currentSession();
  // if (!session) {
  //   session = await auth.login(credentials);
  // }
  // console.log(`Logged in as ${session.webId}.`);
}

/**
 * Get data stored on a SOLID POD, {@link https://solidproject.org/}
 */
export class DataSourceSolidPod extends DataSourceFile {
  // ... import statement for authentication, which includes the fetch function, is omitted for brevity.
  constructor(dataSource, factory, name) {
    super(dataSource, factory, name);
    // this.file = PODURL + name + ".json";
    // console.log(this.file);
    // login().then(() => console.log(`logged into pod ${PODURL}`));
  }

  readFile(hydrate) {
    // try {
    //   if (fc.itemExists(this.file)) {
    //     const data = fc.readFile(this.file);
    //     return hydrate(new Map(JSON.parse(data), this.revive));
    //   }
    // } catch (e) {
    //   console.error(e);
    // }
  }

  writeFile() {
    //fc.writeFile(this.file, JSON.stringify([...this.dataSet]));
  }
}
