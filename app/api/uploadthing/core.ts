import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

async function requireUploadAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new UploadThingError("Neautorizat");
  }
  return { userId };
}

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 20,
    },
  })
    .middleware(requireUploadAuth)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
  documentUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(requireUploadAuth)
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
