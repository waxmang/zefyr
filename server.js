const express = require('express');
const connectToDb = require('./config/db');

const app = express();
const port = process.env.PORT || 5001;

connectToDb();

app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('API Running');
});

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/closet', require('./routes/api/closets'));
app.use('/api/categories', require('./routes/api/categories'));
app.use('/api/items', require('./routes/api/items'));
app.use('/api/trips', require('./routes/api/trips'));

app.listen(port, () => console.log(`Server started on port ${port}`));
