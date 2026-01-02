const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PW}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}`;

const mongoClient = new MongoClient(uri);

//console.log("/api/qtopics invoked...");

async function getTopics(){
	//console.log("getTopics invoked...");
  let result = [];
  await mongoClient.connect()
    .then(connection=>connection.db(process.env.MONGODB_DB))
	.then(db=>db.collection('quiz'))
	//.then(q=>q.find( {} ,  {projection: { title: 1} } ))
	.then(q=>q.aggregate(
				[ { $project: { _id: 1, topic: 1, cnt: { $size: "$quiz" } } } ]
			)
		)
    .then(cursor=>cursor.toArray())
    .then(listing=>{ result = listing.map(a=>{return {_id: a._id , topic: a.topic , cnt: a.cnt } } )})
    .catch(error => console.log(error))
	;
	//console.log(`getTopics :: ${result.map(e=> e.topic + " (" + e.cnt + ")").join(";")}`);
  return result;
}

async function fetchTopics (req, res) {
	//console.log("fetchTopics invoked...");
	
	try {
		const tps=await getTopics();
		res.status(200).json({topics: tps});
	} catch (error) {
        res.status(500).json({ message: error.message })
    }
	
}

module.exports = fetchTopics;