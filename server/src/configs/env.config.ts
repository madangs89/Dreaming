import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

console.log(`PORT: ${PORT}`);
if (!PORT) {
  console.error("Error: PORT environment variable is not set");
}

export { PORT };
