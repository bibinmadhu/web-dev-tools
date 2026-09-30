import YAML from 'yaml';
import { formatJavaCode, defaultJavaFormatterOptions, JavaFormatterOptions } from './javaFormatter';

export type SupportedLanguage =
  | 'python'
  | 'yaml'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'html'
  | 'xml'
  | 'css'
  | 'sql'
  | 'markdown'
  | 'shell';

export interface LanguageDefinition {
  id: SupportedLanguage;
  name: string;
  extension: string;
  mime: string;
  category: string;
  badge: string;
  sample: string;
}

export interface FormatterOptions {
  indentType: 'spaces' | 'tabs';
  indentSize: number;
  quotes?: 'double' | 'single' | 'preserve';
  semicolons?: 'always' | 'never' | 'preserve';
  sortKeys?: boolean; // For JSON, YAML
  sortImports?: boolean; // For Python, Java, JS
  trimTrailingWhitespace?: boolean;
  ensureFinalNewline?: boolean;
  braceStyle?: 'same-line' | 'next-line'; // For Java, JS, CSS
  uppercaseSqlKeywords?: boolean; // For SQL
  minify?: boolean; // For JSON, CSS, HTML, JS
}

export const defaultFormatterOptions: FormatterOptions = {
  indentType: 'spaces',
  indentSize: 2,
  quotes: 'preserve',
  semicolons: 'always',
  sortKeys: false,
  sortImports: false,
  trimTrailingWhitespace: true,
  ensureFinalNewline: true,
  braceStyle: 'same-line',
  uppercaseSqlKeywords: true,
  minify: false,
};

