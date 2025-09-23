"use client";

import Editor from "@monaco-editor/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  text: string;
  setText: (value: string) => void;
};

export default function EditorSection({ text, setText }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const textContent = String(reader.result ?? "");
      setText(textContent);
    };
    reader.readAsText(file);
  }, [setText]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/json": [".json"] },
    maxFiles: 1,
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <section className="field editor-section">
      <div className="textarea-frame">
        <div className="editor-wrap" {...getRootProps()}>
          <input {...getInputProps()} />
          <Editor
            height="60vh"
            defaultLanguage="json"
            language="json"
            value={text}
            onChange={(val) => setText(val ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
          <div className={`drop-overlay${isDragActive ? " active" : ""}`}>Drop JSON to load</div>
        </div>
      </div>
    </section>
  );
}

