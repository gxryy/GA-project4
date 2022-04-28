const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
const AWS = require("aws-sdk");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// upload a file to s3
const uploadFile = async (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
    ServerSideEncryption: "AES256",
  };

  try {
    let response = await s3.putObject(uploadParams).promise();
    console.log(response);
    console.log(`successfully uploaded`);
    return response;
  } catch (err) {
    throw new Error(err);
  }
};
exports.uploadFile = uploadFile;

// download a file from s3
const getFileStream = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
};
exports.getFileStream = getFileStream;

const listObjects = (params) => {
  return new Promise(async (resolve, reject) => {
    let ContinuationToken = null;
    let objectList = [];
    let folderList = [];

    while (ContinuationToken || objectList.length == 0) {
      try {
        const response = await s3
          .listObjectsV2({ ...params, Bucket: bucketName, ContinuationToken })
          .promise();
        ContinuationToken = response?.NextContinuationToken;
        objectList.push(...response.Contents);
        folderList.push(
          ...response?.CommonPrefixes.map((folder) => {
            let a = folder.Prefix.split("/");
            return a[a.length - 2];
          })
        );
      } catch (err) {
        reject(err);
        throw new Error(err);
      }
    }

    resolve({ objectList, folderList });
  });
};
exports.listObjects = listObjects;