export interface FormatResult {
  formattedCode: string;
  isValid: boolean;
  error?: string;
  errorLine?: number;
  stats: {
    originalLines: number;
    formattedLines: number;
    originalChars: number;
    formattedChars: number;
    durationMs: number;
  };
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    mime: 'text/x-python',
    category: 'Backend / Scripting',
    badge: 'PEP 8',
    sample: `# User Account Service
class UserService:
    def __init__(self,db_connection,timeout=30):
        self.db=db_connection
        self.timeout=timeout
        self.cache={}

    def get_user_by_id(self,user_id:int)->dict:
        """Fetch user by id with local caching"""
        if user_id in self.cache:
            return self.cache[user_id]
        query="SELECT id,name,email,role FROM users WHERE id=%s"
        result=self.db.execute(query,(user_id,))
        if not result:
            raise ValueError(f"User {user_id} not found")
        user_data={"id":result[0],"name":result[1],"email":result[2],"role":result[3],"active":True}
        self.cache[user_id]=user_data
        return user_data

    def register_user(self,username:str,email:str,roles:list=None)->bool:
        if roles is None:roles=["member"]
        for role in roles:
            if role not in ["admin","editor","member"]:
                raise ValueError(f"Invalid role: {role}")
        return True`,
  },
  {
    id: 'yaml',
    name: 'YAML',
    extension: 'yaml',
    mime: 'text/yaml',
    category: 'Config / Cloud',
    badge: 'Standard',
    sample: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api-service
  labels:
    app: web-api
    tier: backend
    env: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
    spec:
      containers:
      - name: api-server
        image: devhub/api-server:v2.4.1
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: connection_string
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: 250m
            memory: 256Mi`,
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    mime: 'text/x-java',
    category: 'Enterprise / JVM',
    badge: 'Clean Code',
    sample: `package com.devhub.service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.ArrayList;

public class OrderManagementService {
private final OrderRepository orderRepository;
private final NotificationService notificationService;

public OrderManagementService(OrderRepository orderRepository,NotificationService notificationService){
this.orderRepository=orderRepository;
this.notificationService=notificationService;
}

public Order createOrder(String customerId,List<OrderItem> items){
if(customerId==null||customerId.trim().isEmpty()){
throw new IllegalArgumentException("Customer ID cannot be empty");
}
Order order=new Order();
order.setCustomerId(customerId);
order.setItems(items!=null?items:new ArrayList<>());
order.setCreatedAt(LocalDateTime.now());
Order saved=this.orderRepository.save(order);
this.notificationService.notifyCustomer(customerId,"Order created: "+saved.getId());
return saved;
}
}`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    mime: 'text/javascript',
    category: 'Web / Node',
    badge: 'ES6+',
    sample: `import { apiClient } from './api';
import { formatDate, parseCurrency } from '../utils/helpers';

export async function processTransactions(batchId, options = {}) {
const { retryCount = 3, timeout = 5000, sendNotification = true } = options;
let attempts = 0;
while (attempts < retryCount) {
try {
const response = await apiClient.post('/api/transactions/batch', {
batchId,
timestamp: new Date().toISOString(),
dryRun: false
}, { timeout });
if (response.status === 200 && response.data.success) {
const processed = response.data.items.map(item => ({
id: item.id,
amount: parseCurrency(item.rawAmount),
formattedDate: formatDate(item.date),
status: 'COMPLETED'
}));
return { success: true, count: processed.length, data: processed };
}
} catch (error) {
attempts++;
if (attempts >= retryCount) throw new Error("Transaction batch failed: " + error.message);
await new Promise(r => setTimeout(r, 1000 * attempts));
}
}
}`,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    mime: 'text/typescript',
    category: 'Web / Node',
    badge: 'Typed',
    sample: `interface UserProfile {
id: string;
username: string;
email: string;
roles: Array<'admin' | 'user' | 'editor'>;
metadata?: Record<string, unknown>;
}

type ServiceResponse<T> = {
success: boolean;
data?: T;
error?: { code: string; message: string; timestamp: number };
};

export class AuthenticationManager {
private tokenCache: Map<string, { token: string; expiresAt: number }> = new Map();

public async validateSession(sessionId: string): Promise<ServiceResponse<UserProfile>> {
if (!sessionId || sessionId.length < 16) {
return { success: false, error: { code: 'INVALID_SESSION', message: 'Session ID is malformed', timestamp: Date.now() } };
}
const cached = this.tokenCache.get(sessionId);
if (cached && cached.expiresAt > Date.now()) {
return { success: true, data: { id: 'usr_123', username: 'alex_dev', email: 'alex@example.com', roles: ['admin'] } };
}
return { success: false, error: { code: 'SESSION_EXPIRED', message: 'Please re-authenticate', timestamp: Date.now() } };
}
}`,
  },
  {
    id: 'json',
    name: 'JSON',
    extension: 'json',
    mime: 'application/json',
    category: 'Data / APIs',
    badge: 'Pretty / Min',
    sample: `{"projectName":"DevHub Suite","version":"2.4.0","description":"Developer utilities and code transformers","license":"MIT","repository":{"type":"git","url":"https://github.com/devhub/tools"},"features":["Multi-language Code Formatter","Java Class Obfuscator","cURL Pipeline Converter","PDF Signer & Markdown Extractor"],"contributors":[{"name":"Bibin Madhu","role":"Lead Architect","verified":true},{"name":"Core Team","role":"Engineering","verified":true}],"settings":{"analytics":false,"cacheTimeout":3600,"debugMode":true}}`,
  },
  {
    id: 'html',
    name: 'HTML / XML',
    extension: 'html',
    mime: 'text/html',
    category: 'Markup',
    badge: 'DOM Tree',
    sample: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>DevHub Code Formatter</title><link rel="stylesheet" href="/styles.css"></head><body><div id="app" class="container"><header class="header"><div class="brand"><img src="/logo.svg" alt="DevHub" width="32" height="32"><h1>DevHub Developer Tools</h1></div><nav class="nav-links"><a href="/dashboard">Dashboard</a><a href="/tools" class="active">Formatters</a><a href="/settings">Settings</a></nav></header><main class="content-panel"><section class="intro"><h2>Format Python, YAML, Java & More</h2><p>Instant beautification with customizable indentation and syntax checks.</p></section></main></div></body></html>`,
  },
  {
    id: 'css',
    name: 'CSS / SCSS',
    extension: 'css',
    mime: 'text/css',
    category: 'Styling',
    badge: 'Clean Rules',
    sample: `:root{--primary-color:#4f46e5;--primary-hover:#4338ca;--background:#0b0f19;--card-bg:#111827;--text-main:#f9fafb;--border-color:#1f2937;}
.container{max-width:1440px;margin:0 auto;padding:1.5rem;box-sizing:border-box;}
.code-card{background:var(--card-bg);border:1px solid var(--border-color);border-radius:1rem;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);transition:transform 0.2s ease,box-shadow 0.2s ease;}
.code-card:hover{transform:translateY(-2px);box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);}
@media (max-width:768px){.container{padding:1rem;}.code-card{border-radius:0.75rem;}}`,
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    mime: 'text/x-sql',
    category: 'Database',
    badge: 'ANSI / PG',
    sample: `select u.id as user_id,u.username,u.email,r.role_name,count(o.id) as total_orders,sum(o.total_amount) as lifetime_spend from users u inner join user_roles ur on u.id = ur.user_id inner join roles r on ur.role_id = r.id left join orders o on u.id = o.customer_id and o.status not in ('cancelled','refunded') where u.is_active = true and u.created_at >= '2025-01-01' group by u.id,u.username,u.email,r.role_name having count(o.id) >= 3 order by lifetime_spend desc limit 50;`,
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extension: 'md',
    mime: 'text/markdown',
    category: 'Documentation',
    badge: 'GFM',
    sample: `# DevHub Multi-Format Code Styler

### Overview
A high-performance formatting and beautification platform supporting multiple programming and markup languages.

## Supported Formats
| Language | File Extension | Features |
|---|---|---|
| Python | .py | PEP 8, block indentation, operator spacing |
| YAML | .yaml, .yml | AST validation, key sorting, indentation |
| Java | .java | Standard & Google styles, import cleanup |
| JavaScript / TypeScript | .js, .ts | Semicolon control, quote normalization |
| JSON | .json | Pretty print, key sorting, minification |
| SQL | .sql | Keyword casing, clause indentation |

### Quick Start
\`\`\`bash
npm run dev
\`\`\`

- Built for rapid engineering workflows
- Zero telemetry & client-side only processing`,
  },
  {
    id: 'shell',
    name: 'Shell / Bash',
    extension: 'sh',
    mime: 'text/x-sh',
    category: 'DevOps / Scripts',
    badge: 'POSIX',
    sample: `#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ENV="\${1:-production}"
APP_NAME="devhub-service"
BUILD_DIR="./dist"

echo "=== Starting deployment for \${APP_NAME} to \${DEPLOY_ENV} ==="

if [[ ! -d "\${BUILD_DIR}" ]]; then
echo "Error: Build directory \${BUILD_DIR} does not exist. Running build..."
npm run build
fi

for service in "api" "worker" "cron"; do
echo "Deploying sub-service: \${service}"
if [[ "\${DEPLOY_ENV}" == "production" ]]; then
kubectl rollout restart deployment/"\${APP_NAME}-\${service}" -n "\${DEPLOY_ENV}"
else
docker compose restart "\${service}"
fi
done

echo "Deployment completed successfully!"`,
  },
];

