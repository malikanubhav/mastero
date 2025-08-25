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

app.use(cors({ 
    origin: "http://localhost:5173",
    credentials:true,
})); 

app.use('/user',userRouter);
app.use('/skills',skillRouter);
app.use('/questions',questionRouter);
app.use('/quizzes',quizRouter);
app.use('/reports',reportRouter);


app.listen(777);