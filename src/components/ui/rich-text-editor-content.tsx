'use client';

import {
  RichTextPlugin,
} from '@lexical/react/LexicalRichTextPlugin';

import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import ToolbarPlugin from './rich-text-toolbar';

export function RichTextEditorContent({ onChange }: { onChange: (val: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback(() => {
    editor.update(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onChange(html);
    });
  }, [editor, onChange]);

  return (
    <div className="border rounded bg-background">
      <ToolbarPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="p-3 min-h-[200px] outline-none max-h-[60vh] overflow-y-auto" />
        }
        placeholder={<div className="text-muted-foreground p-3">Votre message...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <OnChangePlugin onChange={handleChange} />
    </div>
  );
}