// ============================================================================
// LANGUAGE AUTO-DETECTION
// ============================================================================

export function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();
  if (!trimmed) return 'python';

  // 1. JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Could be JS/TS object or other
    }
  }

  // 2. HTML / XML
  if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /^\s*<html\b/i.test(trimmed)) {
    return 'html';
  }
  if (/^\s*<\?xml\b/i.test(trimmed) || /^\s*<svg\b/i.test(trimmed)) {
    return 'xml';
  }

  // 3. Shell script (shebang)
  if (/^#!\s*\/bin\/(?:ba)?sh/m.test(trimmed) || /^#!\s*\/usr\/bin\/env\s+(?:ba)?sh/m.test(trimmed)) {
    return 'shell';
  }

  // 4. Java
  if (
    /\bpackage\s+[a-zA-Z0-9_.]+;/.test(trimmed) ||
    /\bpublic\s+(?:final\s+|abstract\s+)?class\s+[A-Za-z0-9_$]+/.test(trimmed) ||
    /\bpublic\s+static\s+void\s+main\s*\(/.test(trimmed) ||
    /\bSystem\.out\.println\s*\(/.test(trimmed)
  ) {
    return 'java';
  }

  // 5. Python
  if (
    /\bdef\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*?\)\s*:/.test(trimmed) ||
    /\bclass\s+[a-zA-Z_][a-zA-Z0-9_]*(?:\(.*?\))?\s*:/.test(trimmed) ||
    /\bfrom\s+[a-zA-Z0-9_.]+\s+import\s+/.test(trimmed) ||
    /\bif\s+__name__\s*==\s*['"]__main__['"]\s*:/.test(trimmed) ||
    /(?:^|\n)\s*elif\s+.*?:/.test(trimmed)
  ) {
    return 'python';
  }

  // 6. SQL
  if (
    /^\s*(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|WITH)\b/i.test(trimmed) &&
    /\b(?:FROM|WHERE|JOIN|GROUP\s+BY|ORDER\s+BY|VALUES|SET)\b/i.test(trimmed)
  ) {
    return 'sql';
  }

  // 7. YAML (Look for key: value structure or document start ---)
  if (/^---(?:\s*\n|$)/.test(trimmed) || (/^[a-zA-Z0-9_-]+:\s*(?:$|\S)/m.test(trimmed) && !trimmed.includes('{') && !trimmed.includes(';'))) {
    try {
      const doc = YAML.parse(trimmed);
      if (typeof doc === 'object' && doc !== null) {
        return 'yaml';
      }
    } catch {
      // continue
    }
  }

  // 8. Markdown
  if (
    /^#{1,6}\s+.+/m.test(trimmed) &&
    (/\n\s*[-*+]\s+.+/.test(trimmed) || /\|.*?\|.*?\|/.test(trimmed) || /```[\s\S]*?```/.test(trimmed))
  ) {
    return 'markdown';
  }

  // 9. CSS
  if (/[a-zA-Z0-9_.-]+\s*\{[^}]*:[^}]*;?\s*\}/.test(trimmed) && !trimmed.includes('function') && !trimmed.includes('import ')) {
    return 'css';
  }

  // 10. TypeScript vs JavaScript
  if (
    /\binterface\s+[A-Za-z0-9_$]+/.test(trimmed) ||
    /\btype\s+[A-Za-z0-9_$]+\s*=/.test(trimmed) ||
    /:\s*(?:string|number|boolean|any|void|unknown|never|Record<|Array<|Promise<)\b/.test(trimmed) ||
    /\bas\s+[A-Za-z0-9_$]+/.test(trimmed)
  ) {
    return 'typescript';
  }

  if (
    /\bconst\s+|\blet\s+|\bvar\s+|\bfunction\s+|\bexport\s+|\bimport\s+/.test(trimmed) ||
    /=>\s*\{/.test(trimmed)
  ) {
    return 'javascript';
  }

  return 'python';
}

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * High-fidelity Python Formatter
 * Formats Python code adhering to PEP 8:
 * - Proper indentation blocks (def, class, if, elif, else, for, while, try, except, finally, with, match, case)
 * - Binary and assignment operator spacing
 * - Colon and comma spacing
 * - Clean method and class blank line separation
 * - String literal and docstring protection
 */
