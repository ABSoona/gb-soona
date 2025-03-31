// scripts/scan-labels.ts
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';

interface LabelInfo {
  file: string;
  component: string;
  text: string;
}

async function scan() {
  const files = await fg(['src/**/*.tsx']);

  const results: LabelInfo[] = [];

  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      JSXElement(path) {
        const openingElement = path.node.openingElement.name;
        const component = openingElement.type === 'JSXIdentifier' ? openingElement.name : '';

        for (const child of path.node.children) {
          // Cas 1 : <Button>Créer</Button>
          if (child.type === 'JSXText') {
            const value = child.value.trim();
            if (value) {
              results.push({ file, component, text: value });
            }
          }

          // Cas 2 : <Button>{ "Créer" }</Button>
          if (
            child.type === 'JSXExpressionContainer' &&
            child.expression.type === 'StringLiteral'
          ) {
            const value = child.expression.value.trim();
            if (value) {
              results.push({ file, component, text: value });
            }
          }
        }
      },
    });
  }

  // Export JSON
  await fs.writeJson('labels.json', results, { spaces: 2 });
  console.log('✅ Labels extraits dans labels.json');
}

scan();
