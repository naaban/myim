import { Collection, Filter } from 'mongodb';
import { Request } from 'express';
import { CollectionTypes } from '../utils/collection';
export interface CustomRequest extends Request {
    isAuthenticated?: boolean;
    user?: any,
    isAggregator? : boolean;
    aggrPipeline?: any[],
    findQuery?: Filter<{}>;
    limit?: number;
    offset?: number;
    selectedFields?: any;
    collection?: Collection;
}