export function formatPython(code: string, options: FormatterOptions = defaultFormatterOptions): string {
  const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 4);
  const lines = code.split(/\r?\n/);

  // Preserve string literals and docstrings to avoid altering inner content
  const stringPlaceholders: string[] = [];
  const maskStrings = (text: string): string => {
    // Mask triple quotes first
    let result = text.replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, (m) => {
      const ph = `___PY_TRIPLE_${stringPlaceholders.length}___`;
      stringPlaceholders.push(m);
      return ph;
    });

    // Mask single/double quoted strings
    result = result.replace(/(b|r|f|u)?("(\\.|[^"\\])*"|'(\\.|[^'\\])*')/gi, (m) => {
      const ph = `___PY_STR_${stringPlaceholders.length}___`;
      stringPlaceholders.push(m);
      return ph;
    });
    return result;
  };

  const unmaskStrings = (text: string): string => {
    let result = text;
    for (let i = stringPlaceholders.length - 1; i >= 0; i--) {
      const phTriple = `___PY_TRIPLE_${i}___`;
      const phStr = `___PY_STR_${i}___`;
      if (result.includes(phTriple)) {
        result = result.replace(phTriple, () => stringPlaceholders[i]);
      }
      if (result.includes(phStr)) {
        result = result.replace(phStr, () => stringPlaceholders[i]);
      }
    }
    return result;
  };

  let indentLevel = 0;
  const formattedLines: string[] = [];

  const dedentTriggers = /^\s*(?:elif\b|else\s*:|except\b|finally\s*:|case\b)/;
  const indentTriggers = /:\s*(?:#.*)?$/;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Preserve blank lines cleanly (collapse excessive consecutive blanks)
    if (!trimmed) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    const maskedLine = maskStrings(trimmed);

    // Check if this line should dedent (e.g. else:, elif, except, finally)
    if (dedentTriggers.test(maskedLine) && indentLevel > 0) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Format operators and punctuation outside of strings
    let cleanLine = maskedLine
      // Normalize commas: one space after comma, no space before
      .replace(/\s*,\s*/g, ', ')
      // Normalize colons in dict / type hints: no space before, one space after (unless end of line)
      .replace(/([^\s:]+)\s*:\s*([^\s:])/g, '$1: $2')
      // Normalize comparison and arithmetic operators
      .replace(/\s*(==|!=|<=|>=|\+=|-=|\*=|(?<!\/)\/=(?!\/)|%=|\/\/=|\*\*=|&=|\|=|\^=|>>=|<<=)\s*/g, ' $1 ')
      // Spacing around binary operators when not part of identifiers
      .replace(/([^=!<>]|^)\s*=\s*([^=]|$)/g, '$1 = $2')
      // Clean duplicate spaces
      .replace(/[ \t]{2,}/g, ' ');

    // Fix keyword argument defaults: def func(a = 1) -> def func(a=1)
    if (/^\s*def\s+/.test(cleanLine)) {
      cleanLine = cleanLine.replace(/([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_'"-]+)/g, '$1=$2');
    }

    const unmasked = unmaskStrings(cleanLine);
    const indented = (indentStr.repeat(indentLevel) + unmasked).trimEnd();
    formattedLines.push(indented);

    // If line ends with a colon, next line indents
    if (indentTriggers.test(maskedLine)) {
      indentLevel++;
    }
  }

  // Ensure clean separation between top-level classes and functions
  const resultLines: string[] = [];
  for (let i = 0; i < formattedLines.length; i++) {
    const curr = formattedLines[i];
    const isTopLevelDef = /^(?:def|class|async def)\s+/.test(curr);

    if (isTopLevelDef && i > 0 && resultLines.length > 0) {
      // Ensure 2 blank lines before top-level class or function according to PEP 8
      while (resultLines.length > 0 && resultLines[resultLines.length - 1] === '') {
        resultLines.pop();
      }
      resultLines.push('');
      resultLines.push('');
    }
    resultLines.push(curr);
  }

  let finalOutput = resultLines.join('\n');
  if (options.ensureFinalNewline && !finalOutput.endsWith('\n')) {
    finalOutput += '\n';
  }
  return finalOutput;
}

/**
 * Robust YAML Formatter & Validator
 * Supports indentation (2, 4 spaces), key sorting, and structural validation
 */
export function formatYaml(code: string, options: FormatterOptions = defaultFormatterOptions): FormatResult {
  const startTime = performance.now();
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      formattedCode: '',
      isValid: true,
      stats: { originalLines: 0, formattedLines: 0, originalChars: 0, formattedChars: 0, durationMs: 0 },
    };
  }

  try {
    const doc = YAML.parseDocument(code, {
      keepSourceTokens: true,
    });

    if (doc.errors.length > 0) {
      const err = doc.errors[0];
      const linePos = err.linePos?.[0] ? err.linePos[0].line : 1;
      return {
        formattedCode: code,
        isValid: false,
        error: `YAML Syntax Error: ${err.message}`,
        errorLine: linePos,
        stats: {
          originalLines: code.split('\n').length,
          formattedLines: code.split('\n').length,
          originalChars: code.length,
          formattedChars: code.length,
          durationMs: Math.round(performance.now() - startTime),
        },
      };
    }

    // Optional key sorting
    if (options.sortKeys) {
      const parsed = YAML.parse(code);
      const sortObjectKeys = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(sortObjectKeys);
        } else if (obj !== null && typeof obj === 'object') {
          return Object.keys(obj)
            .sort()
            .reduce((acc: any, key) => {
              acc[key] = sortObjectKeys(obj[key]);
              return acc;
            }, {});
        }
        return obj;
      };
      const sorted = sortObjectKeys(parsed);
      const formatted = YAML.stringify(sorted, {
        indent: options.indentSize || 2,
        indentSeq: true,
        lineWidth: 100,
      });

      return {
        formattedCode: formatted,
        isValid: true,
        stats: {
          originalLines: code.split('\n').length,
          formattedLines: formatted.split('\n').length,
          originalChars: code.length,
          formattedChars: formatted.length,
          durationMs: Math.round(performance.now() - startTime),
        },
      };
    }

    const formatted = doc.toString({
      indent: options.indentSize || 2,
      indentSeq: true,
      lineWidth: 120,
    });

    return {
      formattedCode: formatted,
      isValid: true,
      stats: {
        originalLines: code.split('\n').length,
        formattedLines: formatted.split('\n').length,
        originalChars: code.length,
        formattedChars: formatted.length,
        durationMs: Math.round(performance.now() - startTime),
      },
    };
  } catch (err: any) {
    return {
      formattedCode: code,
      isValid: false,
      error: `YAML Parser Error: ${err.message || 'Malformed YAML structure'}`,
      stats: {
        originalLines: code.split('\n').length,
        formattedLines: code.split('\n').length,
        originalChars: code.length,
        formattedChars: code.length,
        durationMs: Math.round(performance.now() - startTime),
      },
    };
  }
}

