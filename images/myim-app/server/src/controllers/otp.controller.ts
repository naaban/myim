import { CustomRequest } from "../model/request.model";
import express from 'express';
import { ResponseHandler } from "../utils/response.handler";
import { InsertOneResult, ObjectId, UpdateResult } from "mongodb";
import { Status } from "../model/status.model";
import { CustomError } from "../model/error.model";
export module OtpController {
    export async function generateOtp(request: CustomRequest, response: express.Response, next: express.NextFunction) {

        const responseHandler = new ResponseHandler(response)

        try {

            const otpResponse = await request.collection?.findOne({
                userId: request.user.id,
                expiresAt: {
                    $lt: new Date()
                }
            }, request.selectedFields);
            if (!otpResponse) {
                const min = 100000; // Minimum 6-digit number
                const max = 999999; // Maximum 6-digit number
                const { insertedId }: InsertOneResult = await request.collection?.insertOne({ expiresAt: new Date(new Date().getTime() + 10 * 60000), otp: Math.floor(Math.random() * (max - min + 1)) + min }) as InsertOneResult;
                const otpResponse = await request.collection?.findOne({
                    _id: new ObjectId(insertedId)
                }, request.selectedFields);
                responseHandler.injectInResponse(response, otpResponse);
            }
            else {
                responseHandler.handleSuccess(otpResponse);
            }
        }
        catch (err) {
            responseHandler.handleFailure(err);
        }
    }

    export async function verifyOtp(request: CustomRequest, response: express.Response, next: express.NextFunction) {
        const responseHandler = new ResponseHandler(response)
        try {
            const { acknowledged, upsertedId, modifiedCount }: UpdateResult = await request.collection?.updateOne({
                userId: request.user.userId,
                otp: request.body.otp | 0,
                expiresAt: {
                    $lt: new Date()
                }
            }, {
                $set: {
                    status: Status.VERIFIED
                }
            }) as UpdateResult;


            if (modifiedCount) {
                delete request.selectedFields.id;
                const data = await request.collection?.findOne({ _id: request.params.id! as any }, { projection: request.selectedFields });
                responseHandler.handleSuccess({ message: 'Otp verified!!' });
            }
            else {
                responseHandler.handleFailure(new CustomError({ code: "OtpVerificationFailed" }));
            }

        }
        catch (err) {

            responseHandler.handleFailure(err);
        }



    }


}  
