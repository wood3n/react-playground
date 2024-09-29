import modules from "!./module.d.ts?raw";
import Editor, { type Monaco } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import React from "react";
import { createHighlighter } from "shiki";

const defaultCode = `import React from 'react';

const App = () => {
  return <div>App</div>
}
`;

async function getDtsFile() {
  return fetch("https://unpkg.com/@types/react@17.0.39/index.d.ts").then(
    (resp) => {
      return resp.text();
    },
    () => { },
  );
}

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
      typeRoots: ["node_modules/@types"],
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    const reactTypes = await getDtsFile();

    if (reactTypes) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(reactTypes, "file:///node_modules/react/index.d.ts");
    }

    shikiToMonaco(highlighter, monaco);
  };

  return (
    <Editor
      height="600px"
      width="600px"
      language="typescript"
      defaultValue={defaultCode}
      path="file:///main.tsx"
      beforeMount={handleEditorWillMount}
      options={{
        tabSize: 2,
      }}
    />
  );
}

export default App;
