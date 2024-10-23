# Open Register Lambda

This Lambda function enables secure user registration by integrating DynamoDB for storing user details and S3 for
handling profile image uploads. It ensures that all user data, including passwords, is stored securely, while providing
an efficient way to manage profile pictures. Here's a breakdown of its core features:

![Screenshot 2024-10-22 at 10.04.17 PM.png](screenshots/apigateway/Screenshot%202024-10-22%20at%2010.04.17%E2%80%AFPM.png)

## Key Highlights

- **User Registration with DynamoDB**:
  The function registers new users by storing their details (name, email, address, password, and profile image URL) in
  DynamoDB. Each user is assigned a unique ID generated with UUID, ensuring a clean and scalable database structure.

- **Secure Password Handling with Bcrypt**:
  Passwords are hashed using bcrypt before being stored in DynamoDB, ensuring that user credentials remain protected.
  This encryption approach ensures your app adheres to modern security best practices.

- **Profile Image Uploads via Signed URL**:
  To handle profile image uploads, the function generates a pre-signed URL from S3, allowing users to upload their image
  securely and directly to an S3 bucket. This method ensures efficient file uploads without exposing the backend to
  large payloads.

- **Duplicate Email Prevention**:
  Before creating a new user, the function performs a DynamoDB scan to check if the email is already registered,
  ensuring that users cannot create multiple accounts with the same email address.

## How It Works

- **Input Validation**:
  The function validates that all required fields (name, email, address, password, fileName, and contentType) are
  provided. If any field is missing, a clear error message is returned to guide the user.

- **Image Upload URL Generation**:
  Using the S3 presigner service, the function creates a pre-signed URL that allows the user to upload their profile
  picture directly to S3. The URL expires after 60 seconds, ensuring secure, time-bound uploads.

- **Email Uniqueness Check**:
  The function scans DynamoDB for existing entries with the provided email address. If an email already exists, the
  function returns an error, preventing duplicate registrations.

- **Storing User Data in DynamoDB**:
  After verifying that the email is unique, the function creates a new user entry in DynamoDB with the user’s details,
  hashed password, and image URL. The user’s registration time is captured using the current timestamp (createdOn).

## Why This Lambda is Awesome

This Lambda function delivers a robust and secure registration process that integrates seamlessly with AWS services like
S3 and DynamoDB. By offering secure password handling, unique email validation, and efficient image uploads, it provides
the foundation for a modern, user-friendly, and scalable registration system. Perfect for applications looking to
balance performance with top-tier security.

### What's next ?

Check the [main](https://github.com/longbowou/open-frontend) repository this one is part of.

## Screenshot

![Screenshot 2024-10-22 at 9.48.34 PM.png](screenshots/lambda/Screenshot%202024-10-22%20at%209.48.34%E2%80%AFPM.png)

## License

This project is licensed under the [MIT License](LICENSE).






