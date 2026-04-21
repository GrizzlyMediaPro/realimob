"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { StyleField } from "@uploadthing/shared";
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const BaseUploadButton = generateUploadButton<OurFileRouter>();
const BaseUploadDropzone = generateUploadDropzone<OurFileRouter>();

const { useUploadThing } = generateReactHelpers<OurFileRouter>();
export { useUploadThing };

/** Texte implicite pentru linia „tipuri permise” când nu e suprascris `content.allowedContent`. */
const DEFAULT_ALLOWED_BY_ENDPOINT: Record<keyof OurFileRouter, string> = {
  imageUploader: "Imagini (max. 16 MB, până la 20 de fișiere)",
  documentUploader: "Imagine sau PDF (max. 8 MB)",
};

const DEFAULT_DROPZONE_LABEL: Record<keyof OurFileRouter, string> = {
  imageUploader: "Trage imaginile aici sau dă click pentru a selecta",
  documentUploader: "Trage fișierul aici sau dă click pentru a selecta",
};

type ButtonArgs = {
  ready: boolean;
  isUploading: boolean;
  uploadProgress: number;
  fileTypes: string[];
  files: File[];
};

type DropzoneArgs = ButtonArgs & { isDragActive: boolean };

function resolveContent<T>(
  field: string | ReactNode | ((args: T) => ReactNode) | undefined,
  args: T
): ReactNode | null {
  if (field === undefined) return null;
  if (typeof field === "function") return field(args);
  return field;
}

function mergeClassParts(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").trim();
}

/** Combină clase Tailwind de bază (contrast luminos/întunecat) cu `appearance` din Uploadthing (string, funcție sau CSS inline). */
function mergeTailwindBase(
  base: string,
  field: StyleField<never> | undefined,
  args: never
): string | CSSProperties {
  if (field === undefined) return base;
  if (typeof field === "function") {
    const r = field(args);
    if (r !== null && typeof r === "object" && !Array.isArray(r)) {
      return r as CSSProperties;
    }
    return mergeClassParts(base, String(r ?? ""));
  }
  if (typeof field === "object" && field !== null) {
    return field as CSSProperties;
  }
  return mergeClassParts(base, field);
}

/** Apelat doar când ruta e gata și nu e în curs de încărcare (vezi wrapper-ele). */
function defaultButtonCaption(args: ButtonArgs): ReactNode | null {
  if (args.files.length > 0) {
    const n = args.files.length;
    return n === 1 ? "Încarcă fișierul" : `Încarcă cele ${n} fișiere`;
  }
  return "Alege fisier";
}

function mergeButtonContent(
  endpoint: keyof OurFileRouter,
  user?: {
    button?: string | ReactNode | ((args: ButtonArgs) => ReactNode);
    allowedContent?: string | ReactNode | ((args: ButtonArgs) => ReactNode);
    clearBtn?: string | ReactNode | ((args: ButtonArgs) => ReactNode);
  }
) {
  return {
    clearBtn: user?.clearBtn ?? "Elimină",
    allowedContent:
      user?.allowedContent ?? DEFAULT_ALLOWED_BY_ENDPOINT[endpoint],
    button: (args: ButtonArgs) => {
      if (!args.ready) return "Se încarcă…";
      if (args.isUploading) return null;
      const custom = resolveContent(user?.button, args);
      if (custom !== null && custom !== undefined && custom !== "") {
        return custom;
      }
      return defaultButtonCaption(args);
    },
  };
}

type ButtonAppearance = NonNullable<
  ComponentProps<typeof BaseUploadButton>["appearance"]
>;

function mergeButtonAppearance(user?: ButtonAppearance): ButtonAppearance {
  return {
    ...user,
    allowedContent: (args) =>
      mergeTailwindBase(
        "text-gray-800 dark:text-gray-200",
        user?.allowedContent,
        args as never
      ),
    clearBtn: (args) =>
      mergeTailwindBase(
        "text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-gray-100",
        user?.clearBtn,
        args as never
      ),
  };
}

function mergeDropzoneContent(
  endpoint: keyof OurFileRouter,
  user?: {
    uploadIcon?: string | ReactNode | ((args: DropzoneArgs) => ReactNode);
    label?: string | ReactNode | ((args: DropzoneArgs) => ReactNode);
    allowedContent?: string | ReactNode | ((args: DropzoneArgs) => ReactNode);
    button?: string | ReactNode | ((args: DropzoneArgs) => ReactNode);
  }
) {
  return {
    uploadIcon: user?.uploadIcon,
    label: (args: DropzoneArgs) => {
      if (!args.ready || args.isUploading) return "Se încarcă…";
      const custom = resolveContent(user?.label, args);
      if (custom !== null && custom !== undefined && custom !== "") {
        return custom;
      }
      return DEFAULT_DROPZONE_LABEL[endpoint];
    },
    allowedContent:
      user?.allowedContent ?? DEFAULT_ALLOWED_BY_ENDPOINT[endpoint],
    button: (args: DropzoneArgs) => {
      if (!args.ready) return "Se încarcă…";
      if (args.isUploading) return null;
      const custom = resolveContent(user?.button, args);
      if (custom !== null && custom !== undefined && custom !== "") {
        return custom;
      }
      return defaultButtonCaption(args);
    },
  };
}

type DropzoneAppearance = NonNullable<
  ComponentProps<typeof BaseUploadDropzone>["appearance"]
>;

function mergeDropzoneAppearance(user?: DropzoneAppearance): DropzoneAppearance {
  return {
    ...user,
    uploadIcon: (args) =>
      mergeTailwindBase(
        "text-gray-700 dark:text-gray-200",
        user?.uploadIcon,
        args as never
      ),
    label: (args) =>
      mergeTailwindBase(
        args.ready
          ? "text-gray-900 dark:text-gray-100 hover:text-[#C25A2B] dark:hover:text-orange-300"
          : "text-gray-500 dark:text-gray-400",
        user?.label,
        args as never
      ),
    allowedContent: (args) =>
      mergeTailwindBase(
        "text-gray-800 dark:text-gray-200",
        user?.allowedContent,
        args as never
      ),
  };
}

type EndpointKey = keyof OurFileRouter;

export function UploadButton(
  props: Omit<ComponentProps<typeof BaseUploadButton>, "content" | "appearance"> & {
    endpoint: EndpointKey;
    content?: ComponentProps<typeof BaseUploadButton>["content"];
    appearance?: ComponentProps<typeof BaseUploadButton>["appearance"];
  }
) {
  const { content, appearance, ...rest } = props;
  return (
    <BaseUploadButton
      {...rest}
      content={mergeButtonContent(props.endpoint, content)}
      appearance={mergeButtonAppearance(appearance)}
    />
  );
}

export function UploadDropzone(
  props: Omit<ComponentProps<typeof BaseUploadDropzone>, "content" | "appearance"> & {
    endpoint: EndpointKey;
    content?: ComponentProps<typeof BaseUploadDropzone>["content"];
    appearance?: ComponentProps<typeof BaseUploadDropzone>["appearance"];
  }
) {
  const { content, appearance, ...rest } = props;
  return (
    <BaseUploadDropzone
      {...rest}
      content={mergeDropzoneContent(props.endpoint, content)}
      appearance={mergeDropzoneAppearance(appearance)}
    />
  );
}
