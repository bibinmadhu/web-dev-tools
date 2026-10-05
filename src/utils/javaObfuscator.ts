// Java Code Obfuscator & De-Obfuscator Engine

export interface ObfuscatorOptions {
  namingStyle: 'alphabetical' | 'hexadecimal' | 'customPrefix' | 'numeric';
  customClassPrefix?: string;
  customVarPrefix?: string;
  customMethodPrefix?: string;
  customPathPrefix?: string;
  obfuscateClasses: boolean;
  obfuscateVariables: boolean;
  obfuscateMethods: boolean;
  obfuscateExternalMethods?: boolean; // Obfuscate invocations of methods belonging to other classes
  obfuscateRestPaths?: boolean; // Obfuscate Spring & JAX-RS REST controller endpoint paths
  obfuscatePackages: boolean;
  encryptStrings: boolean;
  stripComments: boolean;
  preserveMain: boolean;
  preserveGettersSetters: boolean;
  preserveAnnotated: boolean;
  excludedPackages: string[];
  customExclusions: string[];
}

export interface JavaObfuscationMapping {
  classes: Record<string, string>; // Original -> Obfuscated
  variables: Record<string, string>;
  methods: Record<string, string>;
  packages: Record<string, string>;
  paths?: Record<string, string>; // Original path -> Obfuscated path
  reverseMapping: Record<string, string>; // Obfuscated -> Original
}

export interface JavaObfuscationResult {
  obfuscatedCode: string;
  mapping: JavaObfuscationMapping;
  stats: {
    originalSize: number;
    obfuscatedSize: number;
    classesRenamed: number;
    variablesRenamed: number;
    methodsRenamed: number;
    packagesRenamed: number;
    pathsRenamed: number;
  };
}

export const DEFAULT_EXCLUDED_PACKAGES = [
  'java.',
  'javax.',
  'jakarta.',
  'org.springframework.',
  'android.',
  'androidx.',
  'org.junit.',
  'com.fasterxml.jackson.',
  'org.slf4j.',
  'com.google.',
  'org.apache.',
  'lombok.',
];

export const DEFAULT_JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'record', 'sealed', 'non-sealed', 'permits', 'var', 'yield', 'true',
  'false', 'null',
  // Java Standard Types
  'String', 'Object', 'Integer', 'Long', 'Boolean', 'Double', 'Float', 'Byte', 'Short', 'Character', 'Number', 'Void',
  'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'TreeMap', 'Set', 'HashSet', 'TreeSet', 'Collection', 'Collections', 'Arrays', 'Vector', 'Stack',
  'Optional', 'Stream', 'Collectors', 'Collector', 'Iterator', 'Iterable',
  'System', 'Math', 'Thread', 'Runnable', 'Callable', 'Future', 'CompletableFuture', 'Executor', 'Executors',
  'Exception', 'RuntimeException', 'Throwable', 'Error', 'IllegalArgumentException', 'IllegalStateException', 'NullPointerException', 'IndexOutOfBoundsException', 'IOException',
  'Override', 'Deprecated', 'SuppressWarnings', 'FunctionalInterface', 'SafeVarargs',
  'Date', 'Calendar', 'TimeZone', 'Instant', 'Duration', 'LocalDate', 'LocalDateTime', 'ZonedDateTime', 'LocalTime', 'DateTimeFormatter',
  'UUID', 'BigInteger', 'BigDecimal', 'Base64',
  'InputStream', 'OutputStream', 'FileInputStream', 'FileOutputStream', 'BufferedReader', 'BufferedWriter', 'File', 'Path', 'Paths', 'Files', 'StringBuilder', 'StringBuffer',
  'Logger', 'LoggerFactory', 'Log',
  // Spring Framework Annotations & Types
  'RestController', 'Controller', 'Service', 'Component', 'Repository', 'Bean', 'Configuration', 'Autowired', 'Qualifier', 'Value',
  'RequestMapping', 'GetMapping', 'PostMapping', 'PutMapping', 'DeleteMapping', 'PatchMapping', 'PathVariable', 'RequestParam', 'RequestBody', 'ResponseBody', 'RequestHeader',
  'SpringBootApplication', 'EnableAutoConfiguration', 'ComponentScan', 'SpringBootTest',
  'Valid', 'NotNull', 'NotBlank', 'NotEmpty', 'Size', 'Min', 'Max',
  'ResponseEntity', 'HttpStatus', 'HttpHeaders',
  // JPA / Jakarta / Hibernate
  'Entity', 'Table', 'Id', 'GeneratedValue', 'Column', 'Transient', 'ManyToOne', 'OneToMany', 'ManyToMany', 'JoinColumn', 'Embedded', 'Embeddable',
  // Jackson / Gson / Lombok
  'JsonProperty', 'JsonIgnore', 'JsonInclude', 'Getter', 'Setter', 'NoArgsConstructor', 'AllArgsConstructor', 'RequiredArgsConstructor', 'Builder', 'Data', 'EqualsAndHashCode', 'ToString', 'Slf4j',
  // Android
  'Bundle', 'AppCompatActivity', 'Activity', 'Fragment', 'Context', 'Intent', 'View', 'TextView', 'Button', 'ImageView', 'Toast', 'SavedState', 'Lifecycle', 'ViewModel',
  // JUnit / Testing
  'Test', 'BeforeEach', 'AfterEach', 'BeforeAll', 'AfterAll', 'DisplayName', 'Nested', 'Disabled', 'ExtendWith', 'Mock', 'InjectMocks', 'Mockito', 'Assert', 'Assertions',
  'main', 'args', 'toString', 'equals', 'hashCode', 'clone', 'getClass', 'notify', 'notifyAll', 'wait'
]);

