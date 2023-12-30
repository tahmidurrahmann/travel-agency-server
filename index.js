const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT | 5000;
require('dotenv').config()

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.glcj3l3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const offerCollection = client.db("travelAgency").collection("offers");
        const userCollection = client.db("travelAgency").collection("users");
        const bookingCollection = client.db("travelAgency").collection("bookings");

        app.get("/offers", async (req, res) => {
            const result = await offerCollection.find().toArray();
            res.send(result);
        })

        app.get("/offers/:id", async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: new ObjectId(id) };
            const result = await offerCollection.findOne(query);
            res.send(result);
        })

        app.post("/user", async (req, res) => {
            const userInfo = req?.body;
            const email = userInfo?.email;
            const query = { email: email };
            const checkRegisteredOrNot = await userCollection.findOne(query);
            if (checkRegisteredOrNot) {
                return res.send("User Already Exists")
            }
            const result = await userCollection.insertOne(userInfo);
            res.send(result);
        })

        app.get("/bookings", async (req, res) => {
            const result = await bookingCollection.find().toArray();
            res.send(result);
        })

        app.get("/bookings/:email", async (req, res) => {
            const email = req?.params?.email;
            const query = { userEmail: email };
            const result = await bookingCollection.findOne(query);
            res.send(result);
        })

        app.post("/bookingInfo", async (req, res) => {
            const bookingInfo = req?.body;
            const tripName = bookingInfo?.tripName;
            const result = await bookingCollection.insertOne(bookingInfo);
            if (result?.insertedId) {
                const query = { tripName: tripName };
                const tripInfo = await offerCollection.findOne(query);
                const totalAvailability = tripInfo?.availability;
                const filter = { tripName: tripName };
                const updateDoc = {
                    $set: {
                      availability : totalAvailability - 1,
                    },
                  };
                const remainingAvailability = await offerCollection.updateOne(filter,updateDoc)
                res.send(result);
            }
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Travel Agency is Traveling")
})

app.listen(port, () => {
    console.log(`Travel Agency is Traveling on port ${port}`);
})