const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAccount = users.find((account) => account.username === username);

  if (!userAccount) {
    return response.status(400).json({ error: "User not found" });
  }
  request.username = userAccount;
  return next();
}

function checksExistsTodo(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const userAccount = users.find((account) => account.username === username);

  if (userAccount) {
    const todo = userAccount.todos.find((todo) => todo.id === id);

    if (todo) {
      return next();
    }
  }
  return response.status(404).json({ error: "Todo not found" });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((account) => account.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const todos = username.todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  username.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { username } = request;
    const { id } = request.params;
    const { title, deadline } = request.body;

    username.todos.map((todo) => {
      if (todo.id === id) {
        (todo.title = title), (todo.deadline = new Date(deadline));
      }
      return response.status(201).json(todo);
    });
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { username } = request;
    const { id } = request.params;

    username.todos.map((todo) => {
      if (todo.id === id) {
        todo.done = true;
      }
      return response.status(201).json(todo);
    });
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { username } = request;
    const { id } = request.params;

    username.todos.splice(id, 1);

    return response.status(204).json(username.todos);
  }
);

module.exports = app;
