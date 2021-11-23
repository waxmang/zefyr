const {
  BlobServiceClient,
  BaseRequestPolicy,
  newPipeline,
  AnonymousCredential,
} = require('@azure/storage-blob');

const account = process.env.ACCOUNT_NAME || '';
const SAS = process.env.SAS || '';

// Create a policy factory with create() method provided
class RequestIDPolicyFactory {
  // Constructor to accept parameters
  constructor(prefix) {
    this.prefix = prefix;
  }

  // create() method needs to create a new RequestIDPolicy object
  create(nextPolicy, options) {
    return new RequestIDPolicy(nextPolicy, options, this.prefix);
  }
}

// Create a policy by extending from BaseRequestPolicy
class RequestIDPolicy extends BaseRequestPolicy {
  constructor(nextPolicy, options, prefix) {
    super(nextPolicy, options);
    this.prefix = prefix;
  }

  // Customize HTTP requests and responses by overriding sendRequest
  // Parameter request is WebResource type
  async sendRequest(request) {
    // Customize client request ID header
    request.headers.set('x-ms-version', `2020-02-10`);

    // response is HttpOperationResponse type
    const response = await this._nextPolicy.sendRequest(request);

    // Modify response here if needed

    return response;
  }
}

const pipeline = newPipeline(new AnonymousCredential());

// Inject customized factory into default pipeline
pipeline.factories.unshift(new RequestIDPolicyFactory('Prefix'));

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net${SAS}`,
  pipeline
);

const downloadFile = async (blobName) => {
  const containerClient = blobServiceClient.getContainerClient(
    process.env.CONTAINER_NAME
  );
  const blobClient = containerClient.getBlobClient(blobName);

  // Get blob content from position 0 to the end
  // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
  const downloadBlockBlobResponse = await blobClient.download();
  const downloaded = await streamToString(
    downloadBlockBlobResponse.readableStreamBody
  );

  return {
    contentMD5: downloadBlockBlobResponse.contentMD5,
    fileContents: downloaded,
  };
};

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}

module.exports = { blobServiceClient, downloadFile };
