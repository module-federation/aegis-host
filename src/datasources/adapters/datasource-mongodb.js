// const { MongoClient } = require("mongodb");
// 2	
// 3	// Replace the uri string with your MongoDB deployment's connection string.
// 4	const uri = "mongodb+localhost://tyson:secret@localhost:49154";
// 6	
// 7	const client = new MongoClient(uri);
// 8	
// 9	async function run() {
// 10	  try {
// 11	    await client.connect();
// 12	
// 13	    const database = client.db("fedmon");
// 14	    const collection = database.collection("movies");
// 15	
// 16	    // create a filter for a movie to update
// 17	    const filter = { title: "Blacksmith Scene" };
// 18	
// 19	    // this option instructs the method to create a document if no documents match the filter
// 20	    const options = { upsert: true };
// 21	
// 22	    // create a document that sets the plot of the movie
// 23	    const updateDoc = {
// 24	      $set: {
// 25	        plot:
// 26	          "Blacksmith Scene is a silent film directed by William K.L. Dickson",
// 27	      },
// 28	    };
// 29	
// 30	    const result = await collection.updateOne(filter, updateDoc, options);
// 31	    console.log(
// 32	      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
// 33	    );
// 34	  } finally {
// 35	    await client.close();
// 36	  }
// 37	}
// 38	run().catch(console.dir);


// // db.createUser(
// //   {
// //     user: "tyson",
// //     pwd: "secret",  
// //     roles: [ "readWrite", "dbAdmin" ]
// //   }
// // )