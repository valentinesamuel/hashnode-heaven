import express, { NextFunction, Request, Response } from 'express';
import contextLogger from './logger/logger';
import { HashnodeController } from './controllers/hashnodeController';
import { SupabaseStorage } from './services/supabaseStorage';



const app = express();

app.use(express.json());

const port = 3000;

const hashnodeController = new HashnodeController()
const supabaseStorage = new SupabaseStorage();


app.get('/', async (req, res) => {


//  const ress =  await supabaseStorage.processImage('https://cdn.hashnode.com/res/hashnode/image/upload/v1729517181802/c721316b-09d7-4e44-9c11-b80b5f0ee8a2.png', 'test.jpg')
  const response = await hashnodeController.postArticlesToBePublished()

  console.log(response)

  res.json({ message: "response" });
});

// app.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
//   console.error(err);
// });

app.listen(port, () => {
  // setInterval(pollingService, AppConfig.pollingInterval);
  console.log(`Server running at http://localhost:${port}`);
});
