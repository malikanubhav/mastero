import express from "express";
import helmet from "helmet";
import userRouter from "./routes/user.js";
import skillRouter from "./routes/skill.js"
import questionRouter from "./routes/questions.js"
import quizRouter from "./routes/quiz.js"
import reportRouter from "./routes/report.js";
import cors from "cors";

const app = express();
app.use(helmet());
app.use(express.json());
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.WEB_ORIGIN
  ].filter(Boolean);
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }));

app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error("CORS not allowed"), false);
      },
      credentials: true
    })
  );

app.use('/user', userRouter);
app.use('/skills', skillRouter);
app.use('/questions', questionRouter);
app.use('/quizzes', quizRouter);
app.use('/reports', reportRouter);

app.use("/health", (req, res) => {
     res.json({});
});
app.listen(777);


// app.listen(777, "0.0.0.0", () => {
//     console.log(`API listening on http://0.0.0.0:777`);
// });

const port = process.env.PORT || 777;
const host = "0.0.0.0";            // <- DO NOT use "localhost" here
app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});