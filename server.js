import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/demo';
const databaseName = 'demo';
const collectionName = 'users';

const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format.' });
  }

  try {
    const db = mongoClient.db(databaseName);
    const users = db.collection(collectionName);

    const user = await users.findOne({
      _id: new ObjectId(userId),
      age: { $gt: 21 }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or underage.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Something went wrong:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

mongoClient.connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
