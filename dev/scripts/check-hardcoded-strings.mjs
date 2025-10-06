#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const BASELINE_PATH = path.join(PROJECT_ROOT, 'dev', 'scripts', 'hardcoded-strings-baseline.json');
const SHOULD_UPDATE = process.argv.includes('--update');

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.storybook',
  'dist',
  'build',
  'coverage',
  'stories',
  'config',
  'dev',
]);

const IGNORED_FILES = [
  /\.d\.ts$/,
];

const CHECK_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function getRelativePath(filePath) {
  return path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
}

function shouldSkipFile(filePath) {
  return IGNORED_FILES.some((pattern) => pattern.test(filePath));
}

function collectFilePaths(directory, results) {
  const entries = readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      collectFilePaths(fullPath, results);
    } else if (entry.isFile()) {
      const extension = path.extname(entry.name);
      if (!CHECK_EXTENSIONS.has(extension)) {
        continue;
      }
      if (shouldSkipFile(fullPath)) {
        continue;
      }
      results.push(fullPath);
    }
  }
  return results;
}

function isDisplayString(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.length === 1 && /[A-Za-z0-9]/.test(trimmed)) {
    return false;
  }
  const looksLikeKey = /^[A-Za-z0-9_.-]+$/.test(trimmed);
  if (looksLikeKey && trimmed === trimmed.toUpperCase()) {
    return false;
  }
  if (looksLikeKey && !/[\s]/.test(trimmed) && !/[a-z]/.test(trimmed)) {
    return false;
  }
  const hasWordCharacters = /[a-z]/.test(trimmed) || /[\u4e00-\u9fff]/.test(trimmed);
  return hasWordCharacters;
}

function isIgnoredLiteral(node) {
  const parent = node.parent;
  if (!parent) {
    return false;
  }

  switch (parent.kind) {
    case ts.SyntaxKind.ImportDeclaration:
    case ts.SyntaxKind.ExportDeclaration:
    case ts.SyntaxKind.ModuleDeclaration:
      return true;
    case ts.SyntaxKind.PropertyAssignment: {
      const grandParent = parent.parent;
      if (grandParent && ts.isObjectLiteralExpression(grandParent)) {
        const maybeCall = grandParent.parent;
        if (maybeCall && ts.isCallExpression(maybeCall)) {
          const expressionText = maybeCall.expression.getText();
          if (expressionText.includes('defineConfig')) {
            return true;
          }
        }
      }
      return false;
    }
    case ts.SyntaxKind.EnumMember:
    case ts.SyntaxKind.ImportEqualsDeclaration:
    case ts.SyntaxKind.ExternalModuleReference:
      return true;
    default:
      return false;
  }
}

function collectHardcodedStrings(filePath) {
  const sourceText = readFileSync(filePath, 'utf8');
  const scriptKind = filePath.endsWith('.tsx') || filePath.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, scriptKind);

  const findings = [];

  function addFinding(node, text) {
    if (!isDisplayString(text)) {
      return;
    }
    if (ts.isStringLiteralLike(node) && isIgnoredLiteral(node)) {
      return;
    }
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    findings.push({
      file: getRelativePath(filePath),
      line: line + 1,
      text: text.trim(),
    });
  }

  function visit(node) {
    if (ts.isStringLiteralLike(node)) {
      addFinding(node, node.text);
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      addFinding(node, node.text);
    } else if (ts.isTemplateExpression(node)) {
      const headText = node.head.text;
      addFinding(node.head, headText);
      node.templateSpans.forEach((span) => {
        addFinding(span.literal, span.literal.text);
      });
    } else if (ts.isJsxText(node)) {
      const text = node.getText();
      addFinding(node, text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

function toKey(finding) {
  return `${finding.file}:${finding.line}:${finding.text}`;
}

if (!existsSync(SRC_DIR)) {
  console.error('Unable to locate src directory.');
  process.exit(1);
}

const filePaths = collectFilePaths(SRC_DIR, []);
let findings = [];
for (const filePath of filePaths) {
  findings = findings.concat(collectHardcodedStrings(filePath));
}

findings.sort((a, b) => {
  if (a.file === b.file) {
    return a.line - b.line;
  }
  return a.file.localeCompare(b.file);
});

const serialisedFindings = findings.map((finding) => [finding.file, finding.line, finding.text]);

if (SHOULD_UPDATE) {
  writeFileSync(BASELINE_PATH, `${JSON.stringify(serialisedFindings)}\n`);
  console.log(`Baseline updated with ${serialisedFindings.length} entries.`);
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error('Baseline file is missing. Run with --update to create it.');
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).map(([file, line, text]) => ({ file, line, text }));
const baselineKeys = new Set(baseline.map(toKey));
const findingKeys = new Set(findings.map(toKey));

const newFindings = findings.filter((finding) => !baselineKeys.has(toKey(finding)));
const resolvedFindings = baseline.filter((finding) => !findingKeys.has(toKey(finding)));

if (newFindings.length > 0) {
  console.error('New hard-coded strings detected:');
  for (const finding of newFindings) {
    console.error(`  ${finding.file}:${finding.line} → "${finding.text}"`);
  }
  process.exit(1);
}

if (resolvedFindings.length > 0) {
  console.log('Resolved hard-coded strings:');
  for (const finding of resolvedFindings) {
    console.log(`  ${finding.file}:${finding.line} → "${finding.text}"`);
  }
}

console.log('No new hard-coded strings detected.');
process.exit(0);
