import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';
import { HashnodeController } from './controllers/hashnodeController';



const app = express();

app.use(express.json());

const port = 3000;

const hashnodeController = new HashnodeController()


app.get('/', async (req, res) => {



  const response = await hashnodeController.postArticlesToBePublished()

  console.log(response)

  res.json({ message: response });
});

// app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
//   console.error(err);
// });

app.listen(port, () => {
  // setInterval(pollingService, AppConfig.pollingInterval);
  console.log(`Server running at http://localhost:${port}`);
});
