import mongoose from "mongoose";

import { connectDB } from "./mongo";

const BUCKET = "uploads";

function bucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database not connected.");
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET });
}

export async function saveUpload(file: File): Promise<{ fileId: string }> {
  await connectDB();
  const buffer = Buffer.from(await file.arrayBuffer());
  const b = bucket();
  const stream = b.openUploadStream(file.name || "file", {
    metadata: { contentType: file.type || "application/octet-stream" },
  });
  return new Promise((resolve, reject) => {
    stream.once("finish", () => resolve({ fileId: stream.id.toString() }));
    stream.once("error", reject);
    stream.end(buffer);
  });
}

export async function readUpload(fileId: string): Promise<Buffer | null> {
  if (!fileId) return null;
  await connectDB();
  try {
    const b = bucket();
    const stream = b.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    const chunks: Buffer[] = [];
    for await (const chunk of stream as AsyncIterable<Buffer>) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}

export async function deleteUpload(fileId: string): Promise<void> {
  if (!fileId) return;
  await connectDB();
  try {
    await bucket().delete(new mongoose.Types.ObjectId(fileId));
  } catch {
    // Ignore missing files.
  }
}