// Standard JDK, standard library, and framework methods that must NOT be obfuscated
export const STANDARD_JAVA_METHODS = new Set([
  // java.lang.Object
  'toString', 'equals', 'hashCode', 'clone', 'getClass', 'notify', 'notifyAll', 'wait', 'finalize',
  // Collections / List / Set / Queue / Deque
  'add', 'addAll', 'remove', 'removeAll', 'retainAll', 'clear', 'size', 'isEmpty', 'contains', 'containsAll',
  'iterator', 'toArray', 'forEach', 'spliterator', 'stream', 'parallelStream',
  'get', 'set', 'indexOf', 'lastIndexOf', 'listIterator', 'subList', 'sort', 'replaceAll',
  'poll', 'peek', 'offer', 'element', 'push', 'pop', 'addFirst', 'addLast', 'removeFirst', 'removeLast',
  'getFirst', 'getLast', 'peekFirst', 'peekLast', 'offerFirst', 'offerLast', 'pollFirst', 'pollLast',
  // Map
  'put', 'putAll', 'putIfAbsent', 'replace', 'compute', 'computeIfAbsent', 'computeIfPresent',
  'merge', 'containsKey', 'containsValue', 'keySet', 'values', 'entrySet', 'getOrDefault',
  // Stream API / Collectors
  'filter', 'map', 'flatMap', 'mapToInt', 'mapToLong', 'mapToDouble', 'flatMapToInt', 'flatMapToLong', 'flatMapToDouble',
  'distinct', 'sorted', 'limit', 'skip', 'takeWhile', 'dropWhile',
  'reduce', 'collect', 'min', 'max', 'count', 'anyMatch', 'allMatch', 'noneMatch',
  'findFirst', 'findAny', 'toList', 'toSet', 'toMap', 'toCollection', 'joining',
  'groupingBy', 'partitioningBy', 'flatMapping', 'filtering', 'counting',
  // Optional
  'of', 'ofNullable', 'empty', 'isPresent', 'ifPresent', 'ifPresentOrElse',
  'orElse', 'orElseGet', 'orElseThrow', 'or',
  // String / CharSequence / StringBuilder
  'length', 'charAt', 'subSequence', 'substring', 'concat', 'matches', 'replaceFirst',
  'split', 'toLowerCase', 'toUpperCase', 'trim', 'strip', 'stripLeading', 'stripTrailing', 'stripIndent',
  'isBlank', 'lines', 'repeat', 'indent', 'transform', 'formatted', 'intern', 'getBytes', 'toCharArray',
  'valueOf', 'copyValueOf', 'startsWith', 'endsWith', 'compareTo', 'compareToIgnoreCase', 'equalsIgnoreCase',
  'regionMatches', 'format', 'append', 'insert', 'delete', 'deleteCharAt', 'reverse', 'capacity', 'setLength',
  // Primitive wrappers / Numbers / Math
  'intValue', 'longValue', 'floatValue', 'doubleValue', 'byteValue', 'shortValue', 'booleanValue', 'charValue',
  'parseInt', 'parseLong', 'parseDouble', 'parseFloat', 'parseBoolean', 'parseByte', 'parseShort',
  'abs', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sqrt', 'cbrt', 'pow', 'exp', 'log', 'log10',
  'round', 'floor', 'ceil', 'rint', 'random', 'clamp', 'toDegrees', 'toRadians',
  // System / Runtime / Thread
  'print', 'println', 'printf', 'currentTimeMillis', 'nanoTime', 'arraycopy', 'identityHashCode',
  'exit', 'gc', 'runFinalization', 'getenv', 'getProperty', 'setProperty', 'clearProperty',
  'start', 'run', 'join', 'sleep', 'interrupt', 'isAlive', 'isInterrupted', 'interrupted',
  'currentThread', 'yield', 'setPriority', 'getPriority', 'setName', 'getName',
  // IO / NIO
  'read', 'readAllBytes', 'readNBytes', 'readLine', 'readFully', 'write', 'writeBytes', 'writeChars', 'writeUTF',
  'flush', 'close', 'open', 'exists', 'notExists', 'createFile', 'createDirectory', 'createDirectories',
  'deleteIfExists', 'copy', 'move', 'walk', 'find',
  // Exceptions
  'getMessage', 'getLocalizedMessage', 'getCause', 'initCause', 'printStackTrace', 'getStackTrace', 'setStackTrace',
  'addSuppressed', 'getSuppressed',
  // Common Framework / Library idioms
  'builder', 'build', 'newInstance', 'getInstance',
  'info', 'warn', 'error', 'debug', 'trace',
  'assertEquals', 'assertNotEquals', 'assertTrue', 'assertFalse', 'assertNull', 'assertNotNull',
  'assertSame', 'assertNotSame', 'assertThrows', 'assertDoesNotThrow', 'assertThat', 'verify', 'when', 'given', 'then',
  'status', 'body', 'headers', 'ok', 'badRequest', 'notFound', 'created', 'accepted', 'noContent',
  // Common Enum methods
  'name', 'ordinal',
]);

