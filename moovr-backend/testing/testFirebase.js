const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || "moovr-73876";
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

const credPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ? process.env.GOOGLE_APPLICATION_CREDENTIALS
  : path.resolve(__dirname, "..", process.env.GOOGLE_APPLICATION_CREDENTIALS);

const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucketName
});

const { uploadImage } = require("../utils/firebaseStorage");

async function run() {
  console.log("Bucket name configured:", bucketName);
  try {
    const dummyBuffer = Buffer.from("test firebase upload");
    const url = await uploadImage(dummyBuffer);
    console.log("Upload test succeeded! URL:", url);
    process.exit(0);
  } catch (err) {
    console.error("Upload test failed:", err);
    process.exit(1);
  }
}

run();
