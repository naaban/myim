import { Collection, Filter, FindOptions, ObjectId } from "mongodb"
import { DatabaseClient } from "./database";
import { CustomError } from "../model/error.model";

export interface ICollectionModel {
    dbName?: string, collectionName: string
}



export type CollectionTypes<T> = T;
