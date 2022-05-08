const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { send } = require('express/lib/response');
const { decode } = require('jsonwebtoken');



const app = express();
const port = process.env.PORT || 5000;

//use middleware ware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.duvmj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {

    await client.connect();
    const productCollection = client.db('nexus').collection('items');
    const orderCollection = client.db('nexus').collection('order');

    //AUTH
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      });
      res.send({ accessToken });
    })
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
        $set: { ...user },
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
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    });

    //delete from manage inventory page
    app.delete('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })

    //delete from my item page
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })

    //add new items
    app.post('/products', async (req, res) => {
      const newService = req.body;
      const result = await productCollection.insertOne(newService);
      res.send(result);
    });

    //order collection api
    
    app.get('/order', verifyJWT, async (req, res) => {

      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
          const query = { email: email };
          const cursor = orderCollection.find(query);
          const orders = await cursor.toArray();
          res.send(orders)
      }
      else {
          res.status(403).send({ message: 'forbidden access' })
      }
  })

  app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result)
  })


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