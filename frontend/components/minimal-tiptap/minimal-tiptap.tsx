import type { Content, Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import * as React from "react";

import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

import { LinkBubbleMenu } from "./components/bubble-menu/link-bubble-menu";
import { MeasuredContainer } from "./components/measured-container";
import { SectionFive } from "./components/section/five";
import { SectionFour } from "./components/section/four";
import { SectionOne } from "./components/section/one";
import { SectionTwo } from "./components/section/two";
import { useDebounce } from "./hooks/use-debounce";
import type { UseMinimalTiptapEditorProps } from "./hooks/use-minimal-tiptap";
import { useMinimalTiptapEditor } from "./hooks/use-minimal-tiptap";
import "./styles/index.css";

export interface MinimalTiptapProps extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
}

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="shrink-0 overflow-x-auto border-b p-2 group-data-[focused=true]:block">
    <div className="flex w-max items-center">
      <SectionOne editor={editor} activeLevels={[1, 2, 3, 4, 5, 6]} />

      <Separator orientation="vertical" className="mx-1 h-7" />

      <SectionTwo
        editor={editor}
        activeActions={["bold", "italic", "underline", "strikethrough", "code", "clearFormatting"]}
        mainActionCount={2}
      />

      <Separator orientation="vertical" className="mx-1 h-7" />

      {/* <SectionThree editor={editor} /> */}

      {/* <Separator orientation="vertical" className="mx-1 h-7" /> */}

      <SectionFour editor={editor} activeActions={["orderedList", "bulletList"]} mainActionCount={0} />

      <Separator orientation="vertical" className="mx-1 h-7" />

      <SectionFive
        editor={editor}
        activeActions={["codeBlock", "blockquote", "horizontalRule"]}
        mainActionCount={0}
      />
    </div>
  </div>
);

export const MinimalTiptapEditor = React.forwardRef<HTMLDivElement, MinimalTiptapProps>(
  ({ value, onChange, className, editorContentClassName, ...props }, ref) => {
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      ...props,
    });
    const editing = useDebounce(editor?.isFocused ?? false, 100);

    if (!editor) {
      return null;
    }

    return (
      <MeasuredContainer
        as="div"
        name="editor"
        ref={ref}
        data-focused={editing || editor.isFocused}
        className={cn(
          "group flex h-auto flex-col rounded-md border shadow-sm focus-within:border-primary data-[focused=true]:border-input",
          className,
        )}
      >
        <Toolbar editor={editor} />
        <EditorContent editor={editor} className={cn("minimal-tiptap-editor", editorContentClassName)} />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    );
  },
);

MinimalTiptapEditor.displayName = "MinimalTiptapEditor";

export default MinimalTiptapEditor;
