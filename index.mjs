import {DynamoDBClient, PutItemCommand, ScanCommand} from "@aws-sdk/client-dynamodb";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs';

const region = process.env.AWS_REGION;

const dynamoDbClient = new DynamoDBClient({region});
const s3Client = new S3Client({region});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME;

export const handler = async (event) => {
    try {
        const {
            name,
            email,
            address,
            password,
            fileName,
            contentType
        } = JSON.parse(event.body);

        if (!name || !email || !address || !fileName || !contentType || !password) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({message: 'All fields are required'}),
            };
        }

        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: fileName,
            ContentType: contentType,
        };
        const command = new PutObjectCommand(uploadParams);
        const uploadURL = await getSignedUrl(s3Client, command, {expiresIn: 60});
        const imageUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`

        const scanParams = {
            TableName: DYNAMO_TABLE_NAME,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': {S: email}
            }
        };

        const data = await dynamoDbClient.send(new ScanCommand(scanParams));
        console.log(data)
        if (data.Count > 0) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({errors: [{field: "email", message: "Email already registered."}]}),
            };
        }

        const id = uuidv4();
        const createdOn = new Date().toISOString()

        const putParams = {
            TableName: DYNAMO_TABLE_NAME,
            Item: {
                id: {S: id},
                name: {S: name},
                email: {S: email},
                address: {S: address},
                imageUrl: {S: imageUrl},
                password: {S: bcrypt.hashSync(password, 10)},
                createdOn: {S: createdOn},
            },
        };

        await dynamoDbClient.send(new PutItemCommand(putParams));

        const user = {
            id,
            name,
            email,
            address,
            imageUrl,
            createdOn,
        };

        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                errors: [],
                user,
                uploadURL,
            }),
        };
    } catch (error) {
        console.error('Error registering user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({message: 'Internal Server Error'}),
        };
    }
};