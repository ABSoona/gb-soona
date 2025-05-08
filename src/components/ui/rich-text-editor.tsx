'use client';

import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { RichTextEditorContent } from './rich-text-editor-content';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';


export function RichTextEditor({
  value,
  onChange,
  initialValue = '',
}: {
  value: string;
  onChange: (val: string) => void;
  initialValue?: string;
}) {
  const editorConfig: InitialConfigType = {
    namespace: 'RichTextEditor',
    theme: {
      paragraph: 'py-2',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
      },
      list: {
        ul: 'list-disc list-inside',
        ol: 'list-decimal list-inside',
        listitem: 'ml-4',
      },
    },
    onError: (error) => {
      console.error('Lexical error:', error);
    },
    nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode],
    editorState: $generateEditorStateFromHtml(initialValue),
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <RichTextEditorContent onChange={onChange} />
    </LexicalComposer>
  );
}

export function $generateEditorStateFromHtml(html: string) {
  return (editor: any) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, 'text/html');
    const nodes = $generateNodesFromDOM(editor, dom);
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.selectStart();
      $insertNodes(nodes);
    });
  };
}
