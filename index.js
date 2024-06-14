require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Contact = require('./models/person');

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

app.use(morgan('tiny'));
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/info', (request, response) => {
  Contact.countDocuments({}).then(count => {
    const date = new Date();
    const info = `<p>Phonebook has info for ${count} people</p>
                  <p>${date}</p>`;
    response.send(info);
  });
});

app.get('/api/persons/:id', (request, response) => {
  Contact.findById(request.params.id).then(person => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  }).catch(error => {
    response.status(400).send({ error: 'malformatted id' });
  });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    });
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    });
  }

  const person = new Contact({
    name: body.name,
    number: body.number
  });

  person.save().then(savedPerson => {
    response.json(savedPerson);
  });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;

  Contact.findByIdAndDelete(id)
    .then(deletedPerson => {
      if (deletedPerson) {
        response.status(204).end();
      } else {
        response.status(404).send({ error: 'Person not found' });
      }
    })
    .catch(error => {
      response.status(400).send({ error: 'malformatted id' });
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});