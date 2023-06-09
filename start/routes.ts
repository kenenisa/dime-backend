/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import fs from "fs";

Route.get('/', async () => {
  return { hi: "✋" }
})
Route.group(() => {
  Route.post("/create", 'AccountsController.create').middleware("webhook");
}).prefix('/account');

Route.group(() => {
  Route.get("/info/:address", 'AccountsController.info').middleware("webhook");
  Route.post("/send", 'TransactionsController.send').middleware("webhook");
  Route.get("/buy/:address", "TransactionsController.buy").middleware("webhook");
  Route.post("/loan", 'AccountsController.loan');
}).prefix('/wallet');

Route.get("/activity/:address/:days", "TransactionsController.activity").middleware("webhook");
Route.post("/vote", "AccountsController.vote").middleware("webhook");
Route.post("/webhook", "AccountsController.setWebhook").middleware("webhook");

Route.group(()=>{

  Route.get("/prediction","PredictionsController.getPredictionTraining")
  Route.post("/prediction","PredictionsController.postPredictionTraining")

  Route.get("/reserve","PredictionsController.getReserveTraining")
  Route.post("/reserve","PredictionsController.postReserveTraining")

}).prefix("/ml")

Route.get("/spec",()=>{
    return fs.readFileSync('./spec/index.html').toString()
})