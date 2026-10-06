import { app, prisma } from "./app.js";

const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () => {
  console.log(`API sur http://localhost:${PORT}`);
});

server.on("close", () => {
  void prisma.$disconnect();
});