// Helper to generate obfuscated names
function generateName(
  idx: number,
  category: 'class' | 'variable' | 'method' | 'package' | 'path',
  style: ObfuscatorOptions['namingStyle'],
  customPrefix?: string
): string {
  if (style === 'customPrefix') {
    const prefix = customPrefix || (
      category === 'class' ? 'Cls' :
      category === 'method' ? 'mth' :
      category === 'package' ? 'pkg' :
      category === 'path' ? 'pth' : 'var'
    );
    return `${prefix}_${idx + 1}`;
  }

  if (style === 'hexadecimal') {
    const pfx = category === 'class' ? '_0xC' :
      category === 'method' ? '_0xm' :
      category === 'package' ? '_0xp' :
      category === 'path' ? '_0xP' : '_0xv';
    return `${pfx}${(idx + 1).toString(16)}`;
  }

  if (style === 'numeric') {
    const pfx = category === 'class' ? 'C' :
      category === 'method' ? 'm' :
      category === 'package' ? 'pkg' :
      category === 'path' ? 'pth' : 'v';
    return `${pfx}${idx + 1}`;
  }

  // Default: Alphabetical
  if (category === 'class') {
    let name = '';
    let n = idx;
    while (n >= 0) {
      name = String.fromCharCode(65 + (n % 26)) + name;
      n = Math.floor(n / 26) - 1;
    }
    return name;
  } else if (category === 'package') {
    let name = '';
    let n = idx;
    while (n >= 0) {
      name = String.fromCharCode(97 + (n % 26)) + name;
      n = Math.floor(n / 26) - 1;
    }
    return `pkg_${name}`;
  } else if (category === 'method') {
    let name = '';
    let n = idx;
    while (n >= 0) {
      name = String.fromCharCode(97 + (n % 26)) + name;
      n = Math.floor(n / 26) - 1;
    }
    return name;
  } else if (category === 'path') {
    let name = '';
    let n = idx;
    while (n >= 0) {
      name = String.fromCharCode(97 + (n % 26)) + name;
      n = Math.floor(n / 26) - 1;
    }
    return `p_${name}`;
  } else {
    // variable
    let name = '';
    let n = idx;
    while (n >= 0) {
      name = String.fromCharCode(97 + (n % 26)) + name;
      n = Math.floor(n / 26) - 1;
    }
    return `v_${name}`;
  }
}

