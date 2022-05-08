const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

//use middleware ware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.duvmj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {

    await client.connect();
    const productCollection = client.db('nexus').collection('items');
    //products API
    app.get('/products', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const productsItem = await cursor.toArray();
      res.send(productsItem);
    });
    //ProductsId api
    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const update = await productCollection.findOne(query);
      res.send(update);
    });
    //update product quantity


    app.put('/quantity/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { ...user},
      };
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })

    //restock quantity
    app.put('/restock/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { ...user },
      };
      const result = await product.updateOne(filter, updateDoc, options);
      res.send(result)
    });

    //delete from manage inventory page
    app.delete('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })
    //add new items
    app.post('/products', async (req, res) => {
      const newService = req.body;
      const result = await productCollection.insertOne(newService);
      res.send(result);
    });


  }
  finally {

  }

}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Server is running');
});
app.listen(port, () => {
  console.log('crud is running');
});