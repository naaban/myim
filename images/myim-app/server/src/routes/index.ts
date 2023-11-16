import * as express from "express";


export class IndexRoute {

  public index(request: express.Request, response: express.Response, next: express.NextFunction) {
    response.send({message : 'Welcome to PG Management Tool'});
  }
}
