"use client";

import { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdHorizontalRule,
  MdTitle,
  MdLink,
  MdUndo,
  MdRedo,
} from "react-icons/md";
import styles from "./ListingDescriptionEditor.module.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  controlStyle: React.CSSProperties;
  label?: string;
  required?: boolean;
  helperText?: string;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg border text-sm transition-colors disabled:opacity-40 ${
        active
          ? styles.toolbarBtnActive
          : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export function ListingDescriptionEditor({
  value,
  onChange,
  placeholder = "Scrie aici…",
  controlStyle,
  label = "Descriere",
  required = true,
  helperText = "Folosește bara de instrumente pentru formatări. Descrierea va apărea pe anunț cu același stil.",
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "px-4 py-3 text-sm text-black dark:text-foreground min-h-[180px]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresă URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="w-full min-h-[220px] rounded-xl border animate-pulse"
        style={controlStyle}
      />
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
        {required ? <span className="text-[#C25A2B] ml-0.5">*</span> : null}
      </label>
      <div
        className={`rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-[#C25A2B]/50 transition-all duration-300 ${styles.editorRoot}`}
        style={controlStyle}
      >
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-black/5 dark:border-white/10">
          <ToolbarButton
            title="Îngroșat"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <MdFormatBold size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <MdFormatItalic size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Subliniat"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <MdFormatUnderlined size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Tăiat"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
          >
            <MdStrikethroughS size={18} />
          </ToolbarButton>
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <ToolbarButton
            title="Titlu secțiune"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          >
            <MdTitle size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Subtitlu"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
          >
            <span className="text-xs font-bold px-0.5">H3</span>
          </ToolbarButton>
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <ToolbarButton
            title="Listă cu puncte"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <MdFormatListBulleted size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Listă numerotată"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <MdFormatListNumbered size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Citat"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            <MdFormatQuote size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Linie orizontală"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <MdHorizontalRule size={18} />
          </ToolbarButton>
          <ToolbarButton title="Link" onClick={setLink} active={editor.isActive("link")}>
            <MdLink size={18} />
          </ToolbarButton>
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <ToolbarButton
            title="Anulează"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <MdUndo size={18} />
          </ToolbarButton>
          <ToolbarButton
            title="Refă"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <MdRedo size={18} />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
        {helperText}
      </p>
    </div>
  );
}