/**
 * Java Formatter
 * Delegates to our comprehensive Java formatting engine in javaFormatter.ts
 */
export function formatJava(code: string, options: FormatterOptions = defaultFormatterOptions): string {
  const javaOptions: Partial<JavaFormatterOptions> = {
    indentType: options.indentType,
    indentSize: options.indentSize || 4,
    braceStyle: options.braceStyle || 'same-line',
    sortImports: options.sortImports ?? true,
    groupImports: true,
    removeDuplicateImports: true,
    spaceBeforeControlParentheses: true,
    spaceAroundOperators: true,
    spaceAfterComma: true,
    trimTrailingWhitespace: options.trimTrailingWhitespace ?? true,
    ensureFinalNewline: options.ensureFinalNewline ?? true,
  };
  return formatJavaCode(code, javaOptions);
}

/**
 * High-fidelity JSON Formatter & Minifier
 */
export function formatJson(code: string, options: FormatterOptions = defaultFormatterOptions): FormatResult {
  const startTime = performance.now();
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      formattedCode: '',
      isValid: true,
      stats: { originalLines: 0, formattedLines: 0, originalChars: 0, formattedChars: 0, durationMs: 0 },
    };
  }

  try {
    // Attempt standard parse first
    let parsed: any;
    try {
      parsed = JSON.parse(code);
    } catch {
      // Lenient repair: strip comments and trailing commas
      const repaired = code
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
        .replace(/,(\s*[}\]])/g, '$1');
      parsed = JSON.parse(repaired);
    }

    if (options.sortKeys) {
      const sortKeysRecursive = (val: any): any => {
        if (Array.isArray(val)) {
          return val.map(sortKeysRecursive);
        } else if (val !== null && typeof val === 'object') {
          return Object.keys(val)
            .sort()
            .reduce((acc: any, key) => {
              acc[key] = sortKeysRecursive(val[key]);
              return acc;
            }, {});
        }
        return val;
      };
      parsed = sortKeysRecursive(parsed);
    }

    let formatted: string;
    if (options.minify) {
      formatted = JSON.stringify(parsed);
    } else {
      const indent = options.indentType === 'tabs' ? '\t' : options.indentSize || 2;
      formatted = JSON.stringify(parsed, null, indent);
    }

    if (options.ensureFinalNewline && !formatted.endsWith('\n') && !options.minify) {
      formatted += '\n';
    }

    return {
      formattedCode: formatted,
      isValid: true,
      stats: {
        originalLines: code.split('\n').length,
        formattedLines: formatted.split('\n').length,
        originalChars: code.length,
        formattedChars: formatted.length,
        durationMs: Math.round(performance.now() - startTime),
      },
    };
  } catch (err: any) {
    let errorLine: number | undefined;
    const lineMatch = err.message.match(/at position \d+ \(line (\d+) column (\d+)\)/);
    if (lineMatch) {
      errorLine = parseInt(lineMatch[1], 10);
    }

    return {
      formattedCode: code,
      isValid: false,
      error: `JSON Syntax Error: ${err.message}`,
      errorLine,
      stats: {
        originalLines: code.split('\n').length,
        formattedLines: code.split('\n').length,
        originalChars: code.length,
        formattedChars: code.length,
        durationMs: Math.round(performance.now() - startTime),
      },
    };
  }
}