export function obfuscateJavaCode(
  input: string,
  options: Partial<ObfuscatorOptions> = {},
  existingMapping?: JavaObfuscationMapping
): JavaObfuscationResult {
  const opts: ObfuscatorOptions = {
    namingStyle: options.namingStyle || 'alphabetical',
    customClassPrefix: options.customClassPrefix || 'Cls',
    customVarPrefix: options.customVarPrefix || 'v',
    customMethodPrefix: options.customMethodPrefix || 'm',
    customPathPrefix: options.customPathPrefix || 'pth',
    obfuscateClasses: options.obfuscateClasses !== false,
    obfuscateVariables: options.obfuscateVariables !== false,
    obfuscateMethods: options.obfuscateMethods !== false,
    obfuscateExternalMethods: options.obfuscateExternalMethods !== false,
    obfuscateRestPaths: options.obfuscateRestPaths !== false,
    obfuscatePackages: options.obfuscatePackages !== false,
    encryptStrings: Boolean(options.encryptStrings),
    stripComments: options.stripComments !== false,
    preserveMain: options.preserveMain !== false,
    preserveGettersSetters: options.preserveGettersSetters !== false,
    preserveAnnotated: options.preserveAnnotated !== false,
    excludedPackages: options.excludedPackages || DEFAULT_EXCLUDED_PACKAGES,
    customExclusions: options.customExclusions || [],
  };

  const originalSize = new Blob([input]).size;
  if (!input.trim()) {
    return {
      obfuscatedCode: '',
      mapping: { classes: {}, variables: {}, methods: {}, packages: {}, paths: {}, reverseMapping: {} },
      stats: {
        originalSize: 0,
        obfuscatedSize: 0,
        classesRenamed: 0,
        variablesRenamed: 0,
        methodsRenamed: 0,
        packagesRenamed: 0,
        pathsRenamed: 0,
      },
    };
  }

  let code = input;

  // 1. Strip comments if configured
  if (opts.stripComments) {
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/\/\/.*$/gm, '');
  }

  // 1a. Scan all annotation names and attribute identifiers to guarantee annotations are NEVER obfuscated
  const annotationNames = new Set<string>();
  // Match @interface CustomAnnotation definitions
  const interfaceAnnRegex = /@interface\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let ifMatch: RegExpExecArray | null;
  while ((ifMatch = interfaceAnnRegex.exec(code)) !== null) {
    annotationNames.add(ifMatch[1]);
  }

  // Match all @Annotation usages (simple and package-qualified, e.g. @RestController, @org.example.Secured)
  const annotationUsageRegex = /@\s*(?:[A-Za-z_$][A-Za-z0-9_$]*\.)*([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let useMatch: RegExpExecArray | null;
  while ((useMatch = annotationUsageRegex.exec(code)) !== null) {
    annotationNames.add(useMatch[1]);
  }

  const exclusionSet = new Set([
    ...DEFAULT_JAVA_KEYWORDS,
    ...annotationNames,
    ...(opts.customExclusions || []),
  ]);

  const mapping: JavaObfuscationMapping = existingMapping
    ? {
        ...existingMapping,
        paths: { ...(existingMapping.paths || {}) },
        reverseMapping: { ...existingMapping.reverseMapping },
      }
    : { classes: {}, variables: {}, methods: {}, packages: {}, paths: {}, reverseMapping: {} };

  if (!mapping.paths) {
    mapping.paths = {};
  }

  let classCount = Object.keys(mapping.classes).length;
  let varCount = Object.keys(mapping.variables).length;
  let methodCount = Object.keys(mapping.methods).length;
  let pkgCount = Object.keys(mapping.packages).length;
  let pathSegmentCount = 0;
  const pathSegmentMap: Record<string, string> = {};

  // Seed pathSegmentMap from existing mapping paths
  if (mapping.paths) {
    Object.entries(mapping.paths).forEach(([orig, obf]) => {
      const origSegs = orig.split('/').filter(Boolean);
      const obfSegs = obf.split('/').filter(Boolean);
      origSegs.forEach((seg, i) => {
        if (!seg.startsWith('{') && obfSegs[i] && !obfSegs[i].startsWith('{')) {
          pathSegmentMap[seg] = obfSegs[i];
        }
      });
    });
  }

  // Helper to obfuscate a single route path string (e.g. "/api/payments/{id}" -> "/p_a/p_b/{id}")
  const obfuscateSinglePath = (rawPath: string): string => {
    if (mapping.paths![rawPath]) {
      return mapping.paths![rawPath];
    }
    if (rawPath === '/' || rawPath === '') {
      mapping.paths![rawPath] = rawPath;
      return rawPath;
    }

    const hasLeadingSlash = rawPath.startsWith('/');
    const hasTrailingSlash = rawPath.length > 1 && rawPath.endsWith('/');
    const segments = rawPath.split('/').filter(Boolean);

    const obfSegments = segments.map((seg: string) => {
      if (seg.startsWith('{') && seg.endsWith('}')) {
        return seg; // Preserve path variables like {id}, {userId}
      }
      if (!pathSegmentMap[seg]) {
        const newSeg = generateName(pathSegmentCount++, 'path', opts.namingStyle, opts.customPathPrefix);
        pathSegmentMap[seg] = newSeg;
      }
      return pathSegmentMap[seg];
    });

    const obfPath = (hasLeadingSlash ? '/' : '') + obfSegments.join('/') + (hasTrailingSlash ? '/' : '');
    mapping.paths![rawPath] = obfPath;
    mapping.reverseMapping[obfPath] = rawPath;
    return obfPath;
  };

  // 1b. Obfuscate REST controller endpoint paths (Spring & JAX-RS) inside annotations
  if (opts.obfuscateRestPaths) {
    const restAnnotationRegex = /@(RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|Path|MessageMapping)\s*(\(([\s\S]*?)\))?/g;

    code = code.replace(restAnnotationRegex, (fullMatch, annotationName, parenGroup, argsContent) => {
      if (!argsContent) return fullMatch;

      const updatedArgs = argsContent.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (stringMatch: string, pathValue: string, _, offset: number) => {
        const precedingText = argsContent.substring(0, offset);

        const isPathPrefix = /(?:path|value)\s*=\s*(?:\{[^}]*)?$/.test(precedingText);
        const isFirstArg = !precedingText.includes('=') && !/(?:headers|params|produces|consumes|name)\s*=/.test(precedingText);
        const startsWithSlash = pathValue.startsWith('/');

        if (startsWithSlash || isPathPrefix || isFirstArg) {
          const obfPath = obfuscateSinglePath(pathValue);
          return `"${obfPath}"`;
        }

        return stringMatch;
      });

      return `@${annotationName}(${updatedArgs})`;
    });
  }

  // 1c. MASK ALL ANNOTATIONS to guarantee NO annotation is ever obfuscated!
  // Extracts all @Annotation(...) and @Annotation, replacing them with placeholders
  const annotationMasks: string[] = [];
  const annPlaceholderPrefix = '___JAVA_ANN_PH_';

  // Parser to extract balanced annotations
  let annProcessedCode = '';
  let i = 0;
  while (i < code.length) {
    // Check for @annotation start (ensure not part of a comment or string)
    if (code[i] === '@') {
      // Check if this is @interface (annotation definition)
      const afterAt = code.substring(i);
      const interfaceMatch = /^@interface\s+([A-Za-z_$][A-Za-z0-9_$]*)/.exec(afterAt);
      if (interfaceMatch) {
        // Annotation declaration: do not mask the whole body, but register annotation name
        annotationNames.add(interfaceMatch[1]);
        exclusionSet.add(interfaceMatch[1]);
        annProcessedCode += interfaceMatch[0];
        i += interfaceMatch[0].length;
        continue;
      }

      // Check if it's an annotation usage: @[pkg.]Name[(...)]
      const annHeaderMatch = /^@\s*(?:[A-Za-z_$][A-Za-z0-9_$]*\.)*([A-Za-z_$][A-Za-z0-9_$]*)/.exec(afterAt);
      if (annHeaderMatch) {
        const leafName = annHeaderMatch[1];
        annotationNames.add(leafName);
        exclusionSet.add(leafName);

        let endIdx = i + annHeaderMatch[0].length;
        // Check if immediately followed by arguments: ( ... )
        let cursor = endIdx;
        while (cursor < code.length && (code[cursor] === ' ' || code[cursor] === '\t' || code[cursor] === '\n' || code[cursor] === '\r')) {
          cursor++;
        }

        if (cursor < code.length && code[cursor] === '(') {
          // Find matching closing parenthesis handling strings and nesting
          let depth = 1;
          let pCursor = cursor + 1;
          let inStr = false;
          let strQuote = '';

          while (pCursor < code.length && depth > 0) {
            const ch = code[pCursor];
            if (inStr) {
              if (ch === '\\') {
                pCursor += 2;
                continue;
              }
              if (ch === strQuote) {
                inStr = false;
              }
            } else {
              if (ch === '"' || ch === '\'') {
                inStr = true;
                strQuote = ch;
              } else if (ch === '(') {
                depth++;
              } else if (ch === ')') {
                depth--;
              }
            }
            pCursor++;
          }

          if (depth === 0) {
            endIdx = pCursor;
          }
        }

        const fullAnnotationText = code.substring(i, endIdx);
        const ph = `${annPlaceholderPrefix}${annotationMasks.length}___`;
        annotationMasks.push(fullAnnotationText);
        annProcessedCode += ph;
        i = endIdx;
        continue;
      }
    }

    annProcessedCode += code[i];
    i++;
  }

  code = annProcessedCode;

  // 1d. Mask string literals in the remaining code to prevent token replacement inside strings
  const stringLiterals: string[] = [];
  const stringPlaceholderPrefix = '___STR_PLACEHOLDER_';

  code = code.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
    const idx = stringLiterals.length;
    const placeholder = `${stringPlaceholderPrefix}${idx}___`;
    stringLiterals.push(match);
    return placeholder;
  });

  // 2. Package Obfuscation
  if (opts.obfuscatePackages) {
    code = code.replace(/(package\s+)([\w.]+)(;)/g, (match, prefix, pkgName, suffix) => {
      const isExcluded = opts.excludedPackages.some((p) => pkgName.startsWith(p));
      if (isExcluded) return match;

      const parts = pkgName.split('.');
      const obfuscatedParts = parts.map((part: string) => {
        if (exclusionSet.has(part)) return part;
        if (!mapping.packages[part]) {
          const newPkg = generateName(pkgCount++, 'package', opts.namingStyle, opts.customVarPrefix);
          mapping.packages[part] = newPkg;
          mapping.reverseMapping[newPkg] = part;
        }
        return mapping.packages[part];
      });

      return `${prefix}${obfuscatedParts.join('.')}${suffix}`;
    });
  }

  // 3. Class/Interface/Enum/Record & Referenced Custom Types Obfuscation
  if (opts.obfuscateClasses) {
    // 3a. Declared classes/interfaces/enums/records (ensure @interface is NOT matched)
    const classRegex = /(?<!@)\b(class|interface|enum|record)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
    let match: RegExpExecArray | null;
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[2];
      if (!exclusionSet.has(className) && !mapping.classes[className]) {
        const newClass = generateName(classCount++, 'class', opts.namingStyle, opts.customClassPrefix);
        mapping.classes[className] = newClass;
        mapping.reverseMapping[newClass] = className;
      }
    }

    // 3b. Single imports: import com.acme.service.PaymentService;
    const importRegex = /\bimport\s+([\w.]+)\.([A-Za-z_$][A-Za-z0-9_$]*)\s*;/g;
    while ((match = importRegex.exec(code)) !== null) {
      const pkgPath = match[1] + '.';
      const className = match[2];

      const isExcludedPkg = opts.excludedPackages.some((p) => pkgPath.startsWith(p));
      if (!isExcludedPkg && !exclusionSet.has(className) && !mapping.classes[className]) {
        const newClass = generateName(classCount++, 'class', opts.namingStyle, opts.customClassPrefix);
        mapping.classes[className] = newClass;
        mapping.reverseMapping[newClass] = className;
      }
    }

    // 3c. Scan for referenced custom class names in fields, return types, parameters, generics & instantiations
    const customTypeRegex = /\b([A-Z][A-Za-z0-9_$]*)\b/g;
    while ((match = customTypeRegex.exec(code)) !== null) {
      const className = match[1];

      if (exclusionSet.has(className) || mapping.classes[className]) continue;

      // Check if preceded by @ (annotation)
      const prevCharIndex = match.index - 1;
      let isAnnotation = false;
      for (let i = prevCharIndex; i >= 0; i--) {
        const ch = code[i];
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') continue;
        if (ch === '@') {
          isAnnotation = true;
        }
        break;
      }

      if (isAnnotation) continue;

      const newClass = generateName(classCount++, 'class', opts.namingStyle, opts.customClassPrefix);
      mapping.classes[className] = newClass;
      mapping.reverseMapping[newClass] = className;
    }
  }

  // 4. Method Obfuscation (Class declarations & Invocations of methods of other classes)
  if (opts.obfuscateMethods) {
    // 4a. Collect annotated lines if preserveAnnotated is set
    const annotatedLines = new Set<number>();
    const lines = code.split('\n');
    lines.forEach((line, idx) => {
      if (/@(Override|Test|GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping|Autowired|JsonProperty|Value|Column|Id|NotNull|NotBlank)/.test(line)) {
        annotatedLines.add(idx + 1); // target next line
      }
    });

    // 4b. Match method declarations in this class: [modifiers] [ReturnType] methodName([params])
    const methodRegex = /\b(public|protected|private|static|final|synchronized|native|\s)+[\w<>\[\]]+\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = methodRegex.exec(code)) !== null) {
      const methodName = match[2];

      // Check if preserved
      if (exclusionSet.has(methodName)) continue;
      if (STANDARD_JAVA_METHODS.has(methodName)) continue;
      if (opts.preserveMain && methodName === 'main') continue;
      if (opts.preserveGettersSetters && /^(get|set|is)[A-Z]/.test(methodName)) continue;

      // Check line index for annotations
      const lineNum = code.substring(0, match.index).split('\n').length;
      if (opts.preserveAnnotated && (annotatedLines.has(lineNum) || annotatedLines.has(lineNum - 1))) {
        continue;
      }

      if (!mapping.methods[methodName]) {
        const newMethod = generateName(methodCount++, 'method', opts.namingStyle, opts.customMethodPrefix);
        mapping.methods[methodName] = newMethod;
        mapping.reverseMapping[newMethod] = methodName;
      }
    }

    // 4c. Match method invocations of other classes used by this class (e.g. paymentService.executePayment(...), request.getAmount())
    if (opts.obfuscateExternalMethods !== false) {
      // Collect static imports first
      const staticImportedMethods = new Set<string>();
      const staticImportRegex = /\bimport\s+static\s+[\w.]+\.([A-Za-z_$][A-Za-z0-9_$]*)\s*;/g;
      let staticMatch: RegExpExecArray | null;
      while ((staticMatch = staticImportRegex.exec(code)) !== null) {
        const methodName = staticMatch[1];
        if (methodName !== '*' && !exclusionSet.has(methodName) && !STANDARD_JAVA_METHODS.has(methodName)) {
          staticImportedMethods.add(methodName);
          if (!mapping.methods[methodName]) {
            const newMethod = generateName(methodCount++, 'method', opts.namingStyle, opts.customMethodPrefix);
            mapping.methods[methodName] = newMethod;
            mapping.reverseMapping[newMethod] = methodName;
          }
        }
      }

      // 4c-1. Match dot invocations on objects, instances, chained calls, static calls, generic invocations
      // Handles: obj.methodName(, obj. methodName(, obj.<Type>methodName(, ClassName.methodName(, super.methodName(
      const invocationRegex = /(?:\.|\?\.)\s*(?:<[^>]+>\s*)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
      let invMatch: RegExpExecArray | null;
      while ((invMatch = invocationRegex.exec(code)) !== null) {
        const methodName = invMatch[1];

        // Exclude standard Java library / framework methods and keywords
        if (exclusionSet.has(methodName)) continue;
        if (STANDARD_JAVA_METHODS.has(methodName)) continue;
        if (DEFAULT_JAVA_KEYWORDS.has(methodName)) continue;
        if (opts.preserveMain && methodName === 'main') continue;

        if (!mapping.methods[methodName]) {
          const newMethod = generateName(methodCount++, 'method', opts.namingStyle, opts.customMethodPrefix);
          mapping.methods[methodName] = newMethod;
          mapping.reverseMapping[newMethod] = methodName;
        }
      }

      // 4c-2. Match Java 8+ method references: ClassName::methodName or instance::methodName
      const methodRefRegex = /::\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:\(|(?=[,\);\]\}]|\s))/g;
      let refMatch: RegExpExecArray | null;
      while ((refMatch = methodRefRegex.exec(code)) !== null) {
        const methodName = refMatch[1];
        if (exclusionSet.has(methodName)) continue;
        if (STANDARD_JAVA_METHODS.has(methodName)) continue;
        if (DEFAULT_JAVA_KEYWORDS.has(methodName)) continue;
        if (methodName === 'new') continue; // Constructor reference Class::new

        if (!mapping.methods[methodName]) {
          const newMethod = generateName(methodCount++, 'method', opts.namingStyle, opts.customMethodPrefix);
          mapping.methods[methodName] = newMethod;
          mapping.reverseMapping[newMethod] = methodName;
        }
      }
    }
  }

  // 5. Variable Obfuscation (fields, local variables, parameters)
  // Ensure method declarations like 'ReturnType methodName(' are NOT matched as variables
  if (opts.obfuscateVariables) {
    const varRegex = /\b([A-Z][A-Za-z0-9_<>,]*|int|long|boolean|double|float|char|byte|short|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=[=;,)]|\b(?!\s*\())/g;
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(code)) !== null) {
      const varName = match[2];
      if (!exclusionSet.has(varName) && !mapping.methods[varName] && !mapping.classes[varName]) {
        if (!mapping.variables[varName]) {
          const newVar = generateName(varCount++, 'variable', opts.namingStyle, opts.customVarPrefix);
          mapping.variables[varName] = newVar;
          mapping.reverseMapping[newVar] = varName;
        }
      }
    }
  }

  // 6. Apply Replacements to Code (Annotations are completely masked and safe)
  // Replace Classes first (longer names first)
  Object.entries(mapping.classes)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([orig, obfuscated]) => {
      const regex = new RegExp(`(?<!@)\\b${orig}\\b`, 'g');
      code = code.replace(regex, obfuscated);
    });

  // Replace Methods (including external methods of other classes)
  Object.entries(mapping.methods)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([orig, obfuscated]) => {
      const regex = new RegExp(`\\b${orig}\\b`, 'g');
      code = code.replace(regex, obfuscated);
    });

  // Replace Variables
  Object.entries(mapping.variables)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([orig, obfuscated]) => {
      const regex = new RegExp(`\\b${orig}\\b`, 'g');
      code = code.replace(regex, obfuscated);
    });

  // Replace Packages inside imports/package declarations
  if (opts.obfuscatePackages) {
    Object.entries(mapping.packages)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([orig, obfuscated]) => {
        const regex = new RegExp(`\\b${orig}\\b`, 'g');
        code = code.replace(regex, obfuscated);
      });
  }

  // 7. Unmask / Encrypt String Literals
  stringLiterals.forEach((literal, idx) => {
    const placeholder = `${stringPlaceholderPrefix}${idx}___`;
    if (opts.encryptStrings) {
      const rawString = literal.substring(1, literal.length - 1);
      const b64 = btoa(rawString);
      const encryptedExpr = `new String(java.util.Base64.getDecoder().decode("${b64}"))`;
      code = code.replace(placeholder, encryptedExpr);
    } else {
      code = code.replace(placeholder, literal);
    }
  });

  // 8. Unmask Annotations: guarantees that NO annotation name, package, or attribute was obfuscated,
  // while REST controller paths were properly obfuscated and class literals (.class) are updated if mapped
  annotationMasks.forEach((annText, idx) => {
    const ph = `${annPlaceholderPrefix}${idx}___`;
    let restoredAnn = annText;
    // Update any class literals inside the annotation e.g. PaymentController.class -> A.class
    Object.entries(mapping.classes).forEach(([origClass, obfClass]) => {
      restoredAnn = restoredAnn.replace(new RegExp(`\\b${origClass}\\.class\\b`, 'g'), `${obfClass}.class`);
    });
    code = code.replace(ph, restoredAnn);
  });

  const obfuscatedSize = new Blob([code]).size;

  return {
    obfuscatedCode: code,
    mapping,
    stats: {
      originalSize,
      obfuscatedSize,
      classesRenamed: Object.keys(mapping.classes).length,
      variablesRenamed: Object.keys(mapping.variables).length,
      methodsRenamed: Object.keys(mapping.methods).length,
      packagesRenamed: Object.keys(mapping.packages).length,
      pathsRenamed: Object.keys(mapping.paths || {}).length,
    },
  };
}

