import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import { setupTypeAcquisition } from "@typescript/ata";
import React from "react";
import { createHighlighter } from "shiki";
import ts from "typescript";

const defaultCode = `import React from 'react';

const App = () => {
  return <div>App</div>
}
`;

function App() {
  const handleEditorWillMount = async (monaco: Monaco) => {
    const highlighter = await createHighlighter({
      themes: [
        "one-dark-pro",
        "one-light",
      ],
      langs: [
        "javascript",
        "typescript",
        "vue",
      ],
    });

    monaco.languages.registerCompletionItemProvider("typescript", {
      triggerCharacters: [">"],
      provideCompletionItems: (model, position) => {
        const codePre: string = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const tag = codePre.match(/.*<(\w+)>$/)?.[1];

        if (!tag) {
          return;
        }

        const word = model.getWordUntilPosition(position);

        return {
          suggestions: [
            {
              label: `</${tag}>`,
              kind: monaco.languages.CompletionItemKind.EnumMember,
              insertText: `$1</${tag}>`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              },
            },
          ],
        };
      },
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      allowJs: true,
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      esModuleInterop: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    shikiToMonaco(highlighter, monaco);
  };

  const handleMount: OnMount = (editor, monaco) => {
    const ata = setupTypeAcquisition({
      projectName: "React Playground",
      typescript: ts,
      logger: console,
      delegate: {
        receivedFile: (code, path) => {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`);
        },
      },
    });

    editor.onDidChangeModelContent(() => {
      ata(editor.getValue());
    });

    ata(defaultCode);
  };

  return (
    <Editor
      height="600px"
      width="600px"
      language="typescript"
      defaultValue={defaultCode}
      path="file:///main.tsx"
      beforeMount={handleEditorWillMount}
      onMount={handleMount}
      options={{
        tabSize: 2,
        formatOnType: true,
        formatOnPaste: true,
      }}
    />
  );
}

export default App;
