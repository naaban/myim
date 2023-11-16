import jwt, { SignOptions, TokenExpiredError, VerifyOptions } from 'jsonwebtoken';
import { CustomError } from '../model/error.model';
import { StatusCodes } from 'http-status-codes';
import logger from './logger';



// Sample payload for demonstration purposes
export default class JWT {

    // Generate a JWT token with the payload and private key
    static generate(payload: any, expiresInMs?: number) {

        const signOptions: SignOptions = {
            algorithm: 'RS256', // RSASSA [ "RS256", "RS384", "RS512" ]
        };
        if (expiresInMs) {
            signOptions.expiresIn = expiresInMs! / 1000;
        }
        return jwt.sign(payload, process.env.SSL_PRIVATE_KEY as string, signOptions);
    };

    // Verify the JWT token with the public key
    static verifyAndDecode(token: string) {
        const verifyOptions: VerifyOptions = {
            algorithms: ['RS256'],
        };
        try {
            const publicKey = process.env.SSL_PUBLIC_KEY as string;
            const valid = jwt.verify(token, publicKey, verifyOptions);
            if (valid) {
                return jwt.decode(token, { complete: true })?.payload;
            } else {
                throw new CustomError({ code: 'InvalidToken', statusCode: StatusCodes.UNAUTHORIZED });
            }
        } catch (err) {
            logger.error(err)
            if (err instanceof TokenExpiredError) {
                throw new CustomError({ code: 'AccessTokenExpired', statusCode: StatusCodes.UNAUTHORIZED });
            } else {
                throw new CustomError({ code: 'InternalError', statusCode: StatusCodes.INTERNAL_SERVER_ERROR });
            }
        }
    }

}