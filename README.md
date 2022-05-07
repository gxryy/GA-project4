# A la cloud

A la cloud was developed for my General Assembly Software Engineering Immersive Capstone Project built using the PERN stack with Tailwind CSS for styling. A la cloud is a credit based multi user basic file hosting application that uses AWS Cognito as the Identity provider and AWS S3 for file hosting.

# Features

- User sign up, log in, email OTP verification
- Multi file uploads
- File download
- Folder creation
- Delete file
- Public file sharing with with unique link and custom expiry date.
- Revoke / modify sharing link expiry date with user management tool.
- Credit Top up
- Credit monitoring tool
- Storage usage monitoring tool

# SDKs and References

- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)
- [Amazon Cognito Identity SDK for JavaScript](https://github.com/aws-amplify/amplify-js/tree/master/packages/amazon-cognito-identity-js)
- [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

# Tech

## React (FrontEnd)

- NavBar

  - Houses the registration, login and verify logic on top of serving as a navigation tool.

  - Sign In handler connects directly to AWS cognito to obtain JWT access, ID and refresh token upon successful login.
  - Registration handler posts signup details to /register endpoint which connects to cognito and postgres.
  - OTP verification and resend handler contains the logic for verifying and resending OTP respectively with cognito.

- Drive

  - Main page that contains the storage used, credits remaining and parent component and context provider for FileExplorer. Current storage used and credits remaining is retrieved by making a call to /drive/getStorageUsed and /drive/getcredits endpoint respectively

- FileExplorer
  - Contains the logic for getting objects and rendering as files and folders, back function, folder creation, download, upload and share functionality.
  - Objects in a directory is obtained by calling the /drive/getFileList endpoint
  - Folders are created by calling the /drive/createFolder endpoint.
  - backHandler splits the cwd on '/' and removes the last element before querying getFileList with the new working directory.
  - download is acheieved by calling the /drive/download endpoint and receiving the response filestream as data blobs.
  - upload is achieved by calling the /drive/upload endpoint as a multipart/form-data for every file in the selected filelist.
  - Share link is obtained by calling the /drive/getsharelink endpoint with the filename and expiry date.
- Share Manager
  - Allows for user to view all current shared link by calling /drive/getallsharedlink endpoint.
  - contains the logic for edit expiry date and deleting the shared link, which make post requests to /drive/editlinkexpiry and /drive/deletelink endpoints.
- Home
  - Landing page for the app
- CreditHistory
  - Contains the logic to render the current credit and its history by calling the /drive/getcredits and /drive/getcredithistory endpoint
- UsageHistory
  - component that allows for user to select the month year for which they would like to query their usage.
  - /getMonthUsage is then called with the respective month
- TopUp

  - create a post request to /drive/topup to simulate an approved topup from the user.

- SharedDownload
  - Holds the logic to display the file name for public download by posting to /publicfiledetails with the url_uuid.
  - Public download functionality by calling /publicdownload with the url_uuid
  - Renders link expired page should server return status 400.

## Express (BackEnd)

- Main
  - Fetches the JSON Web Keys from amazon and updates JWKs.txt
- Controllers
  - driveController (authenticated with middleware) /drive/
  - main (not protected) /
- Middleware
  - checkJWTMiddleware which verifies the accessToken in line with AWS recommendation. [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)
  - Responds with status 404 if verification fails

### Endpoints

- /register (POST)

  - Creates user using Cognito SDK , then creates user and initial credit in the successful callback.

- /publicfiledetails (POST)

  - query database for validity of the file (valid uuid, not deleted and not expired)
  - returns the filename if uuid is valid

- /publicdownload (POST)

  - runs uuid check and returns the file.

- /getMonthUsage (POST)
  - query DB for specified month and returns usage history and average usage for that month

### Endpoints (protected with middleware)

- /drive/createFolder

  - touches a file with the given username and directory name with S3 putObject endpoint

- /drive/download

  - get a filestream of the respective object with s3 getObject and respond with a filestream

- /drive/upload

  - uploads file server with multer. which concurrently creates a filestream to S3 putObject. /uploads folder in express acts like a cache should s3 putObject fails.

- /drive/getsharelink

  - Generates a url_uuid for the file being shared.
  - Inserts url_uuid, s3 file key, expiry and download counter to the database shares table.

- /drive/delete

  - calls on S3 deleteObject endpoint with the filekey

- /drive/getFileList

  - gets the full array of objects in the current directory with S3 listObjectsV2 endpoint.
  - Returns a objectList array, folder list array and the current directory that was queried.

- /drive/getStorageUsed

  - Similar to getFileList, but sums the size of all objects in the root path for the user.
  - Returns total storage size used and total number of objects in the directory.

- /drive/getallsharedlink

  - queries DB shares table for url_uuid for user that is not deleted
  - Returns the url_uuid, link expiry, download count and creation date.

- /drive/editlinkexpiry

  - updates the shares table with new expiry date

- /drive/deletelink

  - set the isDeleted marker to true in the shares table

- /drive/getcredithistory

  - returns the query from DB credits table for all credit history of the user

- /drive/getcredits

  - similar to getcredithistory but returns a value of summed up credits.

- /drive/topup
  - Inserts an entry to to credits table with adjustment_type as "Top Up"

### System Fuctions / Endpoints

- /logstorageused (GET)

  - Meant to be a system function that is triggered daily
  - logs the currently used storage for all users. upsert function into the storages table

- /postBill (GET)
  - Meant to be a system function that is executed monthly to post bill that deducts a fixed amount of credits for the respective month.
  - Inserts into credits table with adjustment_type as "Monthly Bill"

## Postgres SQL (Database)

![Postgres ERD](/Media/drawSQL.png)

- Users table contains the user information with a unique username as the primary key
- Shares table contains information of the shared links with the link url_uuid as the primary key
- Credits table contains the information for all credit transactions with a running id as the primary key
- Storage table contains the information for all storage logs with a running id as the primary key.

## Known Issues

- Home component is blocking the NavBar compnent user icon menu.

## Future Works

- Delete Folder
- Multifile download with on the fly zipping
- Integrate with payment provider
- Reduce functionality for -ve credits