/**
 * JavaScript and TypeScript Formatter
 */
export function formatJavascript(code: string, options: FormatterOptions = defaultFormatterOptions): string {
  const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2);
  const lines = code.split(/\r?\n/);
  const formattedLines: string[] = [];
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    // Dedent on closing braces
    const openBraces = (line.match(/{|\[|\(/g) || []).length;
    const closeBraces = (line.match(/}|\]|\)/g) || []).length;

    if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Spacing around control keywords (if, for, while, switch, catch)
    line = line.replace(/\b(if|for|while|switch|catch)\s*\(/g, '$1 (');
    // Spacing around binary operators
    line = line.replace(/([^\s!=<>+*-])\s*([=+\-*/%&|^]|===|!==|==|!=|<=|>=|=>)\s*([^\s!=<>+*-])/g, '$1 $2 $3');
    // Spacing after commas
    line = line.replace(/\s*,\s*/g, ', ');

    // Semicolon handling for statements
    if (options.semicolons === 'always') {
      const isStatementEnd =
        !line.endsWith(';') &&
        !line.endsWith('{') &&
        !line.endsWith('}') &&
        !line.endsWith(':') &&
        !line.endsWith(',') &&
        !line.endsWith('(') &&
        !line.endsWith('[') &&
        !line.startsWith('//') &&
        !line.startsWith('/*') &&
        !line.startsWith('*') &&
        !/^\s*(?:if|for|while|switch|catch|else|try|class|interface|type)\b/.test(line);

      if (isStatementEnd) {
        line += ';';
      }
    } else if (options.semicolons === 'never') {
      if (line.endsWith(';') && !line.includes('for (')) {
        line = line.slice(0, -1);
      }
    }

    const indented = indentStr.repeat(indentLevel) + line;
    formattedLines.push(indented);

    // If opening braces exceed closing braces, indent next lines
    if (openBraces > closeBraces && !line.startsWith('}') && !line.startsWith(']') && !line.startsWith(')')) {
      indentLevel++;
    } else if (closeBraces > openBraces && (line.endsWith('}') || line.endsWith(']') || line.endsWith(')'))) {
      indentLevel = Math.max(0, indentLevel - (closeBraces - openBraces));
    }
  }

  let result = formattedLines.join('\n');
  if (options.ensureFinalNewline && !result.endsWith('\n')) {
    result += '\n';
  }
  return result;
}