export function deobfuscateJavaCode(
  inputCode: string,
  mapping: JavaObfuscationMapping | Record<string, string>
): string {
  if (!inputCode.trim()) return '';

  const reverseMap: Record<string, string> = {};

  if (mapping && typeof mapping === 'object') {
    // 1a. If mapping has reverseMapping with entries, use obf -> orig
    if ('reverseMapping' in mapping && mapping.reverseMapping && typeof mapping.reverseMapping === 'object') {
      Object.entries(mapping.reverseMapping).forEach(([obf, orig]) => {
        if (obf && orig && typeof obf === 'string' && typeof orig === 'string') {
          reverseMap[obf.trim()] = orig.trim();
        }
      });
    }

    // 1b. Also collect from categories (classes, variables, methods, packages, paths) where orig -> obf
    const categoryMaps = [
      (mapping as JavaObfuscationMapping).classes,
      (mapping as JavaObfuscationMapping).variables,
      (mapping as JavaObfuscationMapping).methods,
      (mapping as JavaObfuscationMapping).packages,
      (mapping as JavaObfuscationMapping).paths,
    ];

    categoryMaps.forEach((catMap) => {
      if (catMap && typeof catMap === 'object') {
        Object.entries(catMap).forEach(([orig, obf]) => {
          if (orig && obf && typeof orig === 'string' && typeof obf === 'string') {
            const trimmedObf = obf.trim();
            const trimmedOrig = orig.trim();
            if (!reverseMap[trimmedObf]) {
              reverseMap[trimmedObf] = trimmedOrig;
            }
          }
        });
      }
    });

    // 1c. If reverseMap is still empty or flat object with simple key-value entries
    const knownKeys = new Set(['classes', 'variables', 'methods', 'packages', 'paths', 'reverseMapping']);
    Object.entries(mapping).forEach(([k, v]) => {
      if (knownKeys.has(k)) return;
      if (typeof k !== 'string' || !v) return;

      const kStr = k.trim();
      const vStr = String(v).trim();

      // Check which key is in inputCode to determine obfuscated token
      if (inputCode.includes(kStr)) {
        reverseMap[kStr] = vStr;
      } else if (inputCode.includes(vStr)) {
        reverseMap[vStr] = kStr;
      } else {
        if (!reverseMap[kStr]) {
          reverseMap[kStr] = vStr;
        }
      }
    });
  }

  let code = inputCode;

  // 2. Deobfuscate REST controller paths
  const pathPairs: [string, string][] = [];

  const addPathPair = (obf: string, orig: string) => {
    if (!obf || !orig || obf === orig) return;
    const trimmedObf = obf.trim();
    const trimmedOrig = orig.trim();
    if (!pathPairs.some(([o]) => o === trimmedObf)) {
      pathPairs.push([trimmedObf, trimmedOrig]);
    }
  };

  // Collect from mapping.paths
  if (mapping && typeof mapping === 'object' && 'paths' in mapping && mapping.paths) {
    Object.entries(mapping.paths).forEach(([k, v]) => {
      if (k && v && typeof k === 'string' && typeof v === 'string') {
        const kStr = k.trim();
        const vStr = v.trim();
        if (inputCode.includes(kStr) && !inputCode.includes(vStr)) {
          addPathPair(kStr, vStr);
        } else if (inputCode.includes(vStr) && !inputCode.includes(kStr)) {
          addPathPair(vStr, kStr);
        } else {
          addPathPair(vStr, kStr);
        }
      }
    });
  }

  // Collect from reverseMapping
  if (mapping && typeof mapping === 'object' && 'reverseMapping' in mapping && mapping.reverseMapping) {
    Object.entries(mapping.reverseMapping).forEach(([obf, orig]) => {
      if (typeof obf === 'string' && typeof orig === 'string') {
        if (obf.includes('/') || orig.includes('/') || obf.startsWith('p_') || obf.startsWith('pth')) {
          addPathPair(obf, orig);
        }
      }
    });
  }

  // Also collect from reverseMap
  Object.entries(reverseMap).forEach(([obf, orig]) => {
    if (typeof obf === 'string' && typeof orig === 'string') {
      if (obf.includes('/') || orig.includes('/') || obf.startsWith('p_') || obf.startsWith('pth')) {
        addPathPair(obf, orig);
      }
    }
  });

  // Synthesize composite paths (cross product of class level & method level paths)
  const basePairs = [...pathPairs];
  basePairs.forEach(([obf1, orig1]) => {
    basePairs.forEach(([obf2, orig2]) => {
      if (obf1 !== obf2 && obf1.startsWith('/') && obf2.startsWith('/')) {
        const combinedObf = (obf1.endsWith('/') ? obf1.slice(0, -1) : obf1) + '/' + (obf2.startsWith('/') ? obf2.slice(1) : obf2);
        const combinedOrig = (orig1.endsWith('/') ? orig1.slice(0, -1) : orig1) + '/' + (orig2.startsWith('/') ? orig2.slice(1) : orig2);
        addPathPair(combinedObf, combinedOrig);
      }
    });
  });

  // Also extract individual segment pairs from path pairs
  const segmentPairs: [string, string][] = [];
  pathPairs.forEach(([obf, orig]) => {
    const obfParts = obf.split('/').filter(Boolean);
    const origParts = orig.split('/').filter(Boolean);
    if (obfParts.length === origParts.length) {
      obfParts.forEach((oPart, idx) => {
        const rPart = origParts[idx];
        if (oPart && rPart && oPart !== rPart && !oPart.startsWith('{') && !rPart.startsWith('{')) {
          if (!segmentPairs.some(([o]) => o === oPart)) {
            segmentPairs.push([oPart, rPart]);
          }
        }
      });
    }
  });

  // 2a. Replace full and composite paths (longest first)
  pathPairs.sort((a, b) => b[0].length - a[0].length);
  pathPairs.forEach(([obfPath, origPath]) => {
    // Replace exact path in double quotes, single quotes, backticks
    code = code.split(`"${obfPath}"`).join(`"${origPath}"`);
    code = code.split(`'${obfPath}'`).join(`'${origPath}'`);
    code = code.split(`\`${obfPath}\``).join(`\`${origPath}\``);
    // Also replace in URLs, curl commands, and log lines where bounded by quotes, spaces, delimiters, or trailing slash
    const escaped = obfPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startBoundary = '(?<=^|[\\s"\'`(\\[{=:,;>]|https?:\\/\\/[^/\\s]+)';
    const endBoundary = '(?=$|[\\s"\'`)\\]},;?#<\\/])';
    code = code.replace(new RegExp(startBoundary + escaped + endBoundary, 'g'), origPath);
  });

  // 2b. Replace path segments in path/URL contexts (e.g. /p_a/ or /p_a? or /p_a")
  segmentPairs.sort((a, b) => b[0].length - a[0].length);
  segmentPairs.forEach(([obfSeg, origSeg]) => {
    const segEscaped = obfSeg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    code = code.replace(new RegExp(`(?<=\\/)${segEscaped}(?=[\\/\\s"'\`)\\]},;?#<]|$)`, 'g'), origSeg);
  });

  // 3. Filter out empty or self-referential keys for identifier tokens
  const validKeys = Object.keys(reverseMap)
    .filter((k) => k && reverseMap[k] && k !== reverseMap[k] && !k.includes('/'))
    .sort((a, b) => b.length - a.length);

  if (validKeys.length > 0) {
    const escapedKeys = validKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(?<![a-zA-Z0-9_$])(?:${escapedKeys.join('|')})(?![a-zA-Z0-9_$])`, 'g');

    code = code.replace(regex, (matched) => {
      return reverseMap[matched] || matched;
    });
  }

  // 4. Decrypt Base64 string expressions if present
  code = code.replace(
    /new\s+String\s*\(\s*java\.util\.Base64\.getDecoder\(\)\.decode\(\s*"([A-Za-z0-9+/=]+)"\s*\)\s*\)/g,
    (_, b64) => {
      try {
        return `"${atob(b64)}"`;
      } catch {
        return _;
      }
    }
  );

  return code;
}
