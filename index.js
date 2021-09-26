const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("build"));

let notes = [
	{
		id: 1,
		content: "HTML is easy",
		date: "2019-05-30T17:30:31.098Z",
		important: true,
	},
	{
		id: 2,
		content: "Browser can execute only Javascript",
		date: "2019-05-30T18:39:34.091Z",
		important: false,
	},
	{
		id: 3,
		content: "GET and POST are the most important methods of HTTP protocol",
		date: "2019-05-30T19:20:14.298Z",
		important: true,
	},
];

let persons = [
	{
		id: 1,
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: 2,
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: 3,
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: 4,
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

const requestLogger = (request, response, next) => {
	console.log("Method:", request.method);
	console.log("Path:  ", request.path);
	console.log("Body:  ", request.body);
	console.log("---");
	next();
};

app.use(requestLogger);

const generateId = () => {
	const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
	return maxId + 1;
};

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
	response.json(notes);
});

app.post("/api/notes", (request, response) => {
	const body = request.body;

	if (!body.content) {
		return response.status(400).json({
			error: "content missing",
		});
	}

	const note = {
		content: body.content,
		important: body.important || false,
		date: new Date(),
		id: generateId(),
	};

	notes = notes.concat(note);

	response.json(note);
});

app.get("/api/notes/:id", (request, response) => {
	const id = Number(request.params.id);
	const note = notes.find((note) => note.id === id);

	if (note) {
		response.json(note);
	} else {
		response.status(404).end();
	}
});

app.put("/api/notes/:id", (req, res) => {
	const id = Number(req.params.id);
	const body = req.body;

	const note = notes.find((note) => note.id === id);

	if (note) {
		// incorrect format
		if (body.content == null || body.important == null) {
			return res.status(400).json({
				error: "Note contents is missing",
			});
		}

		// delete note
		notes = notes.filter((note) => note.id !== id);

		// create note
		const note = {
			id: id,
			content: body.content,
			important: body.important,
			date: new Date(),
		};

		notes = notes.concat(note);

		res.json(note);
	} else {
		res.status(404).end();
	}
});

app.delete("/api/notes/:id", (request, response) => {
	const id = Number(request.params.id);
	notes = notes.filter((note) => note.id !== id);

	response.status(204).end();
});

app.get("/api/persons", (request, response) => {
	response.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
	const id = Number(req.params.id);

	const person = persons.find((person) => person.id === id);

	if (person) {
		res.json(person);
	} else {
		res.status(404).end();
	}
});

app.delete("/api/persons/:id", (req, res) => {
	const id = Number(req.params.id);

	persons = persons.filter((person) => person.id !== id);

	res.status(204).end();
});

app.post("/api/persons", (req, res) => {
	const id = Math.floor(Math.random() * 1000);

	const body = req.body;

	// content missing
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: "content missing",
		});
	}

	// name must be unique
	if (persons.filter((person) => person.name === body.name).length > 0) {
		return res.status(400).json({
			error: "name must be unique",
		});
	}

	const person = {
		id: id,
		name: body.name,
		number: body.number,
	};

	persons = persons.concat(person);

	res.json(persons);
});

app.get("/info", (req, res) => {
	const date = new Date(Date.now());
	const infoData = `<p>Phonebook has info for ${
		persons.length
	} people </p> <p>${date.toUTCString()}</p>`;
	res.send(infoData);
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