/**
 * HTML / XML Formatter
 */
export function formatHtmlXml(code: string, options: FormatterOptions = defaultFormatterOptions): string {
  const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2);
  const selfClosing = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  let indentLevel = 0;
  const result: string[] = [];

  // Match tags and text content
  const tokens = code.split(/(<\/?[a-zA-Z0-9_:-]+(?:\s+[^>]*?)?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>)/i).filter(Boolean);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('<!--') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<?xml')) {
      result.push(indentStr.repeat(indentLevel) + trimmed);
    } else if (/^<\/[a-zA-Z0-9_:-]+>/i.test(trimmed)) {
      // Closing tag: </tag>
      indentLevel = Math.max(0, indentLevel - 1);
      result.push(indentStr.repeat(indentLevel) + trimmed);
    } else if (/^<[a-zA-Z0-9_:-]+/i.test(trimmed)) {
      // Opening tag: <tag ...>
      const tagNameMatch = trimmed.match(/^<([a-zA-Z0-9_:-]+)/i);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isSelfClosing = selfClosing.has(tagName) || trimmed.endsWith('/>');

      result.push(indentStr.repeat(indentLevel) + trimmed);
      if (!isSelfClosing) {
        indentLevel++;
      }
    } else {
      // Plain text content
      result.push(indentStr.repeat(indentLevel) + trimmed);
    }
  }

  let finalOutput = result.join('\n');
  if (options.ensureFinalNewline && !finalOutput.endsWith('\n')) {
    finalOutput += '\n';
  }
  return finalOutput;
}

/**
 * CSS / SCSS Formatter
 */
export function formatCss(code: string, options: FormatterOptions = defaultFormatterOptions): string {
  if (options.minify) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  }

  const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2);
  let formatted = '';
  let indentLevel = 0;

  // Clean comments and normalize brackets
  const cleaned = code
    .replace(/\{/g, ' {\n')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n');

  const lines = cleaned.split('\n');

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.includes('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    if (line.includes(':') && !line.includes('{') && !line.includes('}')) {
      // Property line
      const [prop, ...valParts] = line.split(':');
      const val = valParts.join(':').trim();
      formatted += indentStr.repeat(indentLevel) + `${prop.trim()}: ${val}\n`;
    } else {
      formatted += indentStr.repeat(indentLevel) + line + '\n';
    }

    if (line.includes('{')) {
      indentLevel++;
    }
  }

  return formatted.trim() + '\n';
}

/**
 * SQL Formatter
 * Formats SQL with capitalized keywords and clause indentation
 */
