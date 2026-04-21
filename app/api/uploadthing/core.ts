import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 20,
    },
  }).onUploadComplete(async ({ file }) => {
    // Poți salva aici informații despre fișier în DB dacă ai nevoie
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
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url, name: file.name };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

