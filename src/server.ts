import { Request, Response, Router } from "express";

const router: Router = Router();

type TUser = {
  name: string;
  todos: string[];
};

const users: TUser[] = [];

router.post("/add", (req: Request, res: Response) => {
  const { name, todo }: { name: string; todo: string } = req.body;
  let user: TUser | undefined = users.find((user) => user.name === name);
  if (user) {
    user.todos.push(todo);
  } else {
    user = { name, todos: [todo] };
    users.push(user);
  }
  res.send(`Todo added successfully for user ${name}.`);
});

export { router, TUser, users };