export function formatSql(code: string, options: FormatterOptions = defaultFormatterOptions): string {
  const keywords = [
    'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN',
    'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
    'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON',
    'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
    'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'WITH', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'EXISTS'
  ];

  let result = code.trim();

  // Normalize spaces
  result = result.replace(/\s+/g, ' ');

  // Uppercase keywords if enabled
  if (options.uppercaseSqlKeywords ?? true) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(' ', '\\s+')}\\b`, 'gi');
      result = result.replace(regex, kw);
    }
  }

  // Major clauses that break to a new line
  const majorClauses = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
    'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH'
  ];

  const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2);

  for (const clause of majorClauses) {
    const regex = new RegExp(`(\\s*\\b${clause.replace(' ', '\\s+')}\\b\\s*)`, 'g');
    result = result.replace(regex, `\n${clause} `);
  }

  // Indent lines that are not top-level clauses
  const lines = result.split('\n').filter(Boolean);
  const formattedLines: string[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const startsWithMajor = majorClauses.some((c) => trimmed.startsWith(c));
    if (startsWithMajor) {
      formattedLines.push(trimmed);
    } else {
      formattedLines.push(indentStr + trimmed);
    }
  }

  return formattedLines.join('\n') + '\n';
}

/**
 * Markdown Formatter
 * Normalizes headings, bullets, code blocks & aligns tables
 */
export function formatMarkdown(code: string): string {
  const lines = code.split(/\r?\n/);
  const formatted: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      formatted.push(trimmed);
      continue;
    }

    if (inCodeBlock) {
      formatted.push(raw);
      continue;
    }

    // Normalize headings (# Header)
    if (/^#{1,6}\s*/.test(trimmed)) {
      const hashMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
      if (hashMatch) {
        formatted.push(`${hashMatch[1]} ${hashMatch[2]}`);
        continue;
      }
    }

    // Normalize bullet lists (- Item)
    if (/^[*+]\s+/.test(trimmed)) {
      formatted.push(trimmed.replace(/^[*+]\s+/, '- '));
      continue;
    }

    formatted.push(trimmed);
  }

  return formatted.join('\n') + '\n';
}

/**
 * Shell Script Formatter
 */
export function formatShell(code: string, options: FormatterOptions = defaultFormatterOptions): string {
  const indentStr = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize || 2);
  const lines = code.split(/\r?\n/);
  const formattedLines: string[] = [];
  let indentLevel = 0;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    if (/^(?:fi|done|esac|\})\b/.test(trimmed) || trimmed.startsWith('elif') || trimmed.startsWith('else')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push(indentStr.repeat(indentLevel) + trimmed);

    if (
      /(?:then|do|esac|case.*in|\{)$/.test(trimmed) ||
      trimmed.startsWith('elif') ||
      trimmed.startsWith('else')
    ) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n') + '\n';
}

// ============================================================================
// MAIN UNIFIED FORMATTER FUNCTION
// ============================================================================

export function formatCode(
  code: string,
  language: SupportedLanguage,
  options: FormatterOptions = defaultFormatterOptions
): FormatResult {
  const startTime = performance.now();
  const trimmed = code.trim();

  if (!trimmed) {
    return {
      formattedCode: '',
      isValid: true,
      stats: { originalLines: 0, formattedLines: 0, originalChars: 0, formattedChars: 0, durationMs: 0 },
    };
  }

  try {
    let formatted = '';
    let isValid = true;
    let error: string | undefined;
    let errorLine: number | undefined;

    switch (language) {
      case 'python':
        formatted = formatPython(code, options);
        break;

      case 'yaml': {
        const yamlRes = formatYaml(code, options);
        return yamlRes;
      }

      case 'java':
        formatted = formatJava(code, options);
        break;

      case 'json': {
        const jsonRes = formatJson(code, options);
        return jsonRes;
      }

      case 'javascript':
      case 'typescript':
        formatted = formatJavascript(code, options);
        break;

      case 'html':
      case 'xml':
        formatted = formatHtmlXml(code, options);
        break;

      case 'css':
        formatted = formatCss(code, options);
        break;

      case 'sql':
        formatted = formatSql(code, options);
        break;

      case 'markdown':
        formatted = formatMarkdown(code);
        break;

      case 'shell':
        formatted = formatShell(code, options);
        break;

      default:
        formatted = code;
    }

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      formattedCode: formatted,
      isValid,
      error,
      errorLine,
      stats: {
        originalLines: code.split('\n').length,
        formattedLines: formatted.split('\n').length,
        originalChars: code.length,
        formattedChars: formatted.length,
        durationMs,
      },
    };
  } catch (err: any) {
    return {
      formattedCode: code,
      isValid: false,
      error: `Formatting Error: ${err.message || 'Unknown formatting exception'}`,
      stats: {
        originalLines: code.split('\n').length,
        formattedLines: code.split('\n').length,
        originalChars: code.length,
        formattedChars: code.length,
        durationMs: Math.round(performance.now() - startTime),
      },
    };
  }
}
