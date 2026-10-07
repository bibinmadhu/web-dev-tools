import './polyfills';
import {
  generatePostgresUpdateQuery,
  formatPostgresValue,
  parseCsvOrTsv,
  inferColumnType,
  parseDelimitedValues,
  createDbUpdateConfigExport,
  validateAndParseDbUpdateConfig,
  DB_UPDATE_PRESETS,
} from './dbUpdateQueryGenerator';
import {
  generatePostgresSelectQuery,
  createDbSelectConfigExport,
  validateAndParseDbSelectConfig,
  DB_SELECT_PRESETS,
  stripAliasFromExpression,
  prefixAliasToProjection,
  prefixAliasToOrderBy,
} from './dbSelectQueryGenerator';
import {
  beautifyJson,
  obfuscateCode,
  base64Encode,
  base64Decode,
  testRegex,
  decodeJwt,
  convertColor,
  generateUuid,
  parseCron,
} from './toolFunctions';
import { obfuscateJavaCode, deobfuscateJavaCode } from './javaObfuscator';
import { obfuscateDualJavaFiles, deobfuscateDualJavaFiles } from './javaDualObfuscator';
import { JAVA_DUAL_PRESETS } from './javaDualPresets';
import {
  parseAndNormalizeMapping,
  mergeProjectMappings,
  exportMappingContent,
  computeMappingStats,
  createEmptyMapping,
} from './projectMappingManager';
import {
  createSamplePdf,
  getPdfMetadata,
  signPdfDocument,
  calculateBoxPosition,
  computeSignatureBoxMetrics,
  parsePageRange,
  resolveTargetPageNumbers,
  getDefaultSignatureDate,
  formatSignatureDate,
} from './pdfSigner';
import { convertPdfDocument, extractPdfContent } from './pdfConverter';
import { formatJavaCode, sampleUnformattedJavaCode } from './javaFormatter';
import {
  formatCode,
  formatPython,
  formatYaml,
  formatJava,
  formatJson,
  formatSql,
  detectLanguage,
  SUPPORTED_LANGUAGES,
} from './codeFormatters';
import {
  obfuscatePythonCode,
  deobfuscatePythonCode,
} from './pythonObfuscator';
import { PYTHON_PRESETS } from './pythonPresets';
import {
  convertChessGame,
  detectChessFormat,
  generateColumnarText,
  generateChessCsv,
  generateAnalysisLinks,
} from './chessConverter';
import { USER_ATTACHED_CHESS_HTML, CHESS_PRESETS } from './chessPresets';
import {
  createUserBackup,
  validateUserBackupJson,
  applyUserBackup,
} from './userBackupManager';
import {
  addClipboardItem,
  getClipboardHistory,
  removeClipboardItem,
  clearClipboardHistory,
  togglePinClipboardItem,
  detectSnippetType,
  generateSnippetPreview,
  exportClipboardHistoryJson,
  importClipboardHistoryJson,
  MAX_CLIPBOARD_ITEMS,
} from './clipboardManager';
import {
  generatePostgresInsertQuery,
  parsePostgresSchema,
  createDbInsertConfigExport,
  validateAndParseDbInsertConfig,
  parsePreferredValuesInput,
  generateCreateTableDdl,
  DEFAULT_INSERT_OPTIONS,
  DB_INSERT_PRESETS,
  InsertColumnConfig,
  InsertSharedPropertyRule,
  findMatchingInsertSharedProperty,
  ENTERPRISE_INSERT_SHARED_TEMPLATES,
} from './dbInsertQueryGenerator';
import {
  parseJsonSafe,
  tryFixCommonJsonErrors,
  searchAndReplaceJson,
  countMatches,
  updateNodeAtPath,
  deleteNodeAtPath,
  insertChildAtPath,
  duplicateNodeAtPath,
  renameKeyAtPath,
  sortJsonKeys,
  flattenJson,
  unflattenJson,
  jsonToCsv,
  csvToJson,
  jsonToYaml,
  yamlToJson,
  generateTypeScriptTypes,
  queryJsonWithExpression,
  calculateJsonStats,
  JSON_EDITOR_PRESETS,
} from './jsonEditorUtils';
import {
  parseHeadersInput,
  inferColumnRule,
  generateCsvDataset,
  extractHeadersAndInferRulesFromCsv,
  csvToSqlInsert,
  exportCsvPopulatorConfig,
  validateAndParseCsvPopulatorConfig,
  CSV_POPULATOR_PRESETS,
} from './csvAutoPopulator';
import {
  parseCreateTableDdl,
  generateRowCopySql,
  simulateRowCopy,
  formatSqlLiteral,
  buildColumnSqlExpression,
  DB_ROW_COPY_PRESETS,
  DbRowCopyConfig,
} from './dbRowCopyGenerator';
import {
  DbProjectRule,
  findMatchingProjectRule,
  applyProjectRulesToColumns,
  exportProjectRulesJson,
  validateAndParseProjectRulesJson,
  DEFAULT_PROJECT_RULES,
  DEFAULT_COLUMN_MAPPINGS,
} from './dbProjectRules';
import { parseCurlCommand, tokenizeCurlCommand } from './curlParser';
import { generatePythonCode, generateTypeScriptCode } from './curlToCode';
import { flattenCurlCommand, beautifyCurlCommand, normalizeSmartChars } from './curlFlattener';
import {
  calculateInvoiceTotals,
  formatInvoiceCurrency,
  createDefaultInvoice,
  generateInvoicePdf,
  SAMPLE_INVOICES,
  POPULAR_CURRENCIES,
  exportInvoiceTemplateJson,
  parseInvoiceTemplate,
  createInvoiceTemplateFile,
} from './invoiceGenerator';
import {
  createSampleMarkdownPdf,
  convertPdfToMarkdown,
  calculateMarkdownStats,
  renderMarkdownToHtml,
} from './pdfToMarkdown';
import {
  getDefaultContractorAgreement,
  generateAgreementMarkdown,
  generateAgreementPdf,
  generateAgreementDocx,
  generateAgreementHtml,
  interpolatePlaceholders,
  cleanPdfText,
  wrapText,
  getAgreementCurrency,
  formatAgreementCurrency,
} from './agreementGenerator';
import { getAgreementPresets } from './agreementPresets';
import {
  obfuscateMultipleSets,
  deobfuscateMultipleSets,
  deobfuscateCode,
  MultiObfuscatorOptions,
  DEFAULT_MULTI_OBFUSCATOR_OPTIONS,
} from './multiObfuscator';
import { MULTI_OBFUSCATOR_PRESETS } from './multiObfuscatorPresets';
import {
  formatQrPayload,
  generateQrSvg,
  getQrMatrix,
  DEFAULT_QR_OPTIONS,
} from './qrGenerator';
import {
  generateChainedPythonScript,
  generateTokenExtractionCode,
  prepareSubsequentRequest,
  getHeaderValuePythonExpr,
  DEFAULT_EXTRACTION_CONFIG,
  DEFAULT_INJECTION_CONFIG,
  DEFAULT_OPTIONS,
} from './curlChainConverter';
import { CURL_CHAIN_PRESETS } from './curlChainPresets';
import {
  parseToDataGrid,
  detectDelimiter,
  extractColumnData,
  calculateColumnStats,
  transposeDataGrid,
  deduplicateGridRows,
  sortGridRows,
  filterGridRows,
  exportDataGrid,
  DATA_GRID_PRESETS,
} from './dataGridConverter';
import {
  DEFAULT_MATCHER_CONFIG,
  DEFAULT_SAMPLE_ROWS,
  evaluateLocalRow,
  generatePostgresCategoryQueries,
  generatePg8000PythonScript,
  parseCategoryMetadataInput,
  createMatcherConfigExport,
  validateAndParseMatcherConfig,
  generateCategoryMismatchFixQueries,
  CATEGORY_MATCHER_PRESETS,
} from './dbCategoryMatcher';
import {
  DEFAULT_QUERY_BUILDER_CONFIG,
  generatePostgresQueries,
  parseExcelListInput,
  normalizePostgresDate,
  formatSqlValue,
  createDbQueryBuilderExport,
  validateAndParseDbQueryBuilderConfig,
  QUERY_BUILDER_PRESETS,
} from './dbQueryBuilder';
import {
  matchDataSets,
  generateReconciliationSql,
  exportDiffToCsv,
  exportDiffToMarkdown,
  parseDelimitedText,
  toCanonicalHeaderKey,
  areValuesEqual,
  DEFAULT_DATA_SET_MATCHER_CONFIG,
  SAMPLE_DATASETS,
  sortMatchedRows,
  tryParseNumericValue,
} from './dataSetMatcher';
import {
  obfuscateSqlQuery,
  deobfuscateSqlQuery,
  validateImportedMapping,
  tokenizeSql,
  analyzeSqlTokens,
  DEFAULT_OBFUSCATION_OPTIONS,
  SQL_QUERY_PRESETS,
} from './sqlQueryObfuscator';
import { TestSuiteSummary, UnitTestResult } from '../types';

export async function runAllUnitTests(): Promise<TestSuiteSummary> {
  const results: UnitTestResult[] = [];
  const startTime = performance.now();

  async function testAsync(suiteName: string, testName: string, fn: () => Promise<void> | void) {
    const start = performance.now();
    try {
      await fn();
      results.push({
        suiteName,
        testName,
        status: 'passed',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    } catch (err: any) {
      results.push({
        suiteName,
        testName,
        status: 'failed',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
    }
  }

  function test(suiteName: string, testName: string, fn: () => void) {
    const start = performance.now();
    try {
      fn();
      results.push({
        suiteName,
        testName,
        status: 'passed',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    } catch (err: any) {
      results.push({
        suiteName,
        testName,
        status: 'failed',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
    }
  }

  function assertEqual(actual: any, expected: any, msg?: string) {
    if (actual !== expected) {
      throw new Error(msg || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  function assertTrue(condition: boolean, msg?: string) {
    if (!condition) {
      throw new Error(msg || 'Expected condition to be true');
    }
  }

  // --- Suite 1: JSON Beautifier ---
  test('JSON Beautifier', 'Valid JSON pretty printing', () => {
    const raw = '{"name":"DevHub","version":1}';
    const res = beautifyJson(raw, 2);
    assertTrue(res.isValid, 'Should be valid JSON');
    assertEqual(res.output, '{\n  "name": "DevHub",\n  "version": 1\n}');
  });

  test('JSON Beautifier', 'Handles syntax error gracefully', () => {
    const raw = '{"name": "DevHub"';
    const res = beautifyJson(raw);
    assertTrue(!res.isValid, 'Should mark invalid JSON');
    assertTrue(!!res.error, 'Should contain error message');
  });

  // --- Suite 2: Base64 Converter ---
  test('Base64 Encoder', 'Encodes string to Base64', () => {
    const encoded = base64Encode('Hello DevHub');
    assertEqual(encoded, 'SGVsbG8gRGV2SHVi');
  });

  test('Base64 Decoder', 'Decodes valid Base64 string', () => {
    const res = base64Decode('SGVsbG8gRGV2SHVi');
    assertEqual(res.decoded, 'Hello DevHub');
  });

  test('Base64 Decoder', 'Returns error on invalid payload', () => {
    const res = base64Decode('!!!invalid_b64!!!');
    assertTrue(!!res.error, 'Should report decode error');
  });

  // --- Suite 3: Code Obfuscator ---
  test('Code Obfuscator', 'Strips comments & minifies whitespace', () => {
    const input = '// comment\nfunction test() { return "hello"; }';
    const res = obfuscateCode(input, { compact: true });
    assertTrue(!res.obfuscated.includes('// comment'), 'Should strip comments');
    assertTrue(res.obfuscatedSize < res.originalSize, 'Should reduce byte count');
  });

  test('Code Obfuscator', 'Hex-encodes string literals when option set', () => {
    const input = 'const title = "DevHub";';
    const res = obfuscateCode(input, { hexEncodeStrings: true });
    assertTrue(res.obfuscated.includes('\\x'), 'Should contain hex string escapes');
  });

  // --- Suite 4: Regex Tester ---
  test('Regex Tester', 'Matches email pattern accurately', () => {
    const text = 'Contact support@devhub.io or admin@test.com';
    const pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
    const res = testRegex(pattern, 'g', text);
    assertEqual(res.matches.length, 2);
    assertEqual(res.matches[0].match, 'support@devhub.io');
    assertEqual(res.matches[1].match, 'admin@test.com');
  });

  test('Regex Tester', 'Reports invalid syntax error', () => {
    const res = testRegex('[a-z(', 'g', 'sample');
    assertTrue(!!res.error, 'Should catch regex syntax error');
  });

  // --- Suite 5: JWT Decoder ---
  test('JWT Decoder', 'Parses valid token header & payload', () => {
    const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldkh1YiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const res = decodeJwt(sampleJwt);
    assertEqual(res.header?.alg, 'HS256');
    assertEqual(res.payload?.name, 'DevHub User');
  });

  test('JWT Decoder', 'Fails on malformed JWT string', () => {
    const res = decodeJwt('not.a.jwt.token.extra');
    assertTrue(!!res.error, 'Should return error for invalid dot count');
  });

  // --- Suite 6: Color Converter ---
  test('Color Converter', 'Converts HEX to RGB and HSL', () => {
    const res = convertColor('#3B82F6');
    assertTrue(res.isValid, 'Should be valid HEX');
    assertEqual(res.rgb, 'rgb(59, 130, 246)');
    assertTrue(res.hsl.startsWith('hsl('));
  });

  // --- Suite 7: UUID Generator ---
  test('UUID Generator', 'Generates valid v4 UUID format', () => {
    const uuid = generateUuid();
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assertTrue(regex.test(uuid), 'Should match v4 UUID pattern');
  });

  // --- Suite 8: Cron Parser ---
  test('Cron Expression Parser', 'Translates standard expression', () => {
    assertEqual(parseCron('* * * * *'), 'Every minute');
    assertEqual(parseCron('0 0 * * *'), 'Every day at midnight (00:00)');
    assertEqual(parseCron('*/15 * * * *'), 'Every 15 minutes');
  });

  // --- Suite 9: Java Code Obfuscator & De-Obfuscator ---
  test('Java Code Obfuscator', 'Obfuscates class, method, variable & custom package names', () => {
    const javaCode = `package com.acme.financial.service;
import java.util.List;
public class PaymentProcessor {
    private double totalAmount;
    public void executePayment(double amount) {
        this.totalAmount = amount * 1.05;
    }
}`;

    const res = obfuscateJavaCode(javaCode, {
      namingStyle: 'alphabetical',
      obfuscateClasses: true,
      obfuscateMethods: true,
      obfuscateVariables: true,
      obfuscatePackages: true,
      preserveGettersSetters: false,
    });

    assertTrue(!res.obfuscatedCode.includes('PaymentProcessor'), 'Class name should be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('executePayment'), 'Method name should be obfuscated');
    assertTrue(res.obfuscatedCode.includes('import java.util.List;'), 'Framework import java.util.List should be preserved');
    assertTrue(res.stats.classesRenamed > 0, 'Class renamed stat should be > 0');
  });

  test('Java Code Obfuscator', 'Preserves main() entry point & framework annotations', () => {
    const javaCode = `package com.example.app;
public class AppRunner {
    public static void main(String[] args) {
        System.out.println("Started");
    }
}`;

    const res = obfuscateJavaCode(javaCode, { preserveMain: true });
    assertTrue(res.obfuscatedCode.includes('public static void main('), 'main() method signature should be preserved');
  });

  test('Java Code Obfuscator', 'Obfuscates class names used in field types and variable declarations', () => {
    const javaCode = `package com.acme.financial.controller;
import com.acme.financial.service.PaymentService;
public class PaymentController {
    private PaymentService paymentService;
}`;

    const res = obfuscateJavaCode(javaCode, {
      obfuscateClasses: true,
      obfuscateVariables: true,
    });

    assertTrue(!res.obfuscatedCode.includes('PaymentService'), 'Field class type PaymentService should be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('paymentService'), 'Field variable paymentService should be obfuscated');
    assertTrue(Boolean(res.mapping.classes['PaymentService']), 'PaymentService mapping should exist in classes');
    assertTrue(Boolean(res.mapping.variables['paymentService']), 'paymentService mapping should exist in variables');
  });

  test('Java Code Obfuscator & De-Obfuscator', 'Round-trip obfuscation and de-obfuscation', () => {
    const sampleCode = `package com.acme.service;
public class OrderService {
    public void processOrder(String orderId) {
        System.out.println("Processing " + orderId);
    }
}`;

    const obfRes = obfuscateJavaCode(sampleCode);
    const restoredCode = deobfuscateJavaCode(obfRes.obfuscatedCode, obfRes.mapping);

    assertTrue(restoredCode.includes('OrderService'), 'De-obfuscation should restore original Class name');
    assertTrue(restoredCode.includes('processOrder'), 'De-obfuscation should restore original Method name');
    assertTrue(restoredCode.includes('com.acme.service'), 'De-obfuscation should restore original package name');
  });

  test('Java Code Obfuscator & De-Obfuscator', 'De-obfuscates stack traces and supports flat dictionary mappings', () => {
    const stackTrace = `java.lang.NullPointerException: Cannot invoke paymentService because it is null
    at com.a.a.A.a(A.java:24)
    at com.a.b.B.main(B.java:15)`;

    const flatMapping = {
      'com.a.a': 'com.acme.financial.controller',
      'com.a.b': 'com.acme.financial.service',
      'A': 'PaymentController',
      'B': 'PaymentService',
      'a': 'executePayment',
    };

    const deobfuscated = deobfuscateJavaCode(stackTrace, flatMapping);

    assertTrue(deobfuscated.includes('com.acme.financial.controller.PaymentController.executePayment(PaymentController.java:24)'), 'Stack trace should be de-obfuscated accurately');
    assertTrue(deobfuscated.includes('com.acme.financial.service.PaymentService.main(PaymentService.java:15)'), 'Package and class in stack trace should be restored');
  });

  test('Java Code Obfuscator', 'Obfuscates methods of other classes used by the class, preserves annotations, and obfuscates REST controller paths', () => {
    const javaCode = `package com.acme.financial.controller;

import com.acme.financial.service.PaymentService;
import com.acme.financial.client.FraudClient;
import com.acme.financial.dto.PaymentRequest;
import com.acme.financial.dto.PaymentResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private FraudClient fraudClient;

    @PostMapping("/process/{transactionType}")
    public PaymentResponse processTransaction(@RequestBody PaymentRequest request) {
        fraudClient.verifyAccount(request.getAccount());
        double totalAmount = request.getAmount() * 1.05;
        boolean isApproved = paymentService.executePayment(request.getAccount(), totalAmount);
        ExternalHelper.logAuditRecord("Transaction executed");
        return new PaymentResponse("TXN_123", isApproved, "SUCCESS");
    }
}`;

    const res = obfuscateJavaCode(javaCode, {
      namingStyle: 'alphabetical',
      obfuscateClasses: true,
      obfuscateMethods: true,
      obfuscateExternalMethods: true,
      obfuscateRestPaths: true,
      obfuscateVariables: true,
      obfuscatePackages: true,
    });

    // 1. External methods of other classes MUST be obfuscated
    assertTrue(!res.obfuscatedCode.includes('.verifyAccount('), 'External method verifyAccount of FraudClient must be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('.executePayment('), 'External method executePayment of PaymentService must be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('.getAmount('), 'External method getAmount of PaymentRequest must be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('.getAccount('), 'External method getAccount of PaymentRequest must be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('.logAuditRecord('), 'External static method logAuditRecord must be obfuscated');

    assertTrue(Boolean(res.mapping.methods['verifyAccount']), 'verifyAccount mapped in methods');
    assertTrue(Boolean(res.mapping.methods['executePayment']), 'executePayment mapped in methods');
    assertTrue(Boolean(res.mapping.methods['getAmount']), 'getAmount mapped in methods');
    assertTrue(Boolean(res.mapping.methods['getAccount']), 'getAccount mapped in methods');
    assertTrue(Boolean(res.mapping.methods['logAuditRecord']), 'logAuditRecord mapped in methods');

    // 2. Annotations and annotation attributes MUST NOT be obfuscated
    assertTrue(res.obfuscatedCode.includes('@RestController'), '@RestController annotation must NOT be obfuscated');
    assertTrue(res.obfuscatedCode.includes('@RequestMapping('), '@RequestMapping annotation name must NOT be obfuscated');
    assertTrue(res.obfuscatedCode.includes('@CrossOrigin(origins = "*", maxAge = 3600)'), '@CrossOrigin annotation and attributes origins/maxAge must NOT be obfuscated');
    assertTrue(res.obfuscatedCode.includes('@Autowired'), '@Autowired annotation must NOT be obfuscated');
    assertTrue(res.obfuscatedCode.includes('@PostMapping('), '@PostMapping annotation name must NOT be obfuscated');
    assertTrue(res.obfuscatedCode.includes('@RequestBody'), '@RequestBody annotation must NOT be obfuscated');

    // 3. REST controller endpoint paths MUST be obfuscated
    assertTrue(!res.obfuscatedCode.includes('"/api/v1/payments"'), 'Original REST path /api/v1/payments must be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('"/process/{transactionType}"'), 'Original REST path /process/{transactionType} must be obfuscated');
    assertTrue(Boolean(res.mapping.paths?.['/api/v1/payments']), 'REST path /api/v1/payments mapped');
    assertTrue(Boolean(res.mapping.paths?.['/process/{transactionType}']), 'REST path /process/{transactionType} mapped');
    assertTrue(res.mapping.paths?.['/process/{transactionType}']?.includes('{transactionType}'), 'Path variable template {transactionType} preserved in obfuscated path');

    // 4. De-obfuscation restores code and unquoted curl/log paths
    const restoredCode = deobfuscateJavaCode(res.obfuscatedCode, res.mapping);
    assertTrue(restoredCode.includes('verifyAccount'), 'De-obfuscation restores external method verifyAccount');
    assertTrue(restoredCode.includes('executePayment'), 'De-obfuscation restores external method executePayment');
    assertTrue(restoredCode.includes('getAmount'), 'De-obfuscation restores external method getAmount');
    assertTrue(restoredCode.includes('getAccount'), 'De-obfuscation restores external method getAccount');
    assertTrue(restoredCode.includes('"/api/v1/payments"'), 'De-obfuscation restores REST path /api/v1/payments');
    assertTrue(restoredCode.includes('"/process/{transactionType}"'), 'De-obfuscation restores REST path /process/{transactionType}');
    assertTrue(restoredCode.includes('PaymentController'), 'De-obfuscation restores PaymentController class');
    assertTrue(restoredCode.includes('PaymentService'), 'De-obfuscation restores PaymentService class');

    // Test unquoted REST path in curl / log lines
    const curlLine = 'curl -X POST http://localhost:8080' + res.mapping.paths?.['/api/v1/payments'] + ' -H "Content-Type: application/json"';
    const restoredCurl = deobfuscateJavaCode(curlLine, res.mapping);
    assertTrue(restoredCurl.includes('http://localhost:8080/api/v1/payments'), 'De-obfuscation restores unquoted REST endpoint path in curl command');

    // 5. De-obfuscation of composite endpoint URLs, MockMvc tests, and HTTP access logs
    const obfClassPath = res.mapping.paths?.['/api/v1/payments']!;
    const obfMethodPath = res.mapping.paths?.['/process/{transactionType}']!;
    const compositeUrl = `http://localhost:8080${obfClassPath}${obfMethodPath}`;
    const restoredComposite = deobfuscateJavaCode(compositeUrl, res.mapping);
    assertTrue(restoredComposite.includes('http://localhost:8080/api/v1/payments/process/{transactionType}'), 'De-obfuscation restores composite REST controller URLs');

    const mockMvcLine = `mockMvc.perform(post("${obfClassPath}${obfMethodPath}"))`;
    const restoredMockMvc = deobfuscateJavaCode(mockMvcLine, res.mapping);
    assertTrue(restoredMockMvc.includes('mockMvc.perform(post("/api/v1/payments/process/{transactionType}"))'), 'De-obfuscation restores composite endpoint paths in MockMvc tests');

    const httpLogLine = `POST ${obfClassPath}${obfMethodPath}?debug=true HTTP/1.1`;
    const restoredHttpLog = deobfuscateJavaCode(httpLogLine, res.mapping);
    assertTrue(restoredHttpLog.includes('POST /api/v1/payments/process/{transactionType}?debug=true HTTP/1.1'), 'De-obfuscation restores composite REST endpoint in HTTP server logs');

    // Test dynamic path with actual param value
    const dynamicUrl = `http://localhost:8080${obfClassPath}/9981`;
    const restoredDynamic = deobfuscateJavaCode(dynamicUrl, res.mapping);
    assertTrue(restoredDynamic.includes('http://localhost:8080/api/v1/payments/9981'), 'De-obfuscation restores REST prefix when followed by path variable values');
  });

  // --- Suite 9B: Java Class & Test Dual Obfuscator & De-Obfuscator ---
  test('Java Class & Test Dual Obfuscator', 'Synchronized obfuscation of class and test with same mapping keys in same line', () => {
    const mainClass = `package com.acme.ecommerce.service;
public class OrderService {
    public double calculateTotal(double price, int qty) {
        return price * qty;
    }
}`;

    const testClass = `package com.acme.ecommerce.service;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class OrderServiceTest {
    private OrderService orderService = new OrderService();

    @Test
    void testCalculateTotal() {
        double total = orderService.calculateTotal(50.0, 2);
        assertEquals(100.0, total);
    }
}`;

    const res = obfuscateDualJavaFiles({
      mainClassFile: { fileName: 'OrderService.java', code: mainClass },
      testClassFile: { fileName: 'OrderServiceTest.java', code: testClass },
    }, {
      namingStyle: 'alphabetical',
      obfuscateClasses: true,
      obfuscateMethods: true,
      obfuscateVariables: true,
      preserveTestMethods: true,
    });

    const obfOrderService = res.mapping.classes['OrderService'];
    const obfCalculateTotal = res.mapping.methods['calculateTotal'];

    assertTrue(Boolean(obfOrderService), 'OrderService must have a mapped obfuscated class name');
    assertTrue(Boolean(obfCalculateTotal), 'calculateTotal must have a mapped obfuscated method name');

    // Main file checks
    assertTrue(res.mainClassFile.obfuscatedCode.includes(`class ${obfOrderService}`), 'Main file should declare obfuscated class name');
    assertTrue(res.mainClassFile.obfuscatedCode.includes(obfCalculateTotal), 'Main file should rename calculateTotal method');

    // Test file checks - MUST HAVE SAME MAPPING KEYS
    assertTrue(res.testClassFile.obfuscatedCode.includes(`${obfOrderService} `), 'Test file must use the EXACT SAME obfuscated class name as field type');
    assertTrue(res.testClassFile.obfuscatedCode.includes(`new ${obfOrderService}()`), 'Test file must use the EXACT SAME obfuscated class name in instantiation');
    assertTrue(res.testClassFile.obfuscatedCode.includes(`.${obfCalculateTotal}(`), 'Test file must call the EXACT SAME obfuscated method name');

    // Testing assertions & annotations must be preserved
    assertTrue(res.testClassFile.obfuscatedCode.includes('@Test'), '@Test annotation must be preserved');
    assertTrue(res.testClassFile.obfuscatedCode.includes('assertEquals(100.0,'), 'assertEquals assertion must be preserved');
    assertTrue(res.testClassFile.obfuscatedCode.includes('testCalculateTotal()'), 'testCalculateTotal() name should be preserved when preserveTestMethods is true');

    // Cross-file shared identifiers stats
    assertTrue(res.sharedIdentifiers.classes.includes('OrderService'), 'OrderService should be recognized as a shared class');
    assertTrue(res.sharedIdentifiers.methods.includes('calculateTotal'), 'calculateTotal should be recognized as a shared method');
  });

  test('Java Class & Test Dual Obfuscator', 'Lossless de-obfuscation of modified code for both class and test', () => {
    const mainClass = `package com.acme.security.auth;
public class TokenValidator {
    public boolean verifyToken(String token) {
        return token != null;
    }
}`;

    const testClass = `package com.acme.security.auth;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
public class TokenValidatorTest {
    private TokenValidator validator = new TokenValidator();
    @Test
    void testVerify() {
        assertTrue(validator.verifyToken("ABC"));
    }
}`;

    // 1. Obfuscate both
    const obfResult = obfuscateDualJavaFiles({
      mainClassFile: { fileName: 'TokenValidator.java', code: mainClass },
      testClassFile: { fileName: 'TokenValidatorTest.java', code: testClass },
    });

    const obfMain = obfResult.mainClassFile.obfuscatedCode;
    const obfTest = obfResult.testClassFile.obfuscatedCode;

    // 2. User modifies the obfuscated class & test during development or debugging
    const modifiedObfMain = obfMain + '\n// User modified: added audit line\npublic void auditEvent() { System.out.println("Audited"); }';
    const modifiedObfTest = obfTest + '\n// User modified: added second test\n@Test\nvoid userExtraTest() { assertTrue(true); }';

    // 3. De-obfuscate both modified files using the shared mapping
    const restored = deobfuscateDualJavaFiles(modifiedObfMain, modifiedObfTest, obfResult.mapping);

    // Verifications:
    // Original names restored
    assertTrue(restored.restoredMainCode.includes('TokenValidator'), 'Restored main code must have TokenValidator restored');
    assertTrue(restored.restoredMainCode.includes('verifyToken'), 'Restored main code must have verifyToken restored');
    assertTrue(restored.restoredTestCode.includes('TokenValidator validator = new TokenValidator();'), 'Restored test code must have TokenValidator and validator restored');
    assertTrue(restored.restoredTestCode.includes('validator.verifyToken('), 'Restored test code must call verifyToken');

    // User modifications preserved intact
    assertTrue(restored.restoredMainCode.includes('auditEvent()'), 'User-added method in main class must be preserved');
    assertTrue(restored.restoredMainCode.includes('// User modified: added audit line'), 'User-added comment must be preserved');
    assertTrue(restored.restoredTestCode.includes('userExtraTest()'), 'User-added test in test class must be preserved');
  });

  test('Java Class & Test Dual Obfuscator', 'Preset scenarios obfuscate with zero collisions and accurate mapping', () => {
    for (const preset of JAVA_DUAL_PRESETS) {
      const res = obfuscateDualJavaFiles({
        mainClassFile: { fileName: preset.mainFile.fileName, code: preset.mainFile.code },
        testClassFile: { fileName: preset.testFile.fileName, code: preset.testFile.code },
      });

      assertTrue(res.stats.totalClassesRenamed >= 1, `Preset ${preset.id} must rename classes`);
      assertTrue(res.stats.crossFileTokensCount >= 1, `Preset ${preset.id} must have synchronized cross-file tokens`);
      assertTrue(!res.mainClassFile.obfuscatedCode.includes(preset.mainFile.fileName.replace('.java', '')), `Primary class in ${preset.id} should be obfuscated`);
    }
  });

  test('Java Class & Test Dual Obfuscator', 'Imports and normalizes various mapping formats (bundle, json, proguard, flat)', () => {
    // 1. Project Bundle JSON
    const bundleInput = JSON.stringify({
      version: '2.0',
      projectName: 'PaymentGateway',
      mapping: {
        classes: { PaymentProcessor: 'Cls_1', CardValidator: 'Cls_2' },
        methods: { processCharge: 'mth_1', validateCard: 'mth_2' },
        variables: { cardNumber: 'v_1', authCode: 'v_2' },
        packages: { gateway: 'pkg_1' },
      },
    });

    const parsedBundle = parseAndNormalizeMapping(bundleInput);
    assertTrue(parsedBundle.success, 'Bundle parsing should succeed');
    assertEqual(parsedBundle.format, 'project-bundle', 'Format should be project-bundle');
    assertEqual(parsedBundle.projectName, 'PaymentGateway', 'Project name should be extracted');
    assertEqual(parsedBundle.stats.classesCount, 2, 'Should find 2 classes');
    assertEqual(parsedBundle.stats.methodsCount, 2, 'Should find 2 methods');
    assertEqual(parsedBundle.mapping.reverseMapping['Cls_1'], 'PaymentProcessor', 'Reverse mapping must be populated');

    // 2. ProGuard format text
    const proguardText = `com.acme.service.OrderService -> com.acme.service.Cls_1:
    void placeOrder(java.lang.String) -> mth_1
    int orderId -> v_1`;

    const parsedProGuard = parseAndNormalizeMapping(proguardText);
    assertTrue(parsedProGuard.success, 'ProGuard text parsing should succeed');
    assertEqual(parsedProGuard.format, 'proguard', 'Format should be proguard');
    assertEqual(parsedProGuard.mapping.classes['OrderService'], 'Cls_1', 'Class should be extracted from ProGuard map');
    assertEqual(parsedProGuard.mapping.methods['placeOrder'], 'mth_1', 'Method should be extracted');
    assertEqual(parsedProGuard.mapping.variables['orderId'], 'v_1', 'Variable should be extracted');

    // 3. Flat Dictionary JSON
    const flatInput = JSON.stringify({
      AccountService: 'Cls_A',
      depositFunds: 'mth_A',
      accountBalance: 'v_A',
    });
    const parsedFlat = parseAndNormalizeMapping(flatInput);
    assertTrue(parsedFlat.success, 'Flat dictionary parsing should succeed');
    assertEqual(parsedFlat.mapping.classes['AccountService'], 'Cls_A', 'Class in flat map should be categorized');
  });

  test('Java Class & Test Dual Obfuscator', 'Reuses past imported mapping across separate runs without collisions', () => {
    // Session 1: Obfuscate OrderService
    const orderClass = `package com.acme;
public class OrderService {
    public void placeOrder(String item) { System.out.println(item); }
}`;
    const orderTest = `package com.acme;
import org.junit.jupiter.api.Test;
public class OrderServiceTest {
    @Test
    void testPlaceOrder() { new OrderService().placeOrder("Laptop"); }
}`;

    const res1 = obfuscateDualJavaFiles({
      mainClassFile: { fileName: 'OrderService.java', code: orderClass },
      testClassFile: { fileName: 'OrderServiceTest.java', code: orderTest },
    });

    const mappingFromSession1 = res1.mapping;
    const obfOrderClassName = mappingFromSession1.classes['OrderService'];
    assertTrue(Boolean(obfOrderClassName), 'OrderService must be mapped in Session 1');

    // Session 2: Obfuscate PaymentService (which calls OrderService) passing existing mapping
    const paymentClass = `package com.acme;
public class PaymentService {
    private OrderService orderService;
    public void processPayment() {
        orderService.placeOrder("Processed");
    }
}`;
    const paymentTest = `package com.acme;
import org.junit.jupiter.api.Test;
public class PaymentServiceTest {
    @Test
    void testPayment() { new PaymentService().processPayment(); }
}`;

    const res2 = obfuscateDualJavaFiles(
      {
        mainClassFile: { fileName: 'PaymentService.java', code: paymentClass },
        testClassFile: { fileName: 'PaymentServiceTest.java', code: paymentTest },
      },
      {},
      mappingFromSession1
    );

    // Verifications:
    // 1. OrderService in PaymentService must use the EXACT same obfuscated name from Session 1
    assertEqual(
      res2.mapping.classes['OrderService'],
      obfOrderClassName,
      'OrderService in Session 2 must reuse the exact obfuscated class name from Session 1'
    );
    assertTrue(
      res2.mainClassFile.obfuscatedCode.includes(obfOrderClassName),
      'PaymentService obfuscated code must reference the shared obfuscated class name'
    );

    // 2. Newly discovered PaymentService class has a distinct, non-colliding name
    const obfPaymentClassName = res2.mapping.classes['PaymentService'];
    assertTrue(Boolean(obfPaymentClassName), 'PaymentService must have a mapped name');
    assertTrue(
      obfPaymentClassName !== obfOrderClassName,
      'PaymentService name must not collide with OrderService name'
    );

    // 3. Merging creates cumulative project dictionary containing both
    const merged = mergeProjectMappings(mappingFromSession1, res2.mapping, 'preserve');
    assertEqual(merged.addedCount >= 1, true, 'Merged mapping should record added symbols');
    assertEqual(merged.merged.classes['OrderService'], obfOrderClassName, 'Preserves OrderService');
    assertEqual(merged.merged.classes['PaymentService'], obfPaymentClassName, 'Adds PaymentService');
  });

  test('Java Class & Test Dual Obfuscator', 'Exports project mappings in bundle, standard, and ProGuard formats', () => {
    const mapping = createEmptyMapping();
    mapping.classes['InvoiceService'] = 'Cls_1';
    mapping.methods['issueInvoice'] = 'mth_1';
    mapping.variables['invoiceAmount'] = 'v_1';

    // 1. Project bundle export
    const bundleText = exportMappingContent(mapping, 'project-bundle', { projectName: 'Billing' });
    assertTrue(bundleText.includes('"projectName": "Billing"'), 'Bundle must contain project name');
    assertTrue(bundleText.includes('"Cls_1"'), 'Bundle must contain mapped values');

    // 2. Standard JSON export
    const standardText = exportMappingContent(mapping, 'standard-json');
    assertTrue(standardText.includes('"InvoiceService": "Cls_1"'), 'Standard JSON must format direct class mapping');

    // 3. ProGuard format export
    const proguardText = exportMappingContent(mapping, 'proguard', { projectName: 'Billing' });
    assertTrue(proguardText.includes('InvoiceService -> Cls_1:'), 'ProGuard export must format class arrow mapping');
    assertTrue(proguardText.includes('void issueInvoice() -> mth_1'), 'ProGuard export must format method arrow mapping');
  });

  // --- Suite 10: PDF Signer & Annotator ---
  await testAsync('PDF Signer', 'Generates sample PDF & parses page metadata', async () => {
    const pdfBytes = await createSamplePdf();
    assertTrue(pdfBytes.length > 100, 'Sample PDF should generate valid bytes');

    const meta = await getPdfMetadata(pdfBytes);
    assertEqual(meta.pageCount, 3, 'Sample PDF should have 3 pages');
    assertTrue(meta.pagesDimensions[0].width > 0, 'Page width should be positive');
  });

  await testAsync('PDF Signer', 'Embeds signature image and metadata across all pages or selected pages', async () => {
    const pdfBytes = await createSamplePdf();

    // 1x1 transparent PNG data url
    const dummyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSU5ErkJggg==';

    // Test signing first page
    const signedFirstPage = await signPdfDocument({
      pdfBuffer: pdfBytes,
      signatureDataUrl: dummyPng,
      pagesToSign: 'first',
      position: 'bottom-right',
      printedName: 'Alex Morgan',
      signDate: '2026-08-11',
      signReason: 'Approved',
      showBorder: true,
    });
    assertTrue(signedFirstPage.length > pdfBytes.length, 'Signed first page PDF should have increased byte size');

    // Test signing all pages
    const signedAllPages = await signPdfDocument({
      pdfBuffer: pdfBytes,
      signatureDataUrl: dummyPng,
      pagesToSign: 'all',
      position: 'bottom-center',
      printedName: 'Alex Morgan',
      showBorder: true,
    });
    assertTrue(signedAllPages.length > signedFirstPage.length, 'All-pages signed PDF should embed signature across all 3 pages');

    // Test signing selected pages [1, 3]
    const signedSelected = await signPdfDocument({
      pdfBuffer: pdfBytes,
      signatureDataUrl: dummyPng,
      pagesToSign: 'selected',
      selectedPages: [1, 3],
      position: 'center',
    });
    assertTrue(signedSelected.length > pdfBytes.length, 'Selected pages signed PDF should generate valid bytes');
  });

  test('PDF Signer', 'Parses page ranges and resolves target page numbers correctly', () => {
    const parsedRange = parsePageRange('1-2, 4, 6-7', 10);
    assertEqual(parsedRange.join(','), '1,2,4,6,7', 'Should correctly parse discrete and hyphenated ranges');

    const parsedAll = parsePageRange('all', 5);
    assertEqual(parsedAll.length, 5, 'Should resolve all 5 pages');

    const resolvedAll = resolveTargetPageNumbers('all', 4);
    assertEqual(resolvedAll.join(','), '1,2,3,4', 'resolveTargetPageNumbers all should return all page numbers');

    const resolvedLast = resolveTargetPageNumbers('last', 4);
    assertEqual(resolvedLast.join(','), '4', 'resolveTargetPageNumbers last should return page 4');

    const resolvedCustom = resolveTargetPageNumbers('custom', 4, 3);
    assertEqual(resolvedCustom.join(','), '3', 'resolveTargetPageNumbers custom should return specified page');

    const resolvedSelected = resolveTargetPageNumbers('selected', 5, undefined, [2, 4, 5]);
    assertEqual(resolvedSelected.join(','), '2,4,5', 'resolveTargetPageNumbers selected should return sorted unique list');
  });

  test('PDF Signer', 'Calculates accurate signature metrics & 1:1 UI-PDF coordinate mapping', () => {
    const metrics = computeSignatureBoxMetrics({
      sigWidth: 160,
      sigHeight: 65,
      printedName: 'Alex Morgan',
      signDate: '2026-08-11',
      showBorder: true,
    });

    assertTrue(metrics.totalBoxWidth >= 180, 'Box width should accommodate signature and padding');
    assertTrue(metrics.textLines.length === 2, 'Should compute 2 annotation text lines');

    // Bottom-right position calculation on standard 600x800 page
    const posBR = calculateBoxPosition(600, 800, metrics.totalBoxWidth, metrics.totalBoxHeight, 'bottom-right', 0, 0, 24);
    assertTrue(posBR.pdfX === 600 - metrics.totalBoxWidth - 24, 'PDF X should align with right margin');
    assertTrue(posBR.pdfY === 24, 'PDF Y should align with bottom margin');
    assertTrue(posBR.uiLeftPercent > 50, 'UI Left percentage should be on right half');
    assertTrue(posBR.uiTopPercent > 50, 'UI Top percentage should be on lower half in top-down coordinates');

    // Center position
    const posCenter = calculateBoxPosition(600, 800, metrics.totalBoxWidth, metrics.totalBoxHeight, 'center');
    assertTrue(posCenter.pdfX === (600 - metrics.totalBoxWidth) / 2, 'Center X should be midpoint');
    assertTrue(posCenter.pdfY === (800 - metrics.totalBoxHeight) / 2, 'Center Y should be midpoint');
  });

  test('PDF Signer', 'Supports custom Date of Signature with default current date', () => {
    const todayIso = getDefaultSignatureDate();
    assertTrue(/^\d{4}-\d{2}-\d{2}$/.test(todayIso), 'Default signature date should match YYYY-MM-DD pattern');

    // Test date formatters
    const testDate = '2026-08-22';
    assertEqual(formatSignatureDate(testDate, 'iso'), '2026-08-22', 'ISO format should match');
    assertEqual(formatSignatureDate(testDate, 'long'), 'August 22, 2026', 'Long format should match Month DD, YYYY');
    assertEqual(formatSignatureDate(testDate, 'short-us'), '08/22/2026', 'US format should match MM/DD/YYYY');
    assertEqual(formatSignatureDate(testDate, 'short-eu'), '22/08/2026', 'EU format should match DD/MM/YYYY');

    // Metrics with custom date of signature
    const metricsWithCustomDate = computeSignatureBoxMetrics({
      sigWidth: 160,
      sigHeight: 65,
      signDate: 'August 22, 2026',
      showBorder: true,
    });
    assertTrue(
      metricsWithCustomDate.textLines.some((l) => l.includes('Date: August 22, 2026')),
      'Metrics should include custom Date of Signature text'
    );
  });

  // --- Suite 11: PDF to Docx & Docs Converter ---
  await testAsync('PDF Converter', 'Extracts text content and pages from PDF', async () => {
    const pdfBytes = await createSamplePdf();
    const content = await extractPdfContent(pdfBytes);
    assertEqual(content.pageCount, 3, 'Should extract 3 pages');
    assertTrue(content.fullText.length > 50, 'Full text should contain extracted lines');
  });

  await testAsync('PDF Converter', 'Converts PDF to Word (.docx) format blob', async () => {
    const pdfBytes = await createSamplePdf();
    const res = await convertPdfDocument({
      pdfBuffer: pdfBytes,
      targetFormat: 'docx',
      title: 'Agreement_Test',
      author: 'Test Suite',
      fontFamily: 'Calibri',
    });

    assertTrue(res.blob.size > 500, 'Docx blob should be generated with valid binary length');
    assertTrue(res.filename.endsWith('.docx'), 'Filename should have .docx extension');
  });

  await testAsync('PDF Converter', 'Converts PDF to HTML, TXT, ODT, RTF & EPUB formats', async () => {
    const pdfBytes = await createSamplePdf();

    const txtRes = await convertPdfDocument({ pdfBuffer: pdfBytes, targetFormat: 'txt', title: 'Test' });
    assertTrue(txtRes.filename.endsWith('.txt'), 'Should output .txt filename');

    const htmlRes = await convertPdfDocument({ pdfBuffer: pdfBytes, targetFormat: 'html', title: 'Test' });
    assertTrue(htmlRes.filename.endsWith('.html'), 'Should output .html filename');

    const odtRes = await convertPdfDocument({ pdfBuffer: pdfBytes, targetFormat: 'odt', title: 'Test' });
    assertTrue(odtRes.blob.size > 200, 'ODT zip blob should have valid size');

    const epubRes = await convertPdfDocument({ pdfBuffer: pdfBytes, targetFormat: 'epub', title: 'Test' });
    assertTrue(epubRes.blob.size > 200, 'EPUB zip blob should have valid size');
  });

  // --- Suite 12: Java Code Formatter ---
  test('Java Formatter', 'Formats raw Java code with Google Java Style', () => {
    const formatted = formatJavaCode(sampleUnformattedJavaCode, {
      indentType: 'spaces',
      indentSize: 2,
      braceStyle: 'same-line',
      sortImports: true,
      groupImports: true,
      removeDuplicateImports: true,
      spaceBeforeControlParentheses: true,
      spaceAroundOperators: true,
      spaceInsideParentheses: false,
      spaceAfterComma: true,
      breakMultipleStatements: true,
      breakInlineBraces: true,
      breakAnnotations: true,
      maxConsecutiveBlankLines: 1,
      blankLinesBetweenMethods: 1,
      normalizeModifiers: true,
      alignSingleLineComments: false,
      trimTrailingWhitespace: true,
      ensureFinalNewline: true,
    });

    assertTrue(formatted.includes('  public UserService'), 'Indentation should use 2 spaces');
    assertTrue(formatted.includes('public static final User findUserById'), 'Modifiers should be normalized');
    assertTrue(!formatted.includes('import java.util.List; // duplicate'), 'Duplicate imports should be removed');
  });

  test('Java Formatter', 'Splits compressed single-line Java code into readable statements with proper indents', () => {
    const compressed = 'public class Test { public void run() { int a=1; int b=2; if(a<b){ System.out.println("Hello"); } } }';
    const formatted = formatJavaCode(compressed, {
      indentType: 'spaces',
      indentSize: 4,
      braceStyle: 'same-line',
      sortImports: true,
      groupImports: true,
      removeDuplicateImports: true,
      spaceBeforeControlParentheses: true,
      spaceAroundOperators: true,
      spaceInsideParentheses: false,
      spaceAfterComma: true,
      breakMultipleStatements: true,
      breakInlineBraces: true,
      breakAnnotations: true,
      maxConsecutiveBlankLines: 1,
      blankLinesBetweenMethods: 1,
      normalizeModifiers: true,
      alignSingleLineComments: false,
      trimTrailingWhitespace: true,
      ensureFinalNewline: true,
    });

    assertTrue(formatted.includes('    int a = 1;'), 'Should break statements and indent correctly (4 spaces)');
    assertTrue(formatted.includes('    int b = 2;'), 'Should place second statement on a new line with 4 space indent');
    assertTrue(formatted.includes('        System.out.println("Hello");'), 'Should indent nested statements inside if block (8 spaces)');
  });

  test('Java Formatter', 'Formats Java code with Allman (next-line) brace style', () => {
    const formatted = formatJavaCode(sampleUnformattedJavaCode, {
      indentType: 'spaces',
      indentSize: 4,
      braceStyle: 'next-line',
      sortImports: true,
      groupImports: false,
      removeDuplicateImports: true,
      spaceBeforeControlParentheses: true,
      spaceAroundOperators: true,
      spaceInsideParentheses: false,
      spaceAfterComma: true,
      breakMultipleStatements: true,
      breakInlineBraces: true,
      breakAnnotations: true,
      maxConsecutiveBlankLines: 1,
      blankLinesBetweenMethods: 1,
      normalizeModifiers: true,
      alignSingleLineComments: false,
      trimTrailingWhitespace: true,
      ensureFinalNewline: true,
    });

    assertTrue(formatted.includes('{\n'), 'Braces should be placed on separate lines in Allman style');
  });

  // --- Suite: Multi-Language Code Formatter (Python, YAML, Java, and Major Formats) ---
  test('Code Formatter', 'Formats raw Python code with PEP 8 indentation and operator spacing', () => {
    const rawPy = `def calculate_metrics(values,multiplier=2):
total=0
for v in values:
if v>0:
total+=v*multiplier
else:
total-=v
return {"total":total,"count":len(values)}`;

    const formatted = formatPython(rawPy, {
      indentType: 'spaces',
      indentSize: 4,
      ensureFinalNewline: true,
    });

    assertTrue(formatted.includes('    total = 0'), 'Should indent body 4 spaces and space assignment');
    assertTrue(formatted.includes('    for v in values:'), 'For loop should be indented 4 spaces');
    assertTrue(formatted.includes('        if v > 0:'), 'If block should be indented 8 spaces with spaced operator');
    assertTrue(formatted.includes('            total += v * multiplier'), 'Nested statement should be indented 12 spaces');
    assertTrue(formatted.includes('        else:'), 'Else block should dedent to 8 spaces');
  });

  test('Code Formatter', 'Parses, formats, and validates YAML structures and reports syntax errors', () => {
    const validYaml = `services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    environment:
      NODE_ENV: production`;

    const res = formatYaml(validYaml, {
      indentType: 'spaces',
      indentSize: 2,
    });

    assertTrue(res.isValid, 'Valid YAML should pass parsing');
    assertTrue(res.formattedCode.includes('services:'), 'Formatted YAML should contain root key');
    assertTrue(res.formattedCode.includes('image: nginx:alpine'), 'Formatted YAML should contain nested key');

    // Test invalid YAML
    const invalidYaml = `key: "unclosed string
  nested:
    - item`;
    const invalidRes = formatYaml(invalidYaml);
    assertTrue(!invalidRes.isValid, 'Invalid YAML must be detected');
    assertTrue(Boolean(invalidRes.error), 'Invalid YAML must produce an informative error message');
  });

  test('Code Formatter', 'Formats Java code through unified formatCode engine', () => {
    const rawJava = `public class Calculator {
public int add(int a,int b){
return a+b;
}
}`;
    const res = formatCode(rawJava, 'java', {
      indentType: 'spaces',
      indentSize: 4,
    });

    assertTrue(res.isValid, 'Java format should be valid');
    assertTrue(res.formattedCode.includes('    public int add(int a, int b) {'), 'Method should be indented with space after comma');
    assertTrue(res.formattedCode.includes('        return a + b;'), 'Return statement should be indented with operator spacing');
  });

  test('Code Formatter', 'Formats and minifies JSON with key sorting', () => {
    const rawJson = '{"zebra": 1, "apple": 2, "mango": {"c": 3, "a": 4}}';

    // Pretty format with key sorting
    const sortedRes = formatJson(rawJson, {
      indentType: 'spaces',
      indentSize: 2,
      sortKeys: true,
      minify: false,
    });

    assertTrue(sortedRes.isValid, 'JSON format should be valid');
    const appleIdx = sortedRes.formattedCode.indexOf('"apple"');
    const zebraIdx = sortedRes.formattedCode.indexOf('"zebra"');
    assertTrue(appleIdx < zebraIdx, 'Keys should be alphabetized: apple before zebra');

    // Minify format
    const minRes = formatJson(rawJson, {
      indentType: 'spaces',
      indentSize: 2,
      minify: true,
    });
    assertTrue(!minRes.formattedCode.includes('\n'), 'Minified JSON should not contain newlines');
  });

  test('Code Formatter', 'Auto-detects language from code signatures', () => {
    assertEqual(detectLanguage('def process_data(items):\n    return [x * 2 for x in items]'), 'python', 'Should detect Python');
    assertEqual(detectLanguage('package com.example;\npublic class Main {}'), 'java', 'Should detect Java');
    assertEqual(detectLanguage('{"id": 123, "active": true}'), 'json', 'Should detect JSON');
    assertEqual(detectLanguage('SELECT id, name FROM users WHERE active = 1;'), 'sql', 'Should detect SQL');
    assertEqual(detectLanguage('<!DOCTYPE html>\n<html><body><h1>Test</h1></body></html>'), 'html', 'Should detect HTML');
  });

  // --- Suite: Python Code Obfuscator & URL Protection ---
  test('Python Obfuscator', 'Obfuscates Python classes, functions, variables, and masks embedded URLs', () => {
    const rawPy = `class CloudTelemetryService:
    ENDPOINT_URL = "https://api.cloudservice.internal:8443/v2/metrics"
    BACKUP_URL = "https://backup.cloudservice.internal/ingest"

    def __init__(self, service_key: str):
        self.service_key = service_key

    def send_metrics(self, metric_name: str, metric_value: float) -> bool:
        target = self.ENDPOINT_URL
        print(f"Sending {metric_name} to {target}")
        return True`;

    const res = obfuscatePythonCode(rawPy, {
      namingStyle: 'hexadecimal',
      obfuscateUrls: true,
      urlObfuscationMode: 'masked_url',
    });

    // Verify URLs are obfuscated
    assertTrue(!res.obfuscatedCode.includes('https://api.cloudservice.internal:8443/v2/metrics'), 'Original primary URL must be obfuscated');
    assertTrue(!res.obfuscatedCode.includes('https://backup.cloudservice.internal/ingest'), 'Original backup URL must be obfuscated');
    assertEqual(res.stats.urlsObfuscated, 2, 'Must record 2 obfuscated URLs in stats');
    assertEqual(Object.keys(res.mapping.urls).length, 2, 'Mapping must contain exactly 2 URLs');

    // Verify classes & functions are obfuscated
    assertTrue(!res.obfuscatedCode.includes('class CloudTelemetryService:'), 'Class name must be mangled');
    assertTrue(!res.obfuscatedCode.includes('def send_metrics('), 'Function name must be mangled');
    assertTrue(res.obfuscatedCode.includes('def __init__('), 'Dunder init method must be preserved');

    // Verify reverse mapping has the original URL
    const obfUrl = res.mapping.urls['https://api.cloudservice.internal:8443/v2/metrics'];
    assertTrue(Boolean(obfUrl), 'Obfuscated URL must be present in mapping.urls');
    assertEqual(res.mapping.reverseMapping[obfUrl], 'https://api.cloudservice.internal:8443/v2/metrics', 'Reverse mapping must point back to original URL');
  });

  test('Python Obfuscator', 'Losslessly de-obfuscates modified Python code using mapping, restoring all URLs and symbols', () => {
    const original = `import requests

class PaymentGateway:
    PRIMARY_API = "https://api.paymenthub.com/v1/charge"
    FALLBACK_API = "https://fallback.paymenthub.com/v1/charge"

    def charge_account(self, account_id: str, amount_cents: int) -> dict:
        url = self.PRIMARY_API
        payload = {"account": account_id, "amount": amount_cents}
        return {"status": "ok", "url": url}`;

    const obfRes = obfuscatePythonCode(original, {
      namingStyle: 'hexadecimal',
      obfuscateUrls: true,
      urlObfuscationMode: 'masked_url',
    });

    // Simulate modifying the obfuscated code (e.g. adding a comment or changing an internal value)
    const modifiedObfuscatedCode = `# Modified by engineer\n` + obfRes.obfuscatedCode;

    // Run de-obfuscation with mapping
    const deobfRes = deobfuscatePythonCode(modifiedObfuscatedCode, obfRes.mapping);

    // Verify all original URLs are restored
    assertTrue(deobfRes.deobfuscatedCode.includes('https://api.paymenthub.com/v1/charge'), 'Primary URL must be fully restored');
    assertTrue(deobfRes.deobfuscatedCode.includes('https://fallback.paymenthub.com/v1/charge'), 'Fallback URL must be fully restored');
    assertEqual(deobfRes.stats.urlsRestored, 2, 'Must report 2 restored URLs');

    // Verify class and function names are restored
    assertTrue(deobfRes.deobfuscatedCode.includes('class PaymentGateway:'), 'Class name must be restored');
    assertTrue(deobfRes.deobfuscatedCode.includes('def charge_account('), 'Method name must be restored');
  });

  test('Python Obfuscator', 'Supports tokenized URL obfuscation mode and de-obfuscates cleanly', () => {
    const raw = `WEBHOOK = "https://hooks.slack.com/services/T1/B2/token123"
def notify():
    pass`;

    const obfRes = obfuscatePythonCode(raw, {
      obfuscateUrls: true,
      urlObfuscationMode: 'token',
    });

    assertTrue(obfRes.obfuscatedCode.includes('__URL_OBF_1__'), 'Should use tokenized URL representation');
    assertTrue(!obfRes.obfuscatedCode.includes('https://hooks.slack.com'), 'Original URL must be replaced');

    const deobf = deobfuscatePythonCode(obfRes.obfuscatedCode, obfRes.mapping);
    assertTrue(deobf.deobfuscatedCode.includes('https://hooks.slack.com/services/T1/B2/token123'), 'Deobfuscation must restore URL from token');
  });

  test('Python Obfuscator', 'All presets obfuscate with URL mapping and deobfuscate successfully', () => {
    for (const preset of PYTHON_PRESETS) {
      const res = obfuscatePythonCode(preset.code, {
        obfuscateUrls: true,
        urlObfuscationMode: 'masked_url',
      });

      assertTrue(res.stats.urlsObfuscated >= preset.urlCount, `Preset ${preset.id} must obfuscate at least ${preset.urlCount} URLs`);
      assertTrue(Object.keys(res.mapping.urls).length >= preset.urlCount, `Preset ${preset.id} mapping must contain URLs`);

      const deobf = deobfuscatePythonCode(res.obfuscatedCode, res.mapping);
      for (const origUrl of Object.keys(res.mapping.urls)) {
        assertTrue(deobf.deobfuscatedCode.includes(origUrl), `Deobfuscated code must restore ${origUrl} in preset ${preset.id}`);
      }
    }
  });

  // --- Suite: Chess Move & Map Converter (HTML, PGN, FEN, UCI, JSON) ---
  test('Chess Converter', 'Converts user attached Chess.com HTML move map into standard PGN and accurate FEN', () => {
    const format = detectChessFormat(USER_ATTACHED_CHESS_HTML);
    assertEqual(format, 'chess_com_html', 'Should detect format as chess_com_html');

    const result = convertChessGame(USER_ATTACHED_CHESS_HTML);
    assertTrue(result.success, 'Conversion must succeed on user attached HTML');
    assertEqual(result.stats.totalTurns, 59, 'Must parse exactly 59 full turns');
    assertEqual(result.stats.totalPlies, 118, 'Must parse exactly 118 plies');
    assertEqual(result.finalFen, '8/6k1/5RP1/4R2P/5P2/8/P1P5/6K1 w - - 1 60', 'Final FEN must match exact board state');

    // Verify first and intermediate moves
    assertTrue(result.pgnMinimal.startsWith('1. d4 Nf6 2. Nf3 e6'), 'Move list must start with 1. d4 Nf6 2. Nf3 e6');
    assertTrue(result.pgnMinimal.includes('8. O-O Nxc3'), 'Must parse castling O-O and captures Nxc3');
    assertTrue(result.pgnMinimal.endsWith('59. g6 Kg7'), 'Must end with move 59. g6 Kg7');
  });

  test('Chess Converter', 'Converts PGN text with headers and identifies checkmate (Opera Game)', () => {
    const opera = CHESS_PRESETS.find((p) => p.id === 'opera-game')!;
    const res = convertChessGame(opera.data, 'auto');

    assertTrue(res.success, 'PGN conversion must succeed');
    assertEqual(res.headers.white, 'Paul Morphy', 'White player header must be parsed');
    assertEqual(res.stats.totalTurns, 17, 'Must parse 17 turns');
    assertTrue(res.stats.hasCheckmate, 'Must detect checkmate in Opera game');
    assertEqual(res.stats.result, '1-0', 'Result must be 1-0');
    assertTrue(res.pgnMinimal.includes('17. Rd8#'), 'Must conclude with 17. Rd8# checkmate');
  });

  test('Chess Converter', 'Converts UCI move list into PGN and moves history', () => {
    const uci = 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6';
    const res = convertChessGame(uci, 'uci_lan');

    assertTrue(res.success, 'UCI conversion must succeed');
    assertEqual(res.stats.totalTurns, 5, 'Must parse 5 turns');
    assertTrue(res.pgnMinimal.includes('1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6'), 'UCI must convert to proper SAN');
  });

  test('Chess Converter', 'Converts JSON move array into PGN, FEN, and CSV export', () => {
    const jsonMoves = JSON.stringify([
      { move: 1, white: 'd4', black: 'd5' },
      { move: 2, white: 'c4', black: 'c6' },
      { move: 3, white: 'Nf3', black: 'Nf6' },
    ]);

    const res = convertChessGame(jsonMoves, 'json_moves');
    assertTrue(res.success, 'JSON move conversion must succeed');
    assertEqual(res.stats.totalTurns, 3, 'Must convert 3 turns');

    const csv = generateChessCsv(res.turns);
    assertTrue(csv.includes('1,d4,d2d4'), 'CSV must include move 1 SAN and UCI');
    assertTrue(csv.includes('3,Nf3,g1f3'), 'CSV must include move 3 SAN and UCI');

    const col = generateColumnarText(res.turns);
    assertTrue(col.includes('1.    d4'), 'Columnar text must align move 1');
  });

  test('Chess Converter', 'Generates valid Lichess and Chess.com analysis URLs', () => {
    const links = generateAnalysisLinks('1. e4 e5 2. Nf3', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2');
    assertTrue(links.lichessPgn.startsWith('https://lichess.org/analysis/pgn/'), 'Must build lichess PGN URL');
    assertTrue(links.chessComAnalysis.startsWith('https://www.chess.com/analysis?fen='), 'Must build chess.com analysis URL');
  });

  // --- Suite: User Settings, Favorites & Data Backup Manager ---
  test('User Backup Manager', 'Creates valid structured user settings & favorites backup JSON', () => {
    const backup = createUserBackup({
      favorites: ['json-beautifier', 'python-obfuscator', 'chess-converter'],
      recentToolIds: ['chess-converter', 'code-formatter'],
      darkMode: true,
      activeCategory: 'converters',
    });

    assertEqual(backup.version, '1.0', 'Backup version should be 1.0');
    assertTrue(Boolean(backup.exportedAt), 'Export timestamp must be present');
    assertEqual(backup.settings.theme, 'dark', 'Theme must be dark');
    assertEqual(backup.settings.activeCategory, 'converters', 'Active category should be converters');
    assertEqual(backup.favorites.length, 3, 'Should contain 3 favorites');
    assertEqual(backup.recentToolHistory.length, 2, 'Should contain 2 recent tools');
  });

  test('User Backup Manager', 'Validates authentic backup JSON payload and identifies unknown tool IDs', () => {
    const validJson = JSON.stringify({
      version: '1.0',
      app: 'DevFlow Pro',
      exportedAt: '2026-09-29T12:00:00.000Z',
      settings: { theme: 'light', activeCategory: 'security' },
      favorites: ['json-beautifier', 'python-obfuscator', 'fake-nonexistent-tool'],
      recentToolHistory: ['json-beautifier'],
    });

    const res = validateUserBackupJson(validJson);
    assertTrue(res.isValid, 'Should validate successfully');
    assertEqual(res.summary?.favoritesCount, 2, 'Should only count 2 valid favorites');
    assertTrue(res.summary?.unknownFavorites.includes('fake-nonexistent-tool') ?? false, 'Should flag nonexistent tool');
    assertTrue(Boolean(res.warning), 'Should produce warning for unrecognized tool');
  });

  test('User Backup Manager', 'Gracefully catches malformed or empty JSON input', () => {
    const emptyRes = validateUserBackupJson('   ');
    assertTrue(!emptyRes.isValid, 'Empty input must be rejected');

    const malformedRes = validateUserBackupJson('{ "favorites": ["broken", ');
    assertTrue(!malformedRes.isValid, 'Malformed JSON must be rejected');
  });

  test('User Backup Manager', 'Applies backup in replace and merge modes', () => {
    const backup = createUserBackup({
      favorites: ['python-obfuscator', 'chess-converter'],
      recentToolIds: ['chess-converter'],
      darkMode: false,
      activeCategory: 'security',
    });

    // Replace Mode
    const replaceRes = applyUserBackup({
      backup,
      mode: 'replace',
      currentFavorites: ['json-beautifier'],
      currentRecents: ['base64-encoder'],
    });
    assertEqual(replaceRes.newFavorites.length, 2, 'Replace mode must replace with exact backup favorites');
    assertEqual(replaceRes.newTheme, 'light', 'Theme should be updated to light');

    // Merge Mode
    const mergeRes = applyUserBackup({
      backup,
      mode: 'merge',
      currentFavorites: ['json-beautifier'],
      currentRecents: ['base64-encoder'],
    });
    assertEqual(mergeRes.newFavorites.length, 3, 'Merge mode must combine 1 existing and 2 backup favorites');
    assertTrue(mergeRes.newFavorites.includes('json-beautifier'), 'Should preserve existing favorite in merge mode');
    assertTrue(mergeRes.newFavorites.includes('chess-converter'), 'Should add backup favorite in merge mode');
  });

  // --- Suite 9: cURL Converter & Multi-Target Generator ---
  test('cURL Converter', 'Tokenizes multiline and quoted cURL strings', () => {
    const raw = `curl -X POST "https://api.example.com/v1/users" \\\n  -H "Authorization: Bearer my_token" \\\n  -d '{"name": "DevHub"}'`;
    const tokens = tokenizeCurlCommand(raw);
    assertTrue(tokens.length >= 6, 'Should tokenize multiline curl command');
    assertTrue(tokens.includes('-X'), 'Should include method flag');
    assertTrue(tokens.includes('POST'), 'Should include POST token');
  });

  test('cURL Converter', 'Parses GET request with query params & headers', () => {
    const raw = `curl -X GET "https://api.github.com/users/octocat/repos?sort=updated&per_page=10" -H "Accept: application/json" -H "Authorization: Bearer token123"`;
    const parsed = parseCurlCommand(raw);
    assertEqual(parsed.method, 'GET', 'Method should be GET');
    assertEqual(parsed.queryParams['sort'], 'updated', 'Should parse sort query param');
    assertEqual(parsed.queryParams['per_page'], '10', 'Should parse per_page query param');
    assertEqual(parsed.headers['Accept'], 'application/json', 'Should parse Accept header');
    assertEqual(parsed.auth?.type, 'bearer', 'Should detect bearer token');
    assertEqual(parsed.auth?.token, 'token123', 'Should extract token value');
  });

  test('cURL Converter', 'Parses POST with JSON payload & Basic Auth', () => {
    const raw = `curl -X POST "https://api.example.com/v1/items" -u "admin:secret123" -H "Content-Type: application/json" -d '{"title": "Item 1", "price": 99.5}'`;
    const parsed = parseCurlCommand(raw);
    assertEqual(parsed.method, 'POST', 'Method should be POST');
    assertEqual(parsed.auth?.type, 'basic', 'Auth should be basic');
    assertEqual(parsed.auth?.username, 'admin', 'Username should be admin');
    assertEqual(parsed.auth?.password, 'secret123', 'Password should be secret123');
    assertEqual(parsed.body?.type, 'json', 'Body type should be json');
    assertEqual(parsed.body?.jsonData?.title, 'Item 1', 'JSON field title should match');
  });

  test('cURL Converter', 'Parses PUT, PATCH, DELETE, and Multipart operations', () => {
    const patchRaw = `curl -X PATCH "https://api.example.com/v1/orders/123" -d '{"status": "shipped"}' -H "Content-Type: application/json"`;
    const patchParsed = parseCurlCommand(patchRaw);
    assertEqual(patchParsed.method, 'PATCH', 'Method should be PATCH');

    const delRaw = `curl -X DELETE "https://api.example.com/v1/items/456"`;
    const delParsed = parseCurlCommand(delRaw);
    assertEqual(delParsed.method, 'DELETE', 'Method should be DELETE');

    const multiRaw = `curl -X POST "https://api.example.com/upload" -F "description=My file" -F "file=@./doc.pdf;type=application/pdf"`;
    const multiParsed = parseCurlCommand(multiRaw);
    assertEqual(multiParsed.body?.type, 'multipart', 'Body type should be multipart');
    assertEqual(multiParsed.body?.formData?.description, 'My file', 'Form field should match');
  });

  test('cURL Converter', 'Generates valid Python requests & httpx scripts with Python booleans True/False', () => {
    const parsed = parseCurlCommand(`curl -X POST "https://api.example.com/data" -H "Content-Type: application/json" -d '{"active": true, "disabled": false, "empty": null, "nested": {"flag": true}}'`);
    const pyRequests = generatePythonCode(parsed, 'requests');
    assertTrue(pyRequests.includes('import requests'), 'Should import requests');
    assertTrue(pyRequests.includes('requests.post'), 'Should call requests.post');
    assertTrue(pyRequests.includes('"active": True'), 'Python requests payload should use True instead of true');
    assertTrue(pyRequests.includes('"disabled": False'), 'Python requests payload should use False instead of false');
    assertTrue(pyRequests.includes('"empty": None'), 'Python requests payload should use None instead of null');
    assertTrue(!pyRequests.includes(': true'), 'Python code must not contain : true');
    assertTrue(!pyRequests.includes(': false'), 'Python code must not contain : false');
    assertTrue(!pyRequests.includes(': null'), 'Python code must not contain : null');

    const pyHttpx = generatePythonCode(parsed, 'httpx_async');
    assertTrue(pyHttpx.includes('import httpx'), 'Should import httpx');
    assertTrue(pyHttpx.includes('async with httpx.AsyncClient('), 'Should use async client context');
    assertTrue(pyHttpx.includes('"active": True'), 'Python httpx payload should use True');
    assertTrue(pyHttpx.includes('"disabled": False'), 'Python httpx payload should use False');

    const pyAiohttp = generatePythonCode(parsed, 'aiohttp');
    assertTrue(pyAiohttp.includes('"active": True'), 'Python aiohttp payload should use True');
    assertTrue(pyAiohttp.includes('"disabled": False'), 'Python aiohttp payload should use False');

    const pyUrllib = generatePythonCode(parsed, 'urllib');
    assertTrue(pyUrllib.includes('"active": True'), 'Python urllib payload should use True');
    assertTrue(pyUrllib.includes('"disabled": False'), 'Python urllib payload should use False');
  });

  test('cURL Converter', 'Generates valid TypeScript fetch & axios scripts', () => {
    const parsed = parseCurlCommand(`curl -X PUT "https://api.example.com/resource/789?active=true" -H "Content-Type: application/json" -d '{"active": true}'`);
    const tsFetch = generateTypeScriptCode(parsed, 'fetch');
    assertTrue(tsFetch.includes('await fetch('), 'Should call fetch');
    assertTrue(tsFetch.includes("method: 'PUT'"), 'Should set PUT method');
    assertTrue(tsFetch.includes('export interface RequestPayload'), 'Should generate TypeScript interface');

    const tsAxios = generateTypeScriptCode(parsed, 'axios');
    assertTrue(tsAxios.includes("import axios, { AxiosRequestConfig"), 'Should import axios');
    assertTrue(tsAxios.includes("method: 'put'"), 'Should set method');
  });

  // --- Suite 10: cURL Single-Line Formatter & Flattener ---
  test('cURL Formatter', 'Removes trailing backslashes & newlines into a single line', () => {
    const raw = `curl -X POST "https://api.example.com/v1/users" \\
  -H "Authorization: Bearer token123" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice"}'`;
    const { singleLine, stats } = flattenCurlCommand(raw);
    assertEqual(singleLine.split('\n').length, 1, 'Should output strictly 1 line');
    assertTrue(!singleLine.includes('\\'), 'Should not contain trailing backslashes');
    assertTrue(singleLine.includes('-H "Authorization: Bearer token123"'), 'Should preserve headers');
    assertEqual(stats.backslashesRemoved, 3, 'Should count 3 removed backslashes');
  });

  test('cURL Formatter', 'Handles trailing spaces after backslash and CRLF newlines', () => {
    const raw = `curl "https://api.example.com" \\   \r\n  -H "Accept: application/json" \\ \t\r\n  -d "test"`;
    const { singleLine } = flattenCurlCommand(raw);
    assertEqual(singleLine.split('\n').length, 1, 'Should eliminate CRLF with trailing spaces');
    assertTrue(!singleLine.includes('\\'), 'Should remove backslashes with trailing whitespace');
    assertTrue(singleLine.includes('-H "Accept: application/json"'), 'Should keep flags properly formatted');
  });

  test('cURL Formatter', 'Removes Windows CMD carets (^) and PowerShell backticks (`)', () => {
    const cmdRaw = `curl.exe -X POST "https://api.example.com" ^\n  -H "Content-Type: application/json" ^\n  -d "{}"`;
    const { singleLine: cmdOut, stats: cmdStats } = flattenCurlCommand(cmdRaw);
    assertEqual(cmdOut.split('\n').length, 1, 'CMD output should be 1 line');
    assertTrue(!cmdOut.includes('^'), 'Should remove CMD carets');
    assertEqual(cmdStats.caretsRemoved, 2, 'Should count 2 removed carets');

    const psRaw = `curl.exe -X POST 'https://api.example.com' \`\n  -H 'Content-Type: application/json' \`\n  -d '{}'`;
    const { singleLine: psOut, stats: psStats } = flattenCurlCommand(psRaw);
    assertEqual(psOut.split('\n').length, 1, 'PS output should be 1 line');
    assertTrue(!psOut.includes('`'), 'Should remove PS backticks');
    assertEqual(psStats.backticksRemoved, 2, 'Should count 2 removed backticks');
  });

  test('cURL Formatter', 'Strips shell comments and compacts multiline JSON payloads', () => {
    const raw = `# First line comment
# Setup request
curl -X POST "https://api.example.com/data" \\
  -H "Content-Type: application/json" \\
  # inline comment line
  -d '{
    "user": "alex",
    "role": "admin",
    "active": true
  }'`;
    const { singleLine, stats } = flattenCurlCommand(raw, { minifyJsonPayloads: true, stripComments: true });
    assertEqual(singleLine.split('\n').length, 1, 'Should output single line with no comments');
    assertTrue(!singleLine.includes('#'), 'Should strip all comments');
    assertTrue(singleLine.includes('{"user":"alex","role":"admin","active":true}'), 'Should minify JSON body');
    assertTrue(stats.commentsStripped >= 3, 'Should track stripped comments count');
  });

  test('cURL Formatter', 'Normalizes smart quotes and em-dashes from documentation', () => {
    const raw = `curl —X POST “https://api.example.com” —H ‘Accept: application/json’`;
    const { singleLine } = flattenCurlCommand(raw, { normalizeSmartQuotes: true, normalizeSmartDashes: true });
    assertTrue(singleLine.includes('-X POST "https://api.example.com"'), 'Should replace em-dash and curly double quotes');
    assertTrue(singleLine.includes("-H 'Accept: application/json'"), 'Should replace em-dash and curly single quotes');
  });

  test('cURL Formatter', 'Converts to Windows CMD escaped quotes and beautifies to multiline', () => {
    const raw = `curl -X POST "https://api.example.com" -H "Content-Type: application/json" -d '{"key": "val"}'`;
    const { singleLine: cmdLine } = flattenCurlCommand(raw, { targetShell: 'cmd' });
    assertTrue(cmdLine.includes('curl.exe'), 'Should ensure curl.exe prefix for CMD');
    assertTrue(cmdLine.includes('-d "{\\"key\\": \\"val\\"}"'), 'Should escape internal double quotes for CMD');

    const beautified = beautifyCurlCommand(raw, { continuationChar: '\\', indentSize: 2 });
    assertTrue(beautified.split('\n').length >= 3, 'Beautified output should have multiple lines');
    assertTrue(beautified.includes('\\\n'), 'Should include backslash line continuations');
  });

  // --- Suite 15: Invoice Generator Engine ---
  test('Invoice Generator', 'Calculates subtotal, discounts, taxes and balances correctly', () => {
    const inv = createDefaultInvoice();
    // Set explicit numbers for predictable verification
    inv.lineItems = [
      { id: '1', description: 'Web Development', quantity: 10, unitPrice: 100, discountPercent: 10 }, // 1000 - 100 = 900
      { id: '2', description: 'Cloud Setup', quantity: 2, unitPrice: 300, discountPercent: 0 },         // 600
    ];
    inv.globalDiscountType = 'percent';
    inv.globalDiscountValue = 10; // 10% on 1500 = 150 -> net = 1350
    inv.taxMode = 'exclusive';
    inv.defaultTaxRate = 20; // 20% on 1350 = 270
    inv.shippingFee = 50;
    inv.extraFeeAmount = 25;
    inv.enableWithholdingTax = true;
    inv.withholdingTaxRate = 5; // 5% of 1350 = 67.5
    inv.amountPaid = 500;

    const totals = calculateInvoiceTotals(inv);
    assertEqual(totals.subtotal, 1600, 'Subtotal should be 1600');
    assertEqual(totals.totalItemDiscount, 100, 'Item discount should be 100');
    assertEqual(totals.globalDiscountAmount, 150, 'Global discount should be 150 (10% of 1500)');
    assertEqual(totals.netTaxableAmount, 1350, 'Net taxable should be 1350');
    assertEqual(totals.primaryTaxAmount, 270, '20% VAT should be 270');
    assertEqual(totals.shippingFee, 50, 'Shipping fee should be 50');
    assertEqual(totals.extraFeeAmount, 25, 'Extra fee should be 25');
    assertEqual(totals.grandTotal, 1695, 'Grand total = 1350 + 270 + 50 + 25 = 1695');
    assertEqual(totals.withholdingTaxAmount, 67.5, '5% withholding tax = 67.5');
    // Balance due = (1695 - 67.5) - 500 = 1127.5
    assertEqual(totals.balanceDue, 1127.5, 'Balance due should be 1127.5');
  });

  test('Invoice Generator', 'Calculates tax-inclusive pricing correctly', () => {
    const inv = createDefaultInvoice();
    inv.lineItems = [
      { id: '1', description: 'Product Sale', quantity: 1, unitPrice: 120, discountPercent: 0 },
    ];
    inv.taxMode = 'inclusive';
    inv.defaultTaxRate = 20; // Price 120 includes 20% tax -> base = 100, tax = 20
    inv.shippingFee = 0;
    inv.extraFeeAmount = 0;
    inv.globalDiscountValue = 0;
    inv.amountPaid = 0;

    const totals = calculateInvoiceTotals(inv);
    assertEqual(totals.subtotal, 120, 'Subtotal should be 120');
    assertEqual(totals.netTaxableAmount, 100, 'Base taxable amount should be 100 for 120 inclusive 20%');
    assertEqual(totals.primaryTaxAmount, 20, 'Included tax should be 20');
    assertEqual(totals.grandTotal, 120, 'Grand total should remain 120 in inclusive mode');
  });

  test('Invoice Generator', 'Supports dual taxes such as CGST + SGST or State + Federal', () => {
    const inv = createDefaultInvoice();
    inv.lineItems = [
      { id: '1', description: 'Service Job', quantity: 1, unitPrice: 1000, discountPercent: 0 },
    ];
    inv.taxMode = 'exclusive';
    inv.defaultTaxLabel = 'CGST';
    inv.defaultTaxRate = 9;
    inv.enableSecondTax = true;
    inv.secondTaxLabel = 'SGST';
    inv.secondTaxRate = 9;
    inv.globalDiscountValue = 0;

    const totals = calculateInvoiceTotals(inv);
    assertEqual(totals.primaryTaxAmount, 90, 'CGST 9% of 1000 = 90');
    assertEqual(totals.secondTaxAmount, 90, 'SGST 9% of 1000 = 90');
    assertEqual(totals.totalTax, 180, 'Total tax should be 180');
    assertEqual(totals.grandTotal, 1180, 'Grand total should be 1180');
  });

  test('Invoice Generator', 'Formats multi-currency amounts with prefix, suffix and decimal precision', () => {
    const usd = POPULAR_CURRENCIES.find((c) => c.code === 'USD')!;
    const eur = POPULAR_CURRENCIES.find((c) => c.code === 'EUR')!;
    const jpy = POPULAR_CURRENCIES.find((c) => c.code === 'JPY')!;

    assertEqual(formatInvoiceCurrency(1250.5, usd), '$1,250.50', 'USD should format with leading symbol and 2 decimals');
    assertEqual(formatInvoiceCurrency(1250.5, eur), '1,250.50 €', 'EUR should format with trailing symbol and 2 decimals');
    assertEqual(formatInvoiceCurrency(1250, jpy), '¥1,250', 'JPY should format with 0 decimals');
  });

  test('Invoice Generator', 'Supports custom general currency settings with 3 decimals and suffix symbol', () => {
    const customKwd = {
      code: 'KWD',
      symbol: 'KD',
      name: 'Kuwaiti Dinar',
      position: 'after' as const,
      decimals: 3,
    };
    assertEqual(formatInvoiceCurrency(45.123, customKwd), '45.123 KD', 'Custom currency with 3 decimals and suffix');
    
    const inv = createDefaultInvoice();
    inv.currency = customKwd;
    inv.lineItems = [{ id: '1', description: 'Consulting', quantity: 2, unitPrice: 22.5, discountPercent: 0 }];
    const totals = calculateInvoiceTotals(inv);
    assertEqual(totals.subtotal, 45, 'Subtotal should be 45');
    assertEqual(formatInvoiceCurrency(totals.subtotal, inv.currency), '45.000 KD', 'Subtotal should format with 3 decimals');
  });

  test('Invoice Generator', 'Exports customized invoice settings into a structured template JSON and parses uploaded template', () => {
    const customInv = createDefaultInvoice();
    customInv.sender.companyName = 'Acme Consulting Global';
    customInv.currency = {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      position: 'after',
      decimals: 2,
    };
    customInv.defaultTaxRate = 19;
    customInv.defaultTaxLabel = 'MwSt / VAT';
    customInv.theme.primaryColor = '#059669';

    // 1. Export template JSON string
    const jsonOutput = exportInvoiceTemplateJson(customInv, 'Acme German Template', '19% VAT standard invoicing');
    assertTrue(jsonOutput.includes('"devhub-invoice-template"'), 'Template JSON should contain template format identifier');
    assertTrue(jsonOutput.includes('"Acme Consulting Global"'), 'Template JSON should contain customized company name');
    assertTrue(jsonOutput.includes('"MwSt / VAT"'), 'Template JSON should contain custom tax label');

    // 2. Parse the exported template back
    const parseResult = parseInvoiceTemplate(jsonOutput);
    assertTrue(parseResult.success, 'Parsing exported template JSON should succeed');
    assertEqual(parseResult.templateName, 'Acme German Template', 'Parsed template name should match');
    assertEqual(parseResult.invoice?.sender.companyName, 'Acme Consulting Global', 'Parsed company name should match');
    assertEqual(parseResult.invoice?.currency.code, 'EUR', 'Parsed currency should match');
    assertEqual(parseResult.invoice?.defaultTaxRate, 19, 'Parsed tax rate should match');
    assertEqual(parseResult.invoice?.theme.primaryColor, '#059669', 'Parsed primary theme color should match');

    // 3. Robust parsing of raw invoice JSON or partial template
    const rawInvJson = JSON.stringify(customInv);
    const rawResult = parseInvoiceTemplate(rawInvJson);
    assertTrue(rawResult.success, 'Parsing raw invoice data JSON should also succeed gracefully');
    assertEqual(rawResult.invoice?.sender.companyName, 'Acme Consulting Global', 'Parsed raw invoice data should preserve company name');
  });

  await testAsync('Invoice Generator', 'Generates valid downloadable vector PDF document', async () => {
    const sampleInv = createDefaultInvoice();
    const pdfBytes = await generateInvoicePdf(sampleInv);
    assertTrue(pdfBytes.length > 500, 'Generated invoice PDF should contain valid bytes');
    // PDF Magic bytes check (%PDF-)
    const headerStr = String.fromCharCode(...pdfBytes.slice(0, 5));
    assertTrue(headerStr.startsWith('%PDF'), 'PDF document should start with %PDF header');
  });

  await testAsync('PDF to Markdown Converter', 'Converts structured PDF document to clean GFM Markdown with YAML frontmatter & tables', async () => {
    const samplePdf = await createSampleMarkdownPdf();
    assertTrue(samplePdf.length > 1000, 'Sample PDF should be generated with valid bytes');

    const result = await convertPdfToMarkdown(samplePdf, {
      includeFrontmatter: true,
      detectHeadings: true,
      detectLists: true,
      detectTables: true,
      detectCodeBlocks: true,
      detectBlockquotes: true,
      preservePageDividers: true,
    });

    assertTrue(result.pageCount === 2, 'Sample PDF should have 2 pages');
    assertTrue(result.markdown.includes('title: "DevHub Architecture & Engineering Guide"'), 'Markdown should include YAML frontmatter title');
    assertTrue(result.markdown.includes('## 1. Executive Overview & Architecture'), 'Markdown should detect Section 1 heading');
    assertTrue(result.markdown.includes('### 1.1 Core Engineering Principles'), 'Markdown should detect Subsection 1.1 heading');
    assertTrue(result.markdown.includes('- Deterministic Output:'), 'Markdown should format bullet list item');
    assertTrue(result.markdown.includes('1. PDF Document Parsing:'), 'Markdown should format numbered list item');
    assertTrue(result.markdown.includes('> **Note: Security Compliance Guidelines**') || result.markdown.includes('> Note: Security Compliance Guidelines'), 'Markdown should format blockquote note');
    assertTrue(result.markdown.includes('| Pipeline Component | Throughput (Docs/s) |'), 'Markdown should format GFM table header');
    assertTrue(result.markdown.includes('| --- | --- |'), 'Markdown should format GFM table delimiter row');
    assertTrue(result.markdown.includes('```ts') || result.markdown.includes('import { convertPdfToMarkdown }'), 'Markdown should detect code block');

    // Test Markdown Stats calculation
    const stats = calculateMarkdownStats(result.markdown);
    assertTrue(stats.words > 50, 'Markdown stats should compute word count');
    assertTrue(stats.headings >= 4, 'Markdown stats should detect headings');
    assertTrue(stats.readingTimeMinutes >= 1, 'Markdown stats should compute reading time');

    // Test HTML rendering
    const html = renderMarkdownToHtml(result.markdown);
    assertTrue(html.includes('<h2'), 'HTML render should include <h2> tag');
    assertTrue(html.includes('<table'), 'HTML render should include <table> tag');
  });

  // ==========================================
  // AGREEMENT GENERATOR TESTS
  // ==========================================
  await testAsync('Agreement Generator', 'Default Agreement Configuration & Presets', () => {
    const defaultAgreement = getDefaultContractorAgreement();
    assertTrue(!!defaultAgreement.title, 'Default agreement should have title');
    assertTrue(defaultAgreement.party1.entityType === 'company', 'Party 1 should default to company');
    assertTrue(defaultAgreement.party2.entityType === 'individual', 'Party 2 should default to individual');
    assertTrue(defaultAgreement.milestones.length === 3, 'Default agreement should have 3 milestones');
    assertTrue(defaultAgreement.clauses.length >= 8, 'Default agreement should have at least 8 standard clauses');

    const presets = getAgreementPresets();
    assertTrue(presets.length >= 4, 'Should provide at least 4 presets (Contractor, NDA, Design, MSA)');
    const ndaPreset = presets.find((p) => p.id === 'mutual-nda');
    assertTrue(!!ndaPreset, 'Should find Mutual NDA preset');
    assertTrue(ndaPreset?.config.party1Role === 'Disclosing Party', 'NDA should configure Disclosing Party role');
  });

  await testAsync('Agreement Generator', 'Placeholder Interpolation & Markdown Generation', () => {
    const config = getDefaultContractorAgreement();
    const rawTemplate = 'Pay {{TOTAL_AMOUNT}} on {{NET_DAYS}} net terms in {{JURISDICTION}} to {{CONTRACTOR_NAME}}.';
    const interpolated = interpolatePlaceholders(rawTemplate, config);

    assertTrue(interpolated.includes('$20,000') || interpolated.includes('20,000'), 'Should interpolate total amount with currency symbol');
    assertTrue(interpolated.includes('14 net terms'), 'Should interpolate net days');
    assertTrue(interpolated.includes('State of California'), 'Should interpolate jurisdiction');
    assertTrue(interpolated.includes('Alex Rivera'), 'Should interpolate contractor name');

    const markdown = generateAgreementMarkdown(config);
    assertTrue(markdown.includes('---'), 'Markdown should include YAML frontmatter delimiters');
    assertTrue(markdown.includes('title: "INDEPENDENT CONTRACTOR AGREEMENT"'), 'Markdown should have contract title in frontmatter');
    assertTrue(markdown.includes('# INDEPENDENT CONTRACTOR AGREEMENT'), 'Markdown should have H1 title');
    assertTrue(markdown.includes('## 1. SCOPE OF SERVICES'), 'Markdown should have Section 1');
    assertTrue(markdown.includes('| Milestone Deliverables / Acceptance Criteria | Payout (% / USD) | Target Date |') || markdown.includes('| Milestone Deliverables / Acceptance Criteria | Payout (% / $) | Target Date |'), 'Markdown should render GFM milestone table with currency');
    assertTrue(markdown.includes('IN WITNESS WHEREOF'), 'Markdown should have execution statement');
    assertTrue(markdown.includes('**SIGNATURES & EXECUTION**'), 'Markdown should have signatures header');
  });

  await testAsync('Agreement Generator', 'Multi-Format Document Export (PDF, Docx, HTML)', async () => {
    const config = getDefaultContractorAgreement();

    // Test PDF Generation
    const pdfBytes = await generateAgreementPdf(config);
    assertTrue(pdfBytes instanceof Uint8Array, 'PDF output should be Uint8Array');
    assertTrue(pdfBytes.length > 500, 'PDF output should contain valid bytes');
    const headerStr = String.fromCharCode(...pdfBytes.slice(0, 5));
    assertTrue(headerStr.startsWith('%PDF'), 'PDF output should start with %PDF header');

    // Test Docx Generation
    const docxBlob = await generateAgreementDocx(config);
    assertTrue(docxBlob instanceof Blob, 'Docx output should be a Blob');
    assertTrue(docxBlob.size > 500, 'Docx output should have valid size');

    // Test HTML Generation
    const html = generateAgreementHtml(config);
    assertTrue(html.includes('<!DOCTYPE html>'), 'HTML output should be a full standalone document');
    assertTrue(html.includes('INDEPENDENT CONTRACTOR AGREEMENT'), 'HTML output should include title');
  });

  await testAsync('Agreement Generator', 'Optional & Blank Signatures with Party Details Preserved', async () => {
    const config = getDefaultContractorAgreement();
    // Configure party 1 and party 2 with blank/optional signatures
    config.party1.signature = {
      type: 'blank',
      date: '2026-03-01',
      location: 'San Francisco, CA',
    };
    config.party2.signature = {
      type: 'blank',
      date: '',
    };

    // 1. Check Markdown export
    const markdown = generateAgreementMarkdown(config);
    assertTrue(markdown.includes('Authorized Signature: _______________________'), 'Markdown should have blank line when signature is optional/blank');
    assertTrue(markdown.includes(config.party1.representativeName), 'Party 1 representative name should be preserved in Markdown signature table');
    assertTrue(markdown.includes(config.party2.representativeName), 'Party 2 representative name should be preserved in Markdown signature table');
    assertTrue(markdown.includes(config.party1.representativeTitle), 'Party 1 representative title should be preserved in Markdown signature table');

    // 2. Check PDF export
    const pdfBytes = await generateAgreementPdf(config);
    assertTrue(pdfBytes instanceof Uint8Array, 'PDF output with blank signatures should be valid Uint8Array');
    assertTrue(pdfBytes.length > 500, 'PDF output should have valid size');

    // 3. Check HTML export
    const html = generateAgreementHtml(config);
    assertTrue(html.includes('(Authorized Signature Line)'), 'HTML output should render blank authorized signature line');
    assertTrue(html.includes(config.party1.representativeName), 'HTML should retain Party 1 representative name');
    assertTrue(html.includes(config.party2.representativeName), 'HTML should retain Party 2 representative name');
  });

  await testAsync('Agreement Generator', 'PDF Text Sanitization & Dynamic Text Wrapping (No Mangling)', async () => {
    // Test cleanPdfText
    const dirtyText = `“Smart Quotes” and ‘Apostrophes’ — Em-Dash & En-Dash – Ellipsis… Bullet • NBSP\u00A0 **Bold** *Italic* \`Code\``;
    const sanitized = cleanPdfText(dirtyText);
    assertTrue(!sanitized.includes('“'), 'Should remove left double curly quote');
    assertTrue(!sanitized.includes('”'), 'Should remove right double curly quote');
    assertTrue(!sanitized.includes('—'), 'Should replace em-dash with hyphen');
    assertTrue(!sanitized.includes('…'), 'Should replace ellipsis character with 3 periods');
    assertTrue(sanitized.includes('"Smart Quotes"'), 'Should contain straight ASCII quotes');
    assertTrue(sanitized.includes("'Apostrophes'"), 'Should contain straight ASCII apostrophes');

    // Test PDF generation with complex long text and special characters
    const complexConfig = getDefaultContractorAgreement();
    complexConfig.title = 'MASTER SERVICES AGREEMENT (“MSA”) – 2026 EDITION';
    complexConfig.subtitle = 'Enterprise Software Development & AI Integration Services — Statement of Work (SOW-09)';
    complexConfig.clauses[0].subClauses[0].content = `The Contractor shall design, build, test, and deploy “next-generation” enterprise modules with high availability (99.99%). This includes:
• Complete REST & GraphQL endpoints with robust error handling.
• Real-time synchronization pipelines — zero data loss guarantee.
• Cross-platform compatibility testing across macOS, Linux, and Windows 11.
Each deliverable must adhere strictly to Client’s security standards, GDPR compliance, and SOC 2 Type II controls.`;

    const pdfBytes = await generateAgreementPdf(complexConfig);
    assertTrue(pdfBytes instanceof Uint8Array, 'PDF output should be valid Uint8Array');
    assertTrue(pdfBytes.length > 1000, 'PDF output with multi-clause sanitized text should be valid and substantive');
  });

  await testAsync('Agreement Generator', 'Unsigned is Default Option for Document & Presets', async () => {
    // 1. Check default contractor agreement defaults
    const defaultConfig = getDefaultContractorAgreement();
    assertEqual(defaultConfig.party1.signature.type, 'blank', 'Default party1 signature must be blank (unsigned)');
    assertEqual(defaultConfig.party2.signature.type, 'blank', 'Default party2 signature must be blank (unsigned)');
    assertEqual(defaultConfig.party1.signature.typedName, '', 'Default party1 typed name must be empty');
    assertEqual(defaultConfig.party2.signature.typedName, '', 'Default party2 typed name must be empty');

    // 2. Generate PDF from default config (unsigned)
    const pdfBytes = await generateAgreementPdf(defaultConfig);
    assertTrue(pdfBytes instanceof Uint8Array, 'Default unsigned agreement should export valid PDF');
    assertTrue(pdfBytes.length > 1000, 'Default unsigned PDF should be valid size');
  });

  await testAsync('Agreement Generator', 'Signatures & Execution Renders Full Untruncated Names', async () => {
    const config = getDefaultContractorAgreement();
    // Set long names that previously would have been truncated by 40 char limits
    config.party1.name = 'Consolidated Global Technologies & Quantum Computing International Holdings Corporation';
    config.party1.representativeName = 'Dr. Alexandros Constantine von Hohenzollern-Smythe III';
    config.party1.representativeTitle = 'Senior Executive Vice President of Global Infrastructure Engineering';

    config.party2.name = 'Advanced Autonomous Robotics & Neural Networks Development Laboratories LLC';
    config.party2.representativeName = 'Lady Genevieve Beatrice Montgomery-Huntington, PhD';
    config.party2.representativeTitle = 'Managing Director & Chief Autonomous Systems Technology Architect';

    // Verify PDF generates without errors with long names and wraps cleanly
    const pdfBytes = await generateAgreementPdf(config);
    assertTrue(pdfBytes instanceof Uint8Array, 'PDF output with extra long untruncated names should be valid');
    assertTrue(pdfBytes.length > 1000, 'PDF size should reflect valid rendering of full names');

    // Verify markdown renders full names
    const markdown = generateAgreementMarkdown(config);
    assertTrue(markdown.includes('Dr. Alexandros Constantine von Hohenzollern-Smythe III'), 'Markdown must contain full untruncated Party 1 representative name');
    assertTrue(markdown.includes('Lady Genevieve Beatrice Montgomery-Huntington, PhD'), 'Markdown must contain full untruncated Party 2 representative name');
    assertTrue(markdown.includes('Senior Executive Vice President of Global Infrastructure Engineering'), 'Markdown must contain full untruncated Party 1 title');
  });

  await testAsync('Agreement Generator', 'Generic Document Currency Configuration across Clauses, Tables & Exports', async () => {
    const config = getDefaultContractorAgreement();

    // 1. Verify default currency resolution
    const defaultCurr = getAgreementCurrency(config);
    assertEqual(defaultCurr.code, 'USD', 'Default document currency should be USD');
    assertEqual(defaultCurr.symbol, '$', 'Default document currency symbol should be $');

    // 2. Configure generic EUR currency at document root
    const eurCurrency = POPULAR_CURRENCIES.find((c) => c.code === 'EUR')!;
    config.currency = eurCurrency;
    delete (config.paymentTerms as any).currency; // Test root-level resolution even if absent in paymentTerms

    const resolvedEur = getAgreementCurrency(config);
    assertEqual(resolvedEur.code, 'EUR', 'Should resolve EUR from document root');
    assertEqual(resolvedEur.symbol, '€', 'Should resolve € symbol from document root');

    // 3. Test placeholder interpolation with generic EUR
    const eurTemplate = 'The aggregate contract price is {{TOTAL_AMOUNT}} ({{CURRENCY_CODE}} {{CURRENCY_SYMBOL}}).';
    const interpolatedEur = interpolatePlaceholders(eurTemplate, config);
    assertTrue(interpolatedEur.includes('20,000') && interpolatedEur.includes('€'), 'Interpolation should format with Euro symbol');
    assertTrue(interpolatedEur.includes('EUR'), 'Interpolation should contain EUR code');

    // 4. Test markdown milestone table with EUR
    const markdownEur = generateAgreementMarkdown(config);
    assertTrue(markdownEur.includes('Payout (% / EUR)') || markdownEur.includes('Payout (% / €)'), 'Markdown milestone table header should use EUR');
    assertTrue(markdownEur.includes('6,000') && markdownEur.includes('€'), 'Markdown milestone table row should format with €');

    // 5. Test PDF generation with EUR & non-WinAnsi currencies (INR, GBP)
    const inrCurrency = POPULAR_CURRENCIES.find((c) => c.code === 'INR')!;
    config.currency = inrCurrency;
    const inrFormatted = formatAgreementCurrency(150000, inrCurrency);
    assertTrue(inrFormatted.includes('150,000') && (inrFormatted.includes('₹') || inrFormatted.includes('INR')), 'INR format should format correctly');

    const pdfInrBytes = await generateAgreementPdf(config);
    assertTrue(pdfInrBytes instanceof Uint8Array, 'PDF with INR generic currency should generate valid Uint8Array');
    assertTrue(pdfInrBytes.length > 1000, 'PDF with INR should have valid non-empty size');

    // 6. Test Custom Document Currency (e.g. Swiss Franc / CHF)
    config.currency = {
      code: 'CHF',
      symbol: 'CHF',
      name: 'Swiss Franc',
      position: 'before',
      decimals: 2,
    };
    const chfFormatted = formatAgreementCurrency(50000, config.currency);
    assertTrue(chfFormatted.includes('50,000') && chfFormatted.includes('CHF'), 'Custom currency should format with CHF');

    const markdownChf = generateAgreementMarkdown(config);
    assertTrue(markdownChf.includes('Payout (% / CHF)'), 'Markdown table should display CHF column header');

    const htmlChf = generateAgreementHtml(config);
    assertTrue(htmlChf.includes('CHF') || htmlChf.includes('50,000'), 'HTML export should contain CHF currency');
  });

  await testAsync('Multiple JS/TS & HTML Obfuscator', 'Synchronized Multi-Set Obfuscation & Fundamentals Preservation', async () => {
    const preset = MULTI_OBFUSCATOR_PRESETS[0]; // E-commerce catalog & checkout
    assertEqual(preset.sets.length, 2, 'Preset must provide exactly 2 sets');

    const result = obfuscateMultipleSets(preset.sets, {
      namingStyle: 'hex',
      obfuscateVariables: true,
      obfuscateFunctions: true,
      obfuscateClassesAndInterfaces: true,
      obfuscateHtmlIds: true,
      obfuscateHtmlClasses: true,
      obfuscateStrings: true,
      obfuscateHtmlText: true,
      stripComments: true,
    });

    // 1. Verify 2 output sets generated
    assertEqual(result.sets.length, 2, 'Should generate 2 obfuscated output sets');
    const set1Out = result.sets[0];
    const set2Out = result.sets[1];

    // 2. Fundamentals preservation in Script:
    // Keywords & DOM APIs must remain intact
    assertTrue(set1Out.obfuscatedScript.includes('class ') || set1Out.obfuscatedScript.includes('function'), 'Script should preserve standard language structure');
    assertTrue(set1Out.obfuscatedScript.includes('document.getElementById'), 'Standard DOM API getElementById should not be mangled');
    assertTrue(set1Out.obfuscatedScript.includes('addEventListener'), 'Standard DOM API addEventListener should not be mangled');

    // 3. Custom identifiers in script should be mangled:
    assertTrue(!set1Out.obfuscatedScript.includes('CatalogManager'), 'Custom class CatalogManager should be mangled');
    assertTrue(set1Out.obfuscatedScript.includes('_0x'), 'Mangled hex tokens should appear in script');

    // 4. HTML tags & attributes preservation:
    assertTrue(set1Out.obfuscatedHtml.includes('<div') && set1Out.obfuscatedHtml.includes('</div>'), 'HTML <div> tags should be preserved');
    assertTrue(set1Out.obfuscatedHtml.includes('<select') && set1Out.obfuscatedHtml.includes('<option'), 'HTML form elements should be preserved');
    assertTrue(set1Out.obfuscatedHtml.includes('id=') && set1Out.obfuscatedHtml.includes('class='), 'HTML attribute names should be preserved');

    // 5. Synchronized ID & Class mapping between JS and HTML:
    // Original ID 'catalog-grid-wrapper' was mangled to an obfuscated token (e.g. _0xid...)
    const mappedGridId = result.mapping.htmlIds['catalog-grid-wrapper'];
    assertTrue(!!mappedGridId, 'Mapping should register HTML ID catalog-grid-wrapper');
    assertTrue(set1Out.obfuscatedHtml.includes(mappedGridId), 'Obfuscated HTML should contain the mapped ID token');
    assertTrue(set1Out.obfuscatedScript.includes(mappedGridId), 'Obfuscated JS/TS getElementById should use the exact same mapped ID token');

    // 6. Inline event handler synchronization:
    // Original onclick="handleAddToCart('p-101')" in Set 1 HTML must call the mangled function name
    const mappedFn = result.mapping.identifiers['handleAddToCart'];
    if (mappedFn) {
      assertTrue(set1Out.obfuscatedHtml.includes(mappedFn), 'HTML onclick should reference the mangled function token');
      assertTrue(set2Out.obfuscatedScript.includes(mappedFn), 'Script defining function should use the mangled function token');
    }

    // 7. HTML Text nodes obfuscated:
    assertTrue(!set1Out.obfuscatedHtml.includes('Featured Hardware & Accessories'), 'Original text heading should be obfuscated');
  });

  await testAsync('Multiple JS/TS & HTML Obfuscator', 'Lossless 100% De-Obfuscation with Mapping Restoration', async () => {
    const preset = MULTI_OBFUSCATOR_PRESETS[0];
    const obfResult = obfuscateMultipleSets(preset.sets, {
      namingStyle: 'hex',
      obfuscateVariables: true,
      obfuscateFunctions: true,
      obfuscateClassesAndInterfaces: true,
      obfuscateHtmlIds: true,
      obfuscateHtmlClasses: true,
      obfuscateStrings: false, // keep strings clear for strict text comparison
      obfuscateHtmlText: true,
      stripComments: false,
    });

    // Run de-obfuscation batch
    const deobfuscated = deobfuscateMultipleSets(
      [
        { id: 'set-1', name: 'Set 1', scriptCode: obfResult.sets[0].obfuscatedScript, htmlCode: obfResult.sets[0].obfuscatedHtml },
        { id: 'set-2', name: 'Set 2', scriptCode: obfResult.sets[1].obfuscatedScript, htmlCode: obfResult.sets[1].obfuscatedHtml },
      ],
      obfResult.mapping
    );

    assertEqual(deobfuscated.length, 2, 'De-obfuscation should return 2 sets');

    // Verify Set 1 Restored
    const set1Restored = deobfuscated[0];
    assertTrue(set1Restored.restoredScript.includes('CatalogManager'), 'Restored script must recover class CatalogManager');
    assertTrue(set1Restored.restoredScript.includes('products'), 'Restored script must recover products variable');
    assertTrue(set1Restored.restoredScript.includes('catalog-grid-wrapper'), 'Restored script must recover catalog-grid-wrapper ID');
    assertTrue(set1Restored.restoredHtml.includes('Featured Hardware & Accessories'), 'Restored HTML must recover text heading');
    assertTrue(set1Restored.restoredHtml.includes('catalog-grid-wrapper'), 'Restored HTML must recover original ID');
    assertTrue(set1Restored.restoredHtml.includes('store-wrapper'), 'Restored HTML must recover original CSS classes');

    // Verify Set 2 Restored
    const set2Restored = deobfuscated[1];
    assertTrue(set2Restored.restoredScript.includes('cartState'), 'Restored script 2 must recover cartState variable');
    assertTrue(set2Restored.restoredScript.includes('calculateOrderTotal'), 'Restored script 2 must recover calculateOrderTotal function');
    assertTrue(set2Restored.restoredHtml.includes('Your Shopping Cart & Review'), 'Restored HTML 2 must recover modal title text');
    assertTrue(set2Restored.restoredHtml.includes('order-summary-container'), 'Restored HTML 2 must recover order-summary-container ID');
  });

  await testAsync('Multiple JS/TS & HTML Obfuscator', 'Custom Exclusions Whitelist & Naming Styles', async () => {
    const preset = MULTI_OBFUSCATOR_PRESETS[1]; // Auth & Dashboard

    // Test with Alphabetical style and Custom Exclusions
    const resultAlphabetical = obfuscateMultipleSets(preset.sets, {
      namingStyle: 'alphabetical',
      obfuscateVariables: true,
      obfuscateFunctions: true,
      customExclusions: ['AuthenticationService', 'metric-throughput', 'telemetry-dashboard-panel'],
    });

    const set1Out = resultAlphabetical.sets[0];
    const set2Out = resultAlphabetical.sets[1];

    // 1. Whitelisted class AuthenticationService must NOT be mangled
    assertTrue(set1Out.obfuscatedScript.includes('AuthenticationService'), 'Whitelisted class AuthenticationService should be preserved');

    // 2. Whitelisted ID metric-throughput must NOT be mangled
    assertTrue(set2Out.obfuscatedHtml.includes('metric-throughput'), 'Whitelisted HTML ID metric-throughput should be preserved');

    // 3. Alphabetical tokens should follow format v_... or fn_...
    assertTrue(set1Out.obfuscatedScript.includes('v_') || set1Out.obfuscatedScript.includes('fn_') || set1Out.obfuscatedScript.includes('Cls_'), 'Should contain alphabetical prefixed tokens');
  });

  await testAsync('QR Code Generator', 'Protocol Payload Formatting & Escaping', async () => {
    // 1. Wi-Fi formatting
    const wifiPayload = formatQrPayload('wifi', {
      wifi: { ssid: 'DevHub-Wifi;5G', password: 'pass:123;secret', encryption: 'WPA', hidden: true },
    });
    assertTrue(wifiPayload.startsWith('WIFI:S:DevHub-Wifi\\;5G;'), 'Wi-Fi SSID with special characters should be escaped');
    assertTrue(wifiPayload.includes('P:pass\\:123\\;secret;'), 'Wi-Fi password with colons and semicolons should be escaped');
    assertTrue(wifiPayload.includes('H:true;'), 'Hidden network flag should be present');

    // 2. vCard formatting
    const vcardPayload = formatQrPayload('vcard', {
      vcard: {
        firstName: 'Sarah',
        lastName: 'Connor',
        organization: 'Cyberdyne Resistance',
        title: 'Security Commander',
        email: 'sarah@resistance.org',
        phone: '+15550199',
        mobile: '',
        url: 'https://resistance.org',
        address: 'Bunker 4',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'USA',
        note: 'High Priority Contact',
      },
    });
    assertTrue(vcardPayload.includes('BEGIN:VCARD') && vcardPayload.includes('END:VCARD'), 'vCard must have envelope tags');
    assertTrue(vcardPayload.includes('FN:Sarah Connor'), 'vCard must format full name');
    assertTrue(vcardPayload.includes('EMAIL;TYPE=INTERNET,WORK:sarah@resistance.org'), 'vCard must format email');

    // 3. Crypto formatting
    const btcPayload = formatQrPayload('crypto', {
      crypto: { coin: 'bitcoin', address: 'bc1qexample123', amount: '0.05', label: 'Donation', message: 'Coffee' },
    });
    assertEqual(btcPayload, 'bitcoin:bc1qexample123?amount=0.05&label=Donation&message=Coffee', 'Crypto Bitcoin protocol URL formatted accurately');
  });

  await testAsync('QR Code Generator', 'SVG Generation & Matrix Computation', async () => {
    const payload = 'https://devhub.local/suite';
    const svgStr = await generateQrSvg(payload, {
      fgColor: '#1E293B',
      bgColor: '#FFFFFF',
      errorCorrectionLevel: 'H',
      margin: 2,
    });

    assertTrue(svgStr.includes('<svg') && svgStr.includes('</svg>'), 'Generated SVG must be valid markup');
    assertTrue(svgStr.includes('#1E293B'), 'SVG must include foreground color');

    // Test matrix generator
    const matrixData = getQrMatrix(payload, 'H');
    assertTrue(matrixData.size > 20, 'QR module dimension should be > 20 for standard payload');
    assertEqual(matrixData.finderPatterns.length, 3, 'Must have exactly 3 finder patterns');
    assertEqual(matrixData.matrix.length, matrixData.size, 'Matrix row count matches module count');
  });

  await testAsync('cURL Auth Chain Converter', 'Token Extraction Code Generation', async () => {
    // 1. Root token extraction (e.g. "token" or "access_token")
    const codeToken = generateTokenExtractionCode({
      source: 'json_body',
      keyPath: 'token',
      variableName: 'token',
    }, 'login_res', '    ');
    assertTrue(codeToken.includes('login_res.json()'), 'Should parse json from login_res');
    assertTrue(codeToken.includes('token = login_data.get("token")'), 'Should extract token from root dict');

    // 2. Nested token extraction (e.g. "data.auth.token")
    const codeNested = generateTokenExtractionCode({
      source: 'json_body',
      keyPath: 'data.auth.token',
      variableName: 'jwt_key',
    }, 'res', '  ');
    assertTrue(codeNested.includes('jwt_key = login_data.get("data", {}).get("auth", {}).get("token")'), 'Should extract nested path safely');

    // 3. Response header extraction (e.g. "X-Auth-Token")
    const codeHeader = generateTokenExtractionCode({
      source: 'response_header',
      keyPath: '',
      headerName: 'X-Auth-Token',
      variableName: 'auth_token',
    }, 'login_res', '    ');
    assertTrue(codeHeader.includes('login_res.headers.get("X-Auth-Token")'), 'Should extract from headers');

    // 4. Cookie extraction
    const codeCookie = generateTokenExtractionCode({
      source: 'cookie',
      keyPath: 'session_id',
      variableName: 'session_tok',
    }, 'login_res', '    ');
    assertTrue(codeCookie.includes('login_res.cookies.get("session_id")'), 'Should extract from cookies');
  });

  await testAsync('cURL Auth Chain Converter', 'Header Value Expressions & Auth Replacement', async () => {
    // 1. Bearer format
    const exprBearer = getHeaderValuePythonExpr({
      placement: 'header',
      headerName: 'Authorization',
      headerFormat: 'Bearer {token}',
      queryParamName: 'token',
      bodyFieldName: 'token',
    }, 'token');
    assertEqual(exprBearer, 'f"Bearer {token}"', 'Bearer format expression should match');

    // 2. Raw token format (user specified "token" header)
    const exprRaw = getHeaderValuePythonExpr({
      placement: 'header',
      headerName: 'token',
      headerFormat: '{token}',
      queryParamName: 'token',
      bodyFieldName: 'token',
    }, 'my_token');
    assertEqual(exprRaw, 'my_token', 'Raw token format should directly use variable name');

    // 3. Prepare subsequent request: removes existing stale header
    const parsedSubsequent = parseCurlCommand(
      'curl -X GET https://api.example.com/me -H "Authorization: Bearer static_old" -H "Accept: application/json"'
    );
    const prep = prepareSubsequentRequest(parsedSubsequent, {
      placement: 'header',
      headerName: 'token',
      headerFormat: '{token}',
      queryParamName: 'token',
      bodyFieldName: 'token',
    }, 'token');
    assertEqual(prep.headers['Authorization'], undefined, 'Conflicting static Authorization header should be stripped');
    assertEqual(prep.headers['Accept'], 'application/json', 'Non-auth header should be preserved');
    assertTrue(prep.replacedExistingAuth, 'Should flag replaced existing auth');
  });

  await testAsync('cURL Auth Chain Converter', 'Full Chained Script Generation (Session & Functions)', async () => {
    const preset = CURL_CHAIN_PRESETS[1]; // Simple "token" header preset
    const sessionScript = generateChainedPythonScript(
      preset.loginCurl,
      preset.subsequentRequests,
      preset.extraction,
      preset.injection,
      { ...DEFAULT_OPTIONS, structure: 'session' }
    );

    assertTrue(sessionScript.includes('import requests'), 'Session script must import requests');
    assertTrue(sessionScript.includes('session = requests.Session()'), 'Must initialize session');
    assertTrue(sessionScript.includes('login_res = session.post('), 'Must invoke login endpoint');
    assertTrue(sessionScript.includes('token = login_data.get("token")'), 'Must extract token');
    assertTrue(sessionScript.includes('"token": token'), 'Must update session headers with token');
    assertTrue(sessionScript.includes('url_2 ='), 'Must define subsequent request url');
    assertTrue(sessionScript.includes('session.get(url_2'), 'Must execute subsequent request using session');
    assertTrue(!sessionScript.includes('{method}'), 'Must not contain undefined {method} in f-strings');
    assertTrue(sessionScript.includes('[GET]'), 'Must interpolate concrete HTTP method [GET]');

    // Test modular functions structure
    const funcScript = generateChainedPythonScript(
      preset.loginCurl,
      preset.subsequentRequests,
      preset.extraction,
      preset.injection,
      { ...DEFAULT_OPTIONS, structure: 'functions' }
    );
    assertTrue(funcScript.includes('def login() -> str:'), 'Must generate typed login function');
    assertTrue(funcScript.includes('def step_1_check_account_status(token: str) -> dict:'), 'Must generate step functions with token parameter');
    assertTrue(funcScript.includes('def main():'), 'Must generate main orchestrator');
  });

  // ==========================================
  // DATABASE UPDATE QUERY GENERATOR SUITE
  // ==========================================
  test('Database Update Query Generator', 'PostgreSQL Batch VALUES Strategy with type casts', () => {
    const preset = DB_UPDATE_PRESETS[0]; // users-status-role
    const result = generatePostgresUpdateQuery({
      tableName: preset.tableName,
      matchColumns: preset.matchColumns,
      updateColumns: preset.updateColumns,
      strategy: 'batch_values',
      transactionMode: 'commit',
      returningClause: preset.returningClause,
      includeTypeCasts: true,
    });

    assertTrue(result.rowCount === 5, `Expected 5 rows, got ${result.rowCount}`);
    assertTrue(result.columnCount === 3, `Expected 3 update columns, got ${result.columnCount}`);
    assertTrue(result.sql.includes('UPDATE users AS t'), 'Must contain UPDATE users AS t');
    assertTrue(result.sql.includes('FROM (\n  VALUES'), 'Must contain FROM (VALUES ...)');
    assertTrue(result.sql.includes('status = v.status::text'), 'Must include type cast on status');
    assertTrue(result.sql.includes('WHERE t.id = v.id'), 'Must include WHERE t.id = v.id');
    assertTrue(result.sql.includes('BEGIN;\n\n'), 'Must be wrapped in BEGIN');
    assertTrue(result.sql.includes('\n\nCOMMIT;'), 'Must be committed with COMMIT');
    assertTrue(result.sql.includes('RETURNING id, status, role, updated_at;'), 'Must include RETURNING clause');
    assertTrue(result.pythonSnippet.includes('pg8000.native.Connection'), 'Python snippet must support pg8000');
  });

  test('Database Update Query Generator', 'Individual UPDATE Statements Strategy', () => {
    const result = generatePostgresUpdateQuery({
      tableName: 'products',
      matchColumns: [{ id: 'm1', name: 'sku', type: 'text', values: ['SKU-1', 'SKU-2'] }],
      updateColumns: [{ id: 'u1', name: 'price', type: 'numeric', values: ['19.99', '29.50'] }],
      strategy: 'individual',
      transactionMode: 'none',
    });

    assertTrue(result.rowCount === 2, 'Expected 2 rows');
    assertTrue(result.sql.includes("UPDATE products SET price = 19.99 WHERE sku = 'SKU-1';"), 'Must generate first individual UPDATE statement');
    assertTrue(result.sql.includes("UPDATE products SET price = 29.50 WHERE sku = 'SKU-2';"), 'Must generate second individual UPDATE statement');
  });

  test('Database Update Query Generator', 'CASE-WHEN Update Strategy', () => {
    const result = generatePostgresUpdateQuery({
      tableName: 'accounts',
      matchColumns: [{ id: 'm1', name: 'id', type: 'integer', values: ['1', '2'] }],
      updateColumns: [{ id: 'u1', name: 'status', type: 'text', values: ['active', 'paused'] }],
      strategy: 'case_when',
      transactionMode: 'rollback',
    });

    assertTrue(result.sql.includes('UPDATE accounts\nSET\n  status = CASE id'), 'Must generate CASE WHEN syntax');
    assertTrue(result.sql.includes("WHEN 1 THEN 'active'"), 'Must include WHEN 1 THEN active');
    assertTrue(result.sql.includes("WHEN 2 THEN 'paused'"), 'Must include WHEN 2 THEN paused');
    assertTrue(result.sql.includes('WHERE id IN (\n  1, 2\n)'), 'Must include WHERE id IN (1, 2)');
    assertTrue(result.sql.includes('ROLLBACK;'), 'Must include rollback for dry run');
  });

  test('Database Update Query Generator', 'PostgreSQL Value Escaping and Typing', () => {
    // Single quotes escaping
    const escapedText = formatPostgresValue("O'Reilly", 'text', false);
    assertTrue(escapedText === "'O''Reilly'", `Expected 'O''Reilly', got ${escapedText}`);

    // Numeric and Integer
    const intVal = formatPostgresValue("42", 'integer', false);
    assertTrue(intVal === '42', `Expected 42, got ${intVal}`);

    // Boolean
    const boolVal = formatPostgresValue("true", 'boolean', false);
    assertTrue(boolVal === 'TRUE', `Expected TRUE, got ${boolVal}`);

    // Date & Timestamp (ISO and DD/MM/YYYY formats)
    const tsVal = formatPostgresValue("2026-09-18 10:00:00", 'timestamp', false);
    assertTrue(tsVal === "'2026-09-18 10:00:00'::timestamp", `Expected timestamp cast, got ${tsVal}`);

    const dateDdmmyyyy = formatPostgresValue("24/10/2023", 'date', false);
    assertTrue(dateDdmmyyyy === "'2023-10-24'::date", `Expected '2023-10-24'::date, got ${dateDdmmyyyy}`);

    const tsDdmmyyyy = formatPostgresValue("24/10/2023 15:30:00", 'timestamp', false);
    assertTrue(tsDdmmyyyy === "'2023-10-24 15:30:00'::timestamp", `Expected '2023-10-24 15:30:00'::timestamp, got ${tsDdmmyyyy}`);

    const dateDashedDdmmyyyy = formatPostgresValue("24-10-2023", 'date', false);
    assertTrue(dateDashedDdmmyyyy === "'2023-10-24'::date", `Expected '2023-10-24'::date, got ${dateDashedDdmmyyyy}`);

    // Null
    const nullVal = formatPostgresValue("NULL", 'text', false);
    assertTrue(nullVal === 'NULL', `Expected NULL, got ${nullVal}`);
  });

  test('Database Update Query Generator', 'CSV and TSV parser with inferColumnType', () => {
    const csv = `id,status,score\n1,active,95.5\n2,pending,80.0`;
    const parsed = parseCsvOrTsv(csv);
    assertTrue(parsed.headers.length === 3, 'Must parse 3 headers');
    assertTrue(parsed.rows.length === 2, 'Must parse 2 data rows');
    assertTrue(parsed.rows[0][1] === 'active', 'First row status must be active');

    const inferredInt = inferColumnType(['1', '2', '3']);
    assertTrue(inferredInt === 'integer', `Expected integer, got ${inferredInt}`);

    const inferredNum = inferColumnType(['12.5', '99.9', '0.5']);
    assertTrue(inferredNum === 'numeric', `Expected numeric, got ${inferredNum}`);

    const inferredBool = inferColumnType(['true', 'false', 'true']);
    assertTrue(inferredBool === 'boolean', `Expected boolean, got ${inferredBool}`);

    const inferredDate = inferColumnType(['24/10/2023', '05/11/2023', '15/12/2023']);
    assertTrue(inferredDate === 'date', `Expected date for DD/MM/YYYY, got ${inferredDate}`);
  });

  test('Database Update Query Generator', 'Handles DD/MM/YYYY Dates without Range Errors', () => {
    const result = generatePostgresUpdateQuery({
      tableName: 'customer_subscriptions',
      matchColumns: [
        { id: 'm1', name: 'id', type: 'integer', values: ['101', '102'], valueMode: 'list' },
      ],
      updateColumns: [
        { id: 'u1', name: 'renewal_date', type: 'date', values: ['24/10/2023', '05/11/2023'] },
      ],
      strategy: 'batch_values',
      executionMode: 'batch',
      transactionMode: 'none',
    });

    assertTrue(result.sql.includes("'2023-10-24'::date"), 'Must convert 24/10/2023 to 2023-10-24::date');
    assertTrue(result.sql.includes("'2023-11-05'"), 'Must convert 05/11/2023 to 2023-11-05');
    assertTrue(!result.sql.includes('24/10/2023'), 'Must NOT contain unconverted 24/10/2023');
    assertTrue(result.warnings.some((w) => w.includes('DD/MM/YYYY')), 'Must emit warning about DD/MM/YYYY conversion');
  });

  test('Database Update Query Generator', 'Multiple Match Columns with Single-Value and List-Value Modes', () => {
    // Match column 1: tenant_id (single constant value 'org-123')
    // Match column 2: user_id (list of IDs ['101', '102'])
    const result = generatePostgresUpdateQuery({
      tableName: 'tenant_members',
      matchColumns: [
        { id: 'm1', name: 'tenant_id', type: 'text', values: ['org-123'], valueMode: 'single' },
        { id: 'm2', name: 'user_id', type: 'integer', values: ['101', '102'], valueMode: 'list' }
      ],
      updateColumns: [
        { id: 'u1', name: 'role', type: 'text', values: ['admin', 'manager'] }
      ],
      strategy: 'batch_values',
      executionMode: 'batch',
      transactionMode: 'none',
    });

    assertTrue(result.rowCount === 2, `Expected 2 rows, got ${result.rowCount}`);
    assertTrue(result.sql.includes("t.user_id = v.user_id"), 'Must join on list match key user_id');
    assertTrue(result.sql.includes("t.tenant_id = 'org-123'"), 'Must filter on single match constant tenant_id');
    assertTrue(result.sql.includes("(101::int, 'admin'::text)"), 'First VALUES tuple must contain user_id and role');
    assertTrue(result.sql.includes("(102, 'manager')"), 'Second VALUES tuple must contain user_id and role');
  });

  test('Database Update Query Generator', 'Execution Mode: Batch vs Individual Queries', () => {
    // When executionMode === 'individual'
    const individualResult = generatePostgresUpdateQuery({
      tableName: 'orders',
      matchColumns: [
        { id: 'm1', name: 'store_id', type: 'text', values: ['store-east'], valueMode: 'single' },
        { id: 'm2', name: 'order_id', type: 'integer', values: ['5001', '5002'], valueMode: 'list' }
      ],
      updateColumns: [
        { id: 'u1', name: 'status', type: 'text', values: ['shipped', 'delivered'] }
      ],
      strategy: 'individual',
      executionMode: 'individual',
      transactionMode: 'none',
    });

    assertTrue(individualResult.rowCount === 2, 'Expected 2 rows');
    assertTrue(individualResult.sql.includes("UPDATE orders SET status = 'shipped' WHERE store_id = 'store-east' AND order_id = 5001;"), 'First individual statement must match');
    assertTrue(individualResult.sql.includes("UPDATE orders SET status = 'delivered' WHERE store_id = 'store-east' AND order_id = 5002;"), 'Second individual statement must match');

    // When executionMode === 'batch'
    const batchResult = generatePostgresUpdateQuery({
      tableName: 'orders',
      matchColumns: [
        { id: 'm1', name: 'order_id', type: 'integer', values: ['5001', '5002'], valueMode: 'list' }
      ],
      updateColumns: [
        { id: 'u1', name: 'status', type: 'text', values: ['shipped', 'delivered'] }
      ],
      strategy: 'batch_values',
      executionMode: 'batch',
      transactionMode: 'none',
    });

    assertTrue(batchResult.sql.includes("UPDATE orders AS t SET"), 'Batch query should generate single UPDATE ... FROM (VALUES ...) statement');
    assertTrue(batchResult.sql.includes("FROM (VALUES"), 'Batch query should use VALUES block');
  });

  test('Database Update Query Generator', 'Export and Import Configuration Reusability', () => {
    // 1. Export configuration
    const exportedConfig = createDbUpdateConfigExport({
      name: 'Inventory Restock Config',
      description: 'Bulk update for warehouse stock levels',
      tableName: 'inventory_items',
      matchColumns: [
        { id: 'm1', name: 'warehouse_id', type: 'text', values: ['wh-north'], valueMode: 'single' },
        { id: 'm2', name: 'sku', type: 'text', values: ['SKU-001', 'SKU-002'], valueMode: 'list' }
      ],
      updateColumns: [
        { id: 'u1', name: 'stock_quantity', type: 'integer', values: ['150', '320'] },
        { id: 'u2', name: 'status', type: 'text', values: ['in_stock', 'in_stock'] }
      ],
      executionMode: 'batch',
      strategy: 'batch_values',
      transactionMode: 'commit',
      returningClause: 'sku, stock_quantity, status',
      includeTypeCasts: true,
      includeRowComments: true
    });

    assertTrue(exportedConfig.version === 1, 'Config version must be 1');
    assertTrue(exportedConfig.tableName === 'inventory_items', 'Table name must match');
    assertTrue(exportedConfig.matchColumns.length === 2, 'Must export 2 match columns');
    assertTrue(exportedConfig.updateColumns.length === 2, 'Must export 2 update columns');
    assertTrue(exportedConfig.executionMode === 'batch', 'Execution mode must be batch');

    // 2. Serialize to JSON string
    const jsonString = JSON.stringify(exportedConfig, null, 2);
    assertTrue(typeof jsonString === 'string' && jsonString.length > 50, 'JSON string should be generated');

    // 3. Import & Validate from JSON string
    const parseRes = validateAndParseDbUpdateConfig(jsonString);
    assertTrue(parseRes.success === true, `Failed to parse valid config: ${parseRes.error}`);
    assertTrue(parseRes.config?.tableName === 'inventory_items', 'Imported tableName must match');
    assertTrue(parseRes.config?.matchColumns[0].valueMode === 'single', 'First match col must preserve single valueMode');
    assertTrue(parseRes.config?.matchColumns[1].valueMode === 'list', 'Second match col must preserve list valueMode');

    // 4. Round-trip execution: Generate query from imported configuration
    const generated = generatePostgresUpdateQuery({
      tableName: parseRes.config!.tableName,
      matchColumns: parseRes.config!.matchColumns,
      updateColumns: parseRes.config!.updateColumns,
      executionMode: parseRes.config!.executionMode,
      strategy: parseRes.config!.strategy,
      transactionMode: parseRes.config!.transactionMode,
      returningClause: parseRes.config!.returningClause,
      includeTypeCasts: parseRes.config!.includeTypeCasts,
      includeRowComments: parseRes.config!.includeRowComments
    });

    assertTrue(generated.rowCount === 2, `Expected 2 rows, got ${generated.rowCount}`);
    assertTrue(generated.sql.includes('UPDATE inventory_items AS t'), 'Should update target table');
    assertTrue(generated.sql.includes("t.warehouse_id = 'wh-north'"), 'Should include single match constant');
    assertTrue(generated.sql.includes('t.sku = v.sku'), 'Should join on list match key sku');

    // 5. Validation error handling for invalid JSON
    const invalidRes = validateAndParseDbUpdateConfig('{ invalid json string }');
    assertTrue(invalidRes.success === false, 'Invalid JSON must return success=false');
    assertTrue(typeof invalidRes.error === 'string', 'Error message should be provided');
  });

  test('Database Select Query Generator', 'Batch VALUES Join and Custom Projections', () => {
    const result = generatePostgresSelectQuery({
      tableName: 'users',
      tableAlias: 't',
      matchColumns: [
        { id: 'm1', name: 'tenant_id', type: 'text', valueMode: 'single', singleValue: 'org-123', values: ['org-123'] },
        { id: 'm2', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['101', '102', '103'] }
      ],
      selectColumns: [
        { id: 's1', name: 'id' },
        { id: 's2', name: 'username' },
        { id: 's3', name: 'email' }
      ],
      strategy: 'batch_values',
      executionMode: 'batch',
      orderBy: 't.id ASC',
      limit: '50',
      includeTypeCasts: true
    });

    assertTrue(result.rowCount === 3, `Expected rowCount 3, got ${result.rowCount}`);
    assertTrue(result.sql.includes('FROM users AS t'), 'Should select from users table');
    assertTrue(result.sql.includes('JOIN (\n  VALUES'), 'Should join on VALUES');
    assertTrue(result.sql.includes("101::int"), 'Should include type cast on first row');
    assertTrue(result.sql.includes("t.tenant_id = 'org-123'"), 'Should include constant filter in WHERE');
    assertTrue(result.sql.includes('ORDER BY t.id ASC'), 'Should include ORDER BY');
    assertTrue(result.sql.includes('LIMIT 50'), 'Should include LIMIT');
    assertTrue(result.pythonSnippet.includes('pg8000.native.Connection'), 'Python snippet should include pg8000');
  });

  test('Database Select Query Generator', 'IN and Multi-Column Tuple IN Clauses', () => {
    // Single list column IN
    const singleIn = generatePostgresSelectQuery({
      tableName: 'customers',
      tableAlias: 'c',
      matchColumns: [
        { id: 'm1', name: 'status', type: 'text', valueMode: 'single', singleValue: 'active', values: ['active'] },
        { id: 'm2', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['1', '2', '3'] }
      ],
      selectColumns: [{ id: 's1', name: '*' }],
      selectAllColumns: true,
      strategy: 'in_clause',
      executionMode: 'batch'
    });

    assertTrue(singleIn.sql.includes('c.id IN ('), 'Should use IN clause');
    assertTrue(singleIn.sql.includes("c.status = 'active'"), 'Should include single match');

    // Multi-column Tuple IN
    const tupleIn = generatePostgresSelectQuery({
      tableName: 'order_items',
      tableAlias: 'o',
      matchColumns: [
        { id: 'm1', name: 'store_id', type: 'text', valueMode: 'list', singleValue: '', values: ['east', 'west'] },
        { id: 'm2', name: 'sku', type: 'text', valueMode: 'list', singleValue: '', values: ['SKU-1', 'SKU-2'] }
      ],
      selectColumns: [{ id: 's1', name: '*' }],
      selectAllColumns: true,
      strategy: 'in_clause',
      executionMode: 'batch'
    });

    assertTrue(tupleIn.sql.includes('(o.store_id, o.sku) IN ('), 'Should use tuple IN for multiple list match columns');
    assertTrue(tupleIn.sql.includes("('east', 'SKU-1')"), 'Should format tuple values');
  });

  test('Database Select Query Generator', 'Handles DD/MM/YYYY Dates in Match Columns without Range Errors', () => {
    const dateSelect = generatePostgresSelectQuery({
      tableName: 'customer_orders',
      tableAlias: 'o',
      matchColumns: [
        {
          id: 'm1',
          name: 'order_date',
          type: 'date',
          valueMode: 'list',
          singleValue: '',
          values: ['24/10/2023', '05/11/2023'],
        },
      ],
      selectColumns: [{ id: 's1', name: '*' }],
      selectAllColumns: true,
      strategy: 'in_clause',
      executionMode: 'batch',
    });

    assertTrue(dateSelect.sql.includes("'2023-10-24'::date"), 'Must convert 24/10/2023 to 2023-10-24::date in IN clause');
    assertTrue(dateSelect.sql.includes("'2023-11-05'::date"), 'Must convert 05/11/2023 to 2023-11-05::date');
    assertTrue(!dateSelect.sql.includes('24/10/2023'), 'Must NOT contain unconverted 24/10/2023');
    assertTrue(dateSelect.warnings.some((w) => w.includes('DD/MM/YYYY')), 'Must emit warning about DD/MM/YYYY conversion');
  });

  test('Database Select Query Generator', 'CTE and Individual Statements and UNION ALL', () => {
    // CTE
    const cteResult = generatePostgresSelectQuery({
      tableName: 'inventory',
      tableAlias: 't',
      matchColumns: [
        { id: 'm1', name: 'warehouse_id', type: 'text', valueMode: 'single', singleValue: 'WH-1', values: ['WH-1'] },
        { id: 'm2', name: 'item_id', type: 'integer', valueMode: 'list', singleValue: '', values: ['10', '20'] }
      ],
      selectColumns: [{ id: 's1', name: '*' }],
      selectAllColumns: true,
      strategy: 'cte',
      executionMode: 'batch'
    });
    assertTrue(cteResult.sql.includes('WITH lookup_keys (item_id) AS'), 'Should generate CTE with lookup_keys');
    assertTrue(cteResult.sql.includes('JOIN lookup_keys'), 'Should join CTE');

    // Individual Statements
    const indResult = generatePostgresSelectQuery({
      tableName: 'accounts',
      matchColumns: [
        { id: 'm1', name: 'account_no', type: 'text', valueMode: 'list', singleValue: '', values: ['ACC-1', 'ACC-2'] }
      ],
      selectColumns: [{ id: 's1', name: 'balance' }],
      strategy: 'individual',
      executionMode: 'individual',
      includeRowComments: true
    });
    assertTrue(indResult.sql.includes('-- Query 1 (account_no=ACC-1)'), 'Should include row comment for Query 1');
    assertTrue(indResult.sql.includes('-- Query 2 (account_no=ACC-2)'), 'Should include row comment for Query 2');

    // UNION ALL
    const unionResult = generatePostgresSelectQuery({
      tableName: 'logs',
      matchColumns: [
        { id: 'm1', name: 'level', type: 'text', valueMode: 'list', singleValue: '', values: ['warn', 'error'] }
      ],
      selectColumns: [{ id: 's1', name: 'message' }],
      strategy: 'union_all',
      executionMode: 'batch'
    });
    assertTrue(unionResult.sql.includes('UNION ALL'), 'Should combine statements with UNION ALL');
    assertTrue(unionResult.sql.includes('1 AS query_index'), 'Should include query index provenance');
  });

  test('Database Select Query Generator', 'Export and Import Configuration Reusability', () => {
    const exportedConfig = createDbSelectConfigExport({
      name: 'Product Inventory Search',
      description: 'Find products across warehouses',
      tableName: 'products',
      matchColumns: [
        { id: 'm1', name: 'category', type: 'text', valueMode: 'single', singleValue: 'electronics', values: ['electronics'] },
        { id: 'm2', name: 'sku', type: 'text', valueMode: 'list', singleValue: '', values: ['SKU-A', 'SKU-B'] }
      ],
      selectColumns: [
        { id: 's1', name: 'sku' },
        { id: 's2', name: 'price' }
      ],
      selectAllColumns: false,
      customSelectClause: 'sku, price, stock',
      strategy: 'batch_values',
      executionMode: 'batch',
      isDistinct: true,
      orderBy: 'sku ASC',
      limit: '100'
    });

    assertTrue(exportedConfig.version === 1, 'Config version must be 1');
    assertTrue(exportedConfig.app === 'devhub-db-select-generator', 'App identifier must match');
    assertTrue(exportedConfig.tableName === 'products', 'Table name must be products');
    assertTrue(exportedConfig.isDistinct === true, 'isDistinct must be true');

    const jsonStr = JSON.stringify(exportedConfig, null, 2);
    const parsed = validateAndParseDbSelectConfig(jsonStr);
    assertTrue(parsed.success === true, `Failed to parse select config: ${parsed.error}`);
    assertTrue(parsed.config?.tableName === 'products', 'Imported tableName must match');
    assertTrue(parsed.config?.matchColumns.length === 2, 'Should have 2 match columns');
    assertTrue(parsed.config?.isDistinct === true, 'Imported isDistinct must be true');

    // Round-trip query generation from parsed config
    const generated = generatePostgresSelectQuery(parsed.config!);
    assertTrue(generated.rowCount === 2, `Expected 2 rows, got ${generated.rowCount}`);
    assertTrue(generated.sql.includes('SELECT DISTINCT'), 'Should include DISTINCT keyword');
    assertTrue(generated.sql.includes('LIMIT 100'), 'Should include LIMIT 100');
  });

  test('Database Select Query Generator', 'Supports Queries Without Table Alias', () => {
    // 1. in_clause without alias
    const inClauseNoAlias = generatePostgresSelectQuery({
      tableName: 'customers',
      useTableAlias: false,
      tableAlias: '',
      matchColumns: [
        { id: 'm1', name: 'status', type: 'text', valueMode: 'single', singleValue: 'active', values: ['active'] },
        { id: 'm2', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['1', '2', '3'] }
      ],
      selectColumns: [
        { id: 's1', name: 'id' },
        { id: 's2', name: 'email' }
      ],
      selectAllColumns: false,
      strategy: 'in_clause',
      executionMode: 'batch'
    });

    assertTrue(inClauseNoAlias.sql.includes('FROM customers\nWHERE'), 'Should generate FROM customers without AS alias');
    assertTrue(!inClauseNoAlias.sql.includes('customers AS'), 'Should not contain AS alias');
    assertTrue(inClauseNoAlias.sql.includes('id IN ('), 'Should not prefix with table alias in in_clause');
    assertTrue(inClauseNoAlias.sql.includes("status = 'active'"), 'Should use clean column name in WHERE');

    // 2. batch_values without alias
    const batchValuesNoAlias = generatePostgresSelectQuery({
      tableName: 'users',
      useTableAlias: false,
      tableAlias: '',
      matchColumns: [
        { id: 'm1', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['10', '20'] }
      ],
      selectColumns: [
        { id: 's1', name: 'id' },
        { id: 's2', name: 'username' }
      ],
      strategy: 'batch_values',
      executionMode: 'batch'
    });

    assertTrue(batchValuesNoAlias.sql.includes('FROM users\nJOIN'), 'Should generate FROM users without AS alias');
    assertTrue(!batchValuesNoAlias.sql.includes('users AS'), 'FROM clause should not have alias');
    assertTrue(batchValuesNoAlias.sql.includes('USING (id)'), 'JOIN condition should use USING (id) to avoid ambiguous column error');
    assertTrue(batchValuesNoAlias.sql.includes('id,\n  username'), 'Projection should have clean unqualified column names without alias');

    // 3. Custom select projection stripping alias when useTableAlias is false
    const customProjectionNoAlias = generatePostgresSelectQuery({
      tableName: 'users',
      useTableAlias: false,
      tableAlias: 't',
      selectColumns: [],
      customSelectClause: 't.id, t.username, t.email, t.status',
      matchColumns: [
        { id: 'm1', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['1', '2'] }
      ],
      strategy: 'in_clause',
      executionMode: 'batch'
    });
    assertTrue(!customProjectionNoAlias.sql.includes('t.id'), 'Custom select clause should strip t. alias prefix when useTableAlias is false');
    assertTrue(customProjectionNoAlias.sql.includes('id, username, email, status'), 'Unqualified columns should be present');

    // 4. Alias helpers: strip and prefix
    assertEqual(stripAliasFromExpression('t.id, t.username, t.email', 't'), 'id, username, email');
    assertEqual(stripAliasFromExpression('u.id ASC, u.created_at DESC', 'u'), 'id ASC, created_at DESC');
    assertEqual(prefixAliasToProjection('id, username, email', 't'), 't.id, t.username, t.email');
    assertEqual(prefixAliasToOrderBy('id ASC, created_at DESC', 't'), 't.id ASC, t.created_at DESC');
  });

  test('Database Select Query Generator', 'Supports Ordering by Order of Match and Filter Criteria List and Removes Conflicting ORDER BY', () => {
    // 1. batch_values strategy with order by match list and manual orderBy supplied -> manual orderBy should be REMOVED
    const batchValuesOrdered = generatePostgresSelectQuery({
      tableName: 'orders',
      useTableAlias: true,
      tableAlias: 't',
      orderBy: 't.created_at DESC, t.id ASC', // should be removed because orderByMatchColumnId is active!
      matchColumns: [
        { id: 'm-order-ids', name: 'order_id', type: 'text', valueMode: 'list', singleValue: '', values: ['ORD-99', 'ORD-12', 'ORD-44'] }
      ],
      selectColumns: [{ id: 's1', name: '*' }],
      selectAllColumns: true,
      strategy: 'batch_values',
      executionMode: 'batch',
      orderByMatchColumnId: 'm-order-ids',
      orderByMatchDirection: 'ASC'
    });

    assertTrue(batchValuesOrdered.sql.includes('AS v(order_id, _ord)'), 'Values alias should include _ord column');
    assertTrue(batchValuesOrdered.sql.includes("('ORD-99', 1::int)"), 'Row values should include index for ordering');
    assertTrue(batchValuesOrdered.sql.includes('ORDER BY v._ord ASC'), 'Should ORDER BY v._ord ASC');
    assertTrue(!batchValuesOrdered.sql.includes('t.created_at'), 'Conflicting manual orderBy should be removed when match list order is active');

    // 2. in_clause strategy with order by match list (PostgreSQL array_position) and manual orderBy removed
    const inClauseOrdered = generatePostgresSelectQuery({
      tableName: 'products',
      useTableAlias: false,
      tableAlias: '',
      orderBy: 'price DESC', // should be removed!
      matchColumns: [
        { id: 'm-skus', name: 'sku', type: 'text', valueMode: 'list', singleValue: '', values: ['SKU-Z', 'SKU-A', 'SKU-M'] }
      ],
      selectColumns: [{ id: 's1', name: 'sku' }, { id: 's2', name: 'price' }],
      strategy: 'in_clause',
      executionMode: 'batch',
      orderByMatchColumnId: 'm-skus',
      orderByMatchDirection: 'DESC'
    });

    assertTrue(inClauseOrdered.sql.includes("array_position(ARRAY['SKU-Z', 'SKU-A', 'SKU-M']::text[], sku) DESC"), 'Should order by array_position with cast DESC');
    assertTrue(!inClauseOrdered.sql.includes('price DESC'), 'Manual orderBy should be removed when match list order is active');

    // 3. Manual ORDER BY without match list ordering when useTableAlias is false -> alias is stripped
    const manualOrderNoAlias = generatePostgresSelectQuery({
      tableName: 'products',
      useTableAlias: false,
      tableAlias: 't',
      orderBy: 't.price DESC, t.name ASC',
      matchColumns: [
        { id: 'm-skus', name: 'sku', type: 'text', valueMode: 'list', singleValue: '', values: ['SKU-1', 'SKU-2'] }
      ],
      selectColumns: [{ id: 's1', name: 'sku' }],
      strategy: 'in_clause',
      executionMode: 'batch'
    });
    assertTrue(manualOrderNoAlias.sql.includes('ORDER BY price DESC, name ASC'), 'Manual ORDER BY should have table alias stripped when useTableAlias is false');
    assertTrue(!manualOrderNoAlias.sql.includes('t.price'), 'No t. in ORDER BY');

    // 4. CTE strategy with order by match list
    const cteOrdered = generatePostgresSelectQuery({
      tableName: 'items',
      useTableAlias: true,
      tableAlias: 't',
      matchColumns: [
        { id: 'm-codes', name: 'code', type: 'text', valueMode: 'list', singleValue: '', values: ['C1', 'C2'] }
      ],
      selectColumns: [{ id: 's1', name: '*' }],
      selectAllColumns: true,
      strategy: 'cte',
      executionMode: 'batch',
      orderByMatchColumnId: 'm-codes',
      orderByMatchDirection: 'ASC'
    });

    assertTrue(cteOrdered.sql.includes('lookup_keys (code, _ord)'), 'CTE should include _ord column');
    assertTrue(cteOrdered.sql.includes('ORDER BY lookup_keys._ord ASC'), 'CTE should ORDER BY lookup_keys._ord ASC');

    // 5. Config export and import preserves no-alias and order by match list options
    const exportedWithNewFeatures = createDbSelectConfigExport({
      tableName: 'shipments',
      useTableAlias: false,
      tableAlias: '',
      orderByMatchColumnId: 'm-trk',
      orderByMatchDirection: 'ASC',
      matchColumns: [
        { id: 'm-trk', name: 'tracking_num', type: 'text', valueMode: 'list', singleValue: '', values: ['TRK-1', 'TRK-2'] }
      ],
      selectColumns: [{ id: 's1', name: 'tracking_num' }],
      strategy: 'batch_values',
      executionMode: 'batch'
    });

    assertTrue(exportedWithNewFeatures.useTableAlias === false, 'Exported useTableAlias must be false');
    assertTrue(exportedWithNewFeatures.orderByMatchColumnId === 'm-trk', 'Exported orderByMatchColumnId must match');

    const parsedJson = validateAndParseDbSelectConfig(JSON.stringify(exportedWithNewFeatures));
    assertTrue(parsedJson.success, 'Parsing exported JSON must succeed');
    assertTrue(parsedJson.config?.useTableAlias === false, 'Parsed useTableAlias must be false');
    assertTrue(parsedJson.config?.orderByMatchColumnId === 'm-trk', 'Parsed orderByMatchColumnId must match');

    const reGenerated = generatePostgresSelectQuery(parsedJson.config!);
    assertTrue(reGenerated.sql.includes('FROM shipments\nJOIN'), 'Re-generated query should not have AS alias');
    assertTrue(reGenerated.sql.includes('ORDER BY v._ord ASC'), 'Re-generated query should order by _ord');
  });

  test('Database Select Query Generator', 'Configurable Show NULL Data for Missing Rows (LEFT JOIN)', () => {
    // 1. batch_values strategy with showNullForMissing enabled
    const batchValuesNullData = generatePostgresSelectQuery({
      tableName: 'users',
      useTableAlias: true,
      tableAlias: 't',
      showNullForMissing: true,
      matchColumns: [
        { id: 'm1', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['101', '999'] }
      ],
      selectColumns: [
        { id: 's1', name: 'id' },
        { id: 's2', name: 'username' },
        { id: 's3', name: 'email' }
      ],
      strategy: 'batch_values',
      executionMode: 'batch'
    });

    assertTrue(batchValuesNullData.sql.includes('LEFT JOIN users AS t'), 'batch_values should use LEFT JOIN to preserve unmatched rows');
    assertTrue(batchValuesNullData.sql.includes('FROM (\n  VALUES'), 'Driving table should be the VALUES clause');
    assertTrue(batchValuesNullData.sql.includes('COALESCE(t.id, v.id) AS id'), 'Match column in projection should use COALESCE to retain search key');
    assertTrue(batchValuesNullData.sql.includes('t.username'), 'Target column username should be selected from t');

    // 2. batch_values with showNullForMissing = false (default) should still use standard JOIN
    const batchValuesDefault = generatePostgresSelectQuery({
      tableName: 'users',
      useTableAlias: true,
      tableAlias: 't',
      showNullForMissing: false,
      matchColumns: [
        { id: 'm1', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['101', '999'] }
      ],
      selectColumns: [
        { id: 's1', name: 'id' },
        { id: 's2', name: 'username' }
      ],
      strategy: 'batch_values',
      executionMode: 'batch'
    });
    assertTrue(batchValuesDefault.sql.includes('FROM users AS t\n  JOIN'), 'Default behavior should use standard JOIN');
    assertTrue(!batchValuesDefault.sql.includes('LEFT JOIN'), 'Default behavior should NOT use LEFT JOIN');

    // 3. CTE strategy with showNullForMissing enabled
    const cteNullData = generatePostgresSelectQuery({
      tableName: 'users',
      useTableAlias: true,
      tableAlias: 't',
      showNullForMissing: true,
      matchColumns: [
        { id: 'm1', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['101', '999'] }
      ],
      selectColumns: [
        { id: 's1', name: 'id' },
        { id: 's2', name: 'username' }
      ],
      strategy: 'cte',
      executionMode: 'batch'
    });
    assertTrue(cteNullData.sql.includes('FROM lookup_keys\nLEFT JOIN users AS t'), 'CTE should select from lookup_keys and LEFT JOIN target table');
    assertTrue(cteNullData.sql.includes('COALESCE(t.id, lookup_keys.id) AS id'), 'CTE should COALESCE match column to lookup_keys');

    // 4. Config export and parsing preserves showNullForMissing
    const exportedConfig = createDbSelectConfigExport({
      tableName: 'customers',
      showNullForMissing: true,
      matchColumns: [
        { id: 'm1', name: 'id', type: 'integer', valueMode: 'list', singleValue: '', values: ['501'] }
      ],
      selectColumns: [{ id: 's1', name: 'id' }],
      strategy: 'batch_values',
      executionMode: 'batch'
    });
    assertTrue(exportedConfig.showNullForMissing === true, 'Exported config should have showNullForMissing true');

    const parsedConfig = validateAndParseDbSelectConfig(JSON.stringify(exportedConfig));
    assertTrue(parsedConfig.success && parsedConfig.config?.showNullForMissing === true, 'Parsed config should have showNullForMissing true');

    const queryFromParsed = generatePostgresSelectQuery(parsedConfig.config!);
    assertTrue(queryFromParsed.sql.includes('LEFT JOIN'), 'Query from parsed config should generate LEFT JOIN');
  });

  test('Data Grid Converter', 'CSV Parsing with RFC 4180 Quotes & Escaped Commas', () => {
    const rawCsv = `id,name,notes,amount\n1,"Acme, Corp","Fast, reliable delivery",150.50\n2,"Smith, John ""CEO""",Normal,200.00`;
    const grid = parseToDataGrid(rawCsv, {
      delimiter: 'comma',
      hasHeader: true,
      trimCells: true,
      collapseSpaces: true,
      skipEmptyLines: true,
      ignoreComments: true,
    });

    assertEqual(grid.headers.length, 4, 'Should parse 4 headers');
    assertEqual(grid.headers[0], 'id');
    assertEqual(grid.headers[1], 'name');
    assertEqual(grid.headers[2], 'notes');
    assertEqual(grid.rows.length, 2, 'Should parse 2 data rows');
    assertEqual(grid.rows[0][1], 'Acme, Corp', 'Should preserve comma inside quotes');
    assertEqual(grid.rows[0][2], 'Fast, reliable delivery', 'Should preserve quoted phrase');
    assertEqual(grid.rows[1][1], 'Smith, John "CEO"', 'Should unescape double quotes');
  });

  test('Data Grid Converter', 'Tab-Separated (TSV) and Space-Separated CLI Data Parsing', () => {
    // 1. TSV parsing
    const tsvData = `user_id\trole\tactive\nU101\tAdmin\ttrue\nU102\tDeveloper\tfalse`;
    const tsvGrid = parseToDataGrid(tsvData, {
      delimiter: 'tab',
      hasHeader: true,
      trimCells: true,
      collapseSpaces: false,
      skipEmptyLines: true,
      ignoreComments: true,
    });
    assertEqual(tsvGrid.headers.length, 3, 'TSV should have 3 columns');
    assertEqual(tsvGrid.rows.length, 2, 'TSV should have 2 rows');
    assertEqual(tsvGrid.rows[0][1], 'Admin', 'TSV value should match');

    // 2. Space-separated CLI output (like ps aux or docker ps)
    const spaceData = `PID   USER    CPU   CMD\n1     root    0.0   /sbin/init\n1450  nginx   0.4   nginx-worker`;
    const spaceGrid = parseToDataGrid(spaceData, {
      delimiter: 'space',
      hasHeader: true,
      trimCells: true,
      collapseSpaces: true,
      skipEmptyLines: true,
      ignoreComments: true,
    });
    assertEqual(spaceGrid.headers.length, 4, 'Space grid should have 4 headers');
    assertEqual(spaceGrid.rows.length, 2, 'Space grid should have 2 rows');
    assertEqual(spaceGrid.rows[1][0], '1450', 'PID should be parsed correctly');
    assertEqual(spaceGrid.rows[1][3], 'nginx-worker', 'CMD should be parsed correctly');
  });

  test('Data Grid Converter', 'Auto Delimiter Detection', () => {
    const csvDetected = detectDelimiter('col1,col2,col3\nval1,val2,val3');
    assertEqual(csvDetected.type, 'comma', 'Should detect comma delimiter');

    const tsvDetected = detectDelimiter('col1\tcol2\tcol3\nval1\tval2\tval3');
    assertEqual(tsvDetected.type, 'tab', 'Should detect tab delimiter');

    const pipeDetected = detectDelimiter('col1|col2|col3\nval1|val2|val3');
    assertEqual(pipeDetected.type, 'pipe', 'Should detect pipe delimiter');

    const semiDetected = detectDelimiter('col1;col2;col3\nval1;val2;val3');
    assertEqual(semiDetected.type, 'semicolon', 'Should detect semicolon delimiter');
  });

  test('Data Grid Converter', 'Column Data Extraction & Copying Formats', () => {
    const rawData = `city,country,population\nTokyo,Japan,37400000\nDelhi,India,29300000\nShanghai,China,26300000`;
    const grid = parseToDataGrid(rawData, {
      delimiter: 'comma',
      hasHeader: true,
      trimCells: true,
      collapseSpaces: false,
      skipEmptyLines: true,
      ignoreComments: true,
    });

    // 1. Newline list
    const newlineList = extractColumnData(grid, 0, 'newline');
    assertEqual(newlineList, 'Tokyo\nDelhi\nShanghai', 'Should extract column as newline list');

    // 2. Comma separated
    const commaList = extractColumnData(grid, 0, 'comma_space');
    assertEqual(commaList, 'Tokyo, Delhi, Shanghai', 'Should extract column as comma separated string');

    // 3. SQL IN format
    const sqlInList = extractColumnData(grid, 0, 'single_quote_sql');
    assertEqual(sqlInList, "'Tokyo', 'Delhi', 'Shanghai'", 'Should format as SQL IN clause');

    // 4. JSON Array format
    const jsonArrayList = extractColumnData(grid, 0, 'json_array');
    assertTrue(jsonArrayList.includes('"Tokyo"'), 'Should format as JSON array');

    // 5. Column stats
    const popStats = calculateColumnStats(grid, 2);
    assertEqual(popStats.type, 'integer', 'Population should be detected as integer');
    assertEqual(popStats.totalCount, 3);
    assertTrue(popStats.numericStats !== undefined && popStats.numericStats.min === 26300000, 'Numeric stats min should match');
  });

  test('Data Grid Converter', 'Grid Transformations: Transpose, Deduplicate, Sort, Filter', () => {
    const rawData = `name,score\nCharlie,85\nAlice,95\nBob,70\nAlice,95`;
    const grid = parseToDataGrid(rawData, {
      delimiter: 'comma',
      hasHeader: true,
      trimCells: true,
      collapseSpaces: false,
      skipEmptyLines: true,
      ignoreComments: true,
    });

    // 1. Deduplicate
    const dedupResult = deduplicateGridRows(grid);
    assertEqual(dedupResult.removedCount, 1, 'Should remove 1 duplicate row');
    assertEqual(dedupResult.grid.rows.length, 3, 'Unique rows should be 3');

    // 2. Sort by score ASC
    const sortedGrid = sortGridRows(dedupResult.grid, 1, 'asc');
    assertEqual(sortedGrid.rows[0][0], 'Bob', 'Lowest score row should be first');
    assertEqual(sortedGrid.rows[2][0], 'Alice', 'Highest score row should be last');

    // 3. Filter by search query
    const filteredGrid = filterGridRows(dedupResult.grid, 'Charlie');
    assertEqual(filteredGrid.rows.length, 1, 'Filter should return 1 matching row');
    assertEqual(filteredGrid.rows[0][0], 'Charlie');

    // 4. Transpose
    const simple = parseToDataGrid(`A,B\n1,2\n3,4`, {
      delimiter: 'comma',
      hasHeader: true,
      trimCells: true,
      collapseSpaces: false,
      skipEmptyLines: true,
      ignoreComments: true,
    });
    const transposed = transposeDataGrid(simple);
    assertEqual(transposed.headers.length, 3, 'Transposed should have 3 headers');
    assertEqual(transposed.headers[0], 'A');
    assertEqual(transposed.headers[1], '1');
    assertEqual(transposed.headers[2], '3');
  });

  test('Data Grid Converter', 'Multi-Format Exporters (CSV, TSV, JSON, Markdown, SQL, HTML, ASCII)', () => {
    const rawData = `id,name,active\n1,Alice,true\n2,Bob,false`;
    const grid = parseToDataGrid(rawData, {
      delimiter: 'comma',
      hasHeader: true,
      trimCells: true,
      collapseSpaces: false,
      skipEmptyLines: true,
      ignoreComments: true,
    });

    // CSV
    const csvExport = exportDataGrid(grid, 'csv');
    assertTrue(csvExport.includes('id,name,active'), 'CSV export should include headers');
    assertTrue(csvExport.includes('1,Alice,true'), 'CSV export should include row 1');

    // TSV
    const tsvExport = exportDataGrid(grid, 'tsv');
    assertTrue(tsvExport.includes('id\tname\tactive'), 'TSV export should include tab separators');

    // JSON Objects
    const jsonObjExport = exportDataGrid(grid, 'json_objects');
    assertTrue(jsonObjExport.includes('"name": "Alice"'), 'JSON Objects export should map keys to values');

    // Markdown Table
    const mdExport = exportDataGrid(grid, 'markdown');
    assertTrue(mdExport.includes('| id'), 'Markdown export should have table pipes');
    assertTrue(mdExport.includes('| ---'), 'Markdown export should have header divider');

    // SQL INSERT
    const sqlExport = exportDataGrid(grid, 'sql_insert', { tableName: 'users' });
    assertTrue(sqlExport.includes('INSERT INTO users'), 'SQL export should generate INSERT statements');
    assertTrue(sqlExport.includes("'Alice'"), 'SQL export should quote string literals');

    // HTML Table
    const htmlExport = exportDataGrid(grid, 'html');
    assertTrue(htmlExport.includes('<table>') || htmlExport.includes('<table class="table">'), 'HTML export should render table tag');
    assertTrue(htmlExport.includes('<th>name</th>'), 'HTML export should render headers');

    // ASCII Box
    const asciiExport = exportDataGrid(grid, 'ascii');
    assertTrue(asciiExport.includes('+'), 'ASCII export should render bordered box grid');
  });

  // =========================================================================
  // DATABASE CATEGORY MATCHER TESTS
  // =========================================================================
  test('Category Matcher', 'SME Compound Rule Logic Evaluation', () => {
    const config = DEFAULT_MATCHER_CONFIG;

    // Micro SME: <=9 employees AND (turnover <= 2M OR balance <= 2M)
    const microSmeRow = {
      id: '1',
      name: 'Micro Test Co',
      recordedCategory: 'Micro SME',
      metrics: {
        no_of_employees: 6,
        annual_turnover: 1500000,
        balance_sheet: 1800000,
      },
    };
    const resMicro = evaluateLocalRow(microSmeRow, config.metricColumns, config.categories, config.ruleLogic);
    assertEqual(resMicro.expectedCategory, 'Micro SME', 'Should evaluate to Micro SME');
    assertEqual(resMicro.status, 'MATCH', 'Should report status as MATCH');

    // Mismatched Row: in DB recorded as Micro SME, but employees is 15 -> should be SME
    const mismatchRow = {
      id: '2',
      name: 'Growing Tech Ltd',
      recordedCategory: 'Micro SME',
      metrics: {
        no_of_employees: 15,
        annual_turnover: 4000000,
        balance_sheet: 3000000,
      },
    };
    const resMismatch = evaluateLocalRow(mismatchRow, config.metricColumns, config.categories, config.ruleLogic);
    assertEqual(resMismatch.expectedCategory, 'SME', 'Expected category should be SME');
    assertEqual(resMismatch.status, 'MISMATCH', 'Should detect category mismatch');

    // Small Midcap: <=499 employees, turnover & balance unbounded
    const midcapRow = {
      id: '3',
      name: 'Midcap Industrial',
      recordedCategory: 'Small Midcap',
      metrics: {
        no_of_employees: 350,
        annual_turnover: 120000000,
        balance_sheet: 95000000,
      },
    };
    const resMidcap = evaluateLocalRow(midcapRow, config.metricColumns, config.categories, config.ruleLogic);
    assertEqual(resMidcap.expectedCategory, 'Small Midcap', 'Should classify as Small Midcap');

    // Fallback: > 499 employees
    const largeRow = {
      id: '4',
      name: 'Global Conglomerate',
      recordedCategory: 'Large Enterprise',
      metrics: {
        no_of_employees: 1200,
        annual_turnover: 500000000,
        balance_sheet: 400000000,
      },
    };
    const resLarge = evaluateLocalRow(largeRow, config.metricColumns, config.categories, config.ruleLogic);
    assertEqual(resLarge.expectedCategory, 'Large Enterprise', 'Should fallback to Large Enterprise');
  });

  test('Category Matcher', 'Metadata TSV/CSV Parser', () => {
    const rawInput = `1\t"Micro SME"\t9\t2000000\t2000000
2\t"SME"\t249\t50000000\t43000000
3\t"Small Midcap"\t499`;

    const parsed = parseCategoryMetadataInput(rawInput, DEFAULT_MATCHER_CONFIG.metricColumns);
    assertEqual(parsed.categories.length, 3, 'Should parse 3 category rules');
    assertEqual(parsed.categories[0].categoryName, 'Micro SME', 'First category should be Micro SME');
    assertEqual(parsed.categories[0].criteria.no_of_employees.value, '9', 'Micro SME employees threshold should be 9');
    assertEqual(parsed.categories[1].categoryName, 'SME', 'Second category should be SME');
    assertEqual(parsed.categories[1].criteria.no_of_employees.value, '249', 'SME employees threshold should be 249');
    assertEqual(parsed.categories[2].categoryName, 'Small Midcap', 'Third category should be Small Midcap');
    assertEqual(parsed.categories[2].criteria.no_of_employees.value, '499', 'Small Midcap employees threshold should be 499');
    assertEqual(parsed.categories[2].criteria.annual_turnover.value, '', 'Small Midcap turnover should be empty/unbounded');
  });

  test('Category Matcher', 'PostgreSQL Queries & pg8000 Script Generation', () => {
    const queries = generatePostgresCategoryQueries(DEFAULT_MATCHER_CONFIG);
    assertTrue(queries.discrepancySelectQuery.includes('SELECT'), 'Discrepancy query should contain SELECT');
    assertTrue(queries.discrepancySelectQuery.includes('CASE'), 'Discrepancy query should contain CASE statement');
    assertTrue(queries.discrepancySelectQuery.includes('WHERE'), 'Discrepancy query should filter mismatches');
    assertTrue(queries.classificationSelectQuery.includes('expected_category'), 'Classification query should project expected_category');
    assertTrue(queries.updateTargetTableQuery.includes('UPDATE business_entities'), 'Update query should target business_entities table');
    assertTrue(queries.createPostgresViewQuery.includes('CREATE OR REPLACE VIEW'), 'View query should create or replace view');
    assertTrue(queries.cteRulesJoinQuery.includes('category_rules AS'), 'CTE query should define category_rules CTE');

    const pythonScript = generatePg8000PythonScript(DEFAULT_MATCHER_CONFIG);
    assertTrue(pythonScript.includes('import pg8000.native'), 'Python script should import pg8000.native');
    assertTrue(pythonScript.includes('def validate_categories'), 'Python script should define validate_categories');
    assertTrue(pythonScript.includes('argparse.ArgumentParser'), 'Python script should have CLI argument parser');
  });

  test('Category Matcher', 'Configuration Export & Import Validation', () => {
    const exportedJson = createMatcherConfigExport(DEFAULT_MATCHER_CONFIG);
    assertTrue(typeof exportedJson === 'string', 'Export should return string');
    assertTrue(exportedJson.includes('"targetTable"'), 'Export should include targetTable');

    const parseResult = validateAndParseMatcherConfig(exportedJson);
    assertTrue(parseResult.success, 'Parsing valid export should succeed');
    assertEqual(parseResult.config?.categories.length, DEFAULT_MATCHER_CONFIG.categories.length, 'Category count should match');

    // Invalid JSON test
    const invalidResult = validateAndParseMatcherConfig('{ invalid: json');
    assertTrue(!invalidResult.success, 'Invalid JSON should return failure');
    assertTrue(invalidResult.error !== undefined, 'Invalid JSON should have error message');
  });

  test('Category Matcher', 'Category Mismatch Fix UPDATE Queries PostgreSQL Compatibility', () => {
    // 1. PostgreSQL with RETURNING clause enabled
    const fixResult = generateCategoryMismatchFixQueries(DEFAULT_MATCHER_CONFIG, {
      dialect: 'postgres',
      targetColumn: 'current_category',
      includeReturning: true,
      transactionMode: 'commit',
      mismatchedRows: [
        { id: '102', name: 'Sample A', recordedCategory: 'Retail', expectedCategory: 'Mid-Market Merchant' },
        { id: '104', name: 'Sample B', recordedCategory: 'Mid-Market', expectedCategory: 'Enterprise Merchant' },
      ],
    });

    const dynamicSql = fixResult.dynamicFullTableUpdateSql;
    // CRITICAL: Ensure there is NO semicolon immediately before RETURNING
    assertTrue(!dynamicSql.includes(';\nRETURNING'), 'PostgreSQL dynamic UPDATE must not have a semicolon before RETURNING');
    assertTrue(!dynamicSql.includes('; RETURNING'), 'PostgreSQL dynamic UPDATE must not have semicolon right before RETURNING');
    assertTrue(dynamicSql.includes('RETURNING "id", "current_category" AS new_category;'), 'Must properly format RETURNING clause');
    assertTrue(dynamicSql.includes('BEGIN;\n\nUPDATE "business_entities"'), 'Must start transaction and update target table');
    assertTrue(dynamicSql.includes('COMMIT;'), 'Must commit transaction');

    // 2. PostgreSQL with RETURNING clause disabled
    const noReturningResult = generateCategoryMismatchFixQueries(DEFAULT_MATCHER_CONFIG, {
      dialect: 'postgres',
      targetColumn: 'current_category',
      includeReturning: false,
      transactionMode: 'commit',
    });
    assertTrue(!noReturningResult.dynamicFullTableUpdateSql.includes('RETURNING'), 'When includeReturning is false, RETURNING must not appear');
    assertTrue(noReturningResult.dynamicFullTableUpdateSql.includes(');\n\nCOMMIT;'), 'Update statement must end cleanly before COMMIT');

    // 3. Category-by-Category with RETURNING enabled
    const perCatSql = fixResult.perCategoryUpdateSql;
    assertTrue(!perCatSql.includes(';\nRETURNING'), 'Per-category statements must not place semicolon before RETURNING');
    assertTrue(perCatSql.includes('RETURNING "id", "current_category" AS new_category;'), 'Per-category statements must end with RETURNING clause');

    // 4. Sample Key-Based join update with RETURNING enabled
    const keyBasedSql = fixResult.sampleKeyBasedUpdateSql;
    assertTrue(keyBasedSql.includes('RETURNING t."id", t."current_category" AS new_category;'), 'PostgreSQL Method A join must include RETURNING before semicolon');
    assertTrue(!keyBasedSql.includes(';\nRETURNING'), 'Key-based join must not have semicolon before RETURNING');

    // 5. Verify target column is correctly picked from Category Rules (not defaulting to current_category)
    const customConfig = {
      ...DEFAULT_MATCHER_CONFIG,
      targetTable: {
        ...DEFAULT_MATCHER_CONFIG.targetTable,
        categoryColumn: 'account_tier', // Configured in Category Rules
        newCategoryColumn: 'current_category', // Even if stale/un-synced newCategoryColumn exists
      },
    };

    const rulesTargetResult = generateCategoryMismatchFixQueries(customConfig, {
      dialect: 'postgres',
      // note: targetColumn option is NOT provided here, so it must pick from customConfig.targetTable.categoryColumn
    });

    assertTrue(rulesTargetResult.dynamicFullTableUpdateSql.includes('UPDATE "business_entities"\nSET "account_tier" = CASE'), 'Should pick target column "account_tier" from targetTable.categoryColumn');
    assertTrue(rulesTargetResult.dynamicFullTableUpdateSql.includes('RETURNING "id", "account_tier" AS new_category;'), 'RETURNING clause should use "account_tier"');
    assertTrue(rulesTargetResult.perCategoryUpdateSql.includes('UPDATE "business_entities"\nSET "account_tier" = \'Micro Enterprise\''), 'Per-category query should use "account_tier"');
    assertTrue(rulesTargetResult.verificationSelectSql.includes('WHERE "account_tier" IS NULL'), 'Verification SELECT query should use "account_tier"');

    // 6. Verify explicit option override takes precedence
    const overrideResult = generateCategoryMismatchFixQueries(customConfig, {
      dialect: 'postgres',
      targetColumn: 'custom_override_column',
    });
    assertTrue(overrideResult.dynamicFullTableUpdateSql.includes('SET "custom_override_column"'), 'Explicit targetColumn option should override rules column');

    // 7. Verify Safe Staging & Audit Backup includes all relevant properties (All metric columns)
    const auditSql = fixResult.safeAuditBackupUpdateSql;
    assertTrue(auditSql.includes('CREATE TABLE IF NOT EXISTS "business_entities_category_fix_audit"'), 'Must create audit table');
    assertTrue(auditSql.includes('"no_of_employees" INTEGER'), 'Audit table DDL must include no_of_employees metric column with type');
    assertTrue(auditSql.includes('"annual_turnover" NUMERIC'), 'Audit table DDL must include annual_turnover metric column with type');
    assertTrue(auditSql.includes('"balance_sheet" NUMERIC'), 'Audit table DDL must include balance_sheet metric column with type');
    assertTrue(auditSql.includes('"no_of_employees", "annual_turnover", "balance_sheet"'), 'INSERT statement must insert all metric columns');

    // 8. Verify MySQL dialect audit snapshot includes all metric columns
    const mysqlFixResult = generateCategoryMismatchFixQueries(DEFAULT_MATCHER_CONFIG, {
      dialect: 'mysql',
    });
    const mysqlAuditSql = mysqlFixResult.safeAuditBackupUpdateSql;
    assertTrue(mysqlAuditSql.includes('`business_entities_category_fix_audit`'), 'MySQL must use backtick quotes');
    assertTrue(mysqlAuditSql.includes('`no_of_employees`'), 'MySQL audit table must select no_of_employees');
    assertTrue(mysqlAuditSql.includes('`annual_turnover`'), 'MySQL audit table must select annual_turnover');
    assertTrue(mysqlAuditSql.includes('`balance_sheet`'), 'MySQL audit table must select balance_sheet');
  });

  // =========================================================================
  // DATABASE QUERY BUILDER TESTS (SINGLE & LIST CONDITIONS)
  // =========================================================================
  test('Database Query Builder', 'Date & Time Normalization for PostgreSQL', () => {
    // DD/MM/YYYY
    const dmy = normalizePostgresDate('24/10/2023');
    assertEqual(dmy.normalized, '2023-10-24', 'DD/MM/YYYY should convert to ISO YYYY-MM-DD');
    assertEqual(dmy.isTimestamp, false, 'Should be date not timestamp');

    // DD-MM-YYYY with time
    const dmyTime = normalizePostgresDate('24-10-2023 15:30:00');
    assertEqual(dmyTime.normalized, '2023-10-24 15:30:00', 'Should convert to ISO timestamp');
    assertEqual(dmyTime.isTimestamp, true, 'Should detect timestamp');

    // formatSqlValue
    const sqlDate = formatSqlValue('24/10/2023', 'date');
    assertEqual(sqlDate, "'2023-10-24'::date", 'Should format valid date literal with cast');

    const sqlTime = formatSqlValue('24/10/2023 15:30:00', 'timestamp');
    assertEqual(sqlTime, "'2023-10-24 15:30:00'::timestamp", 'Should format valid timestamp literal');

    // SQL Expression preservation
    const kw = normalizePostgresDate("CURRENT_DATE - INTERVAL '7 days'");
    assertTrue(kw.isKeyword, 'Should detect SQL date expression keyword');
  });

  test('Database Query Builder', 'Excel & Spreadsheet List Parser', () => {
    // Excel column copy (newlines)
    const excelCol = `1001\r\n1002\r\n1003\r\n1002\r\n1004`;
    const parsedCol = parseExcelListInput(excelCol, { deduplicate: true });
    assertEqual(parsedCol.count, 4, 'Should parse 4 unique items after deduplication');
    assertEqual(parsedCol.duplicatesRemoved, 1, 'Should record 1 duplicate removed');
    assertEqual(parsedCol.detectedType, 'integer', 'Should detect integer column type');

    // Quoted strings from spreadsheet
    const quoted = `"sarah@company.com"\n"david@company.com"\n"alex@company.com"`;
    const parsedQuoted = parseExcelListInput(quoted, { trimQuotes: true });
    assertEqual(parsedQuoted.count, 3, 'Should parse 3 emails');
    assertEqual(parsedQuoted.values[0], 'sarah@company.com', 'Should strip double quotes');

    // Tab-separated row copy
    const tabRow = `alpha\tbeta\tgamma`;
    const parsedTab = parseExcelListInput(tabRow, { delimiter: 'tab' });
    assertEqual(parsedTab.count, 3, 'Should parse 3 tab-separated items');
  });

  test('Database Query Builder', 'PostgreSQL Query & CTE Generation', () => {
    const bundle = generatePostgresQueries(DEFAULT_QUERY_BUILDER_CONFIG);
    assertTrue(bundle.mainSql.includes('SELECT'), 'Main SQL should contain SELECT');
    assertTrue(bundle.mainSql.includes('FROM customer_orders'), 'Should query customer_orders');
    assertTrue(bundle.mainSql.includes("'2023-10-24'::date"), 'Should have converted date format in WHERE');
    assertTrue(bundle.mainSql.includes('customer_id IN'), 'Should generate IN list condition');

    // CTE Bulk Join
    assertTrue(bundle.cteJoinSql.includes('WITH filter_values'), 'CTE query should declare filter_values CTE');
    assertTrue(bundle.cteJoinSql.includes('JOIN filter_values'), 'CTE query should join filter_values');

    // Python script with pg8000
    assertTrue(bundle.pythonScript.includes('import pg8000.native'), 'Python script should import pg8000.native');
    assertTrue(bundle.pythonScript.includes('def execute_query'), 'Python script should define execute_query');
  });

  test('Database Query Builder', 'Configuration Export & Import Roundtrip', () => {
    const jsonStr = createDbQueryBuilderExport(DEFAULT_QUERY_BUILDER_CONFIG);
    assertTrue(jsonStr.includes('customer_orders'), 'Exported JSON should include table name');

    const res = validateAndParseDbQueryBuilderConfig(jsonStr);
    assertTrue(res.success, 'Valid JSON should parse successfully');
    assertEqual(res.config?.targetTable.tableName, 'customer_orders', 'Table name should match');
    assertEqual(res.config?.singleConditions.length, DEFAULT_QUERY_BUILDER_CONFIG.singleConditions.length, 'Single conditions count match');

    // Invalid JSON
    const bad = validateAndParseDbQueryBuilderConfig('{ bad json }');
    assertTrue(!bad.success, 'Should reject malformed JSON');
  });

  // =========================================================================
  // DATA SET MATCHER & COMPARATOR TESTS
  // =========================================================================
  test('Data Set Matcher', 'Delimited Parsing & Header Canonicalization', () => {
    // CSV
    const csv = `id,name,role\n1,"Alice, Jr",Admin\n2,Bob,Dev`;
    const parsedCsv = parseDelimitedText(csv, 'comma');
    assertEqual(parsedCsv.headers.length, 3, 'CSV should have 3 headers');
    assertEqual(parsedCsv.rows.length, 2, 'CSV should have 2 rows');
    assertEqual(parsedCsv.rows[0][1], 'Alice, Jr', 'Quoted comma should be preserved');

    // TSV
    const tsv = `id\tname\trole\n1\tAlice\tAdmin`;
    const parsedTsv = parseDelimitedText(tsv, 'tab');
    assertEqual(parsedTsv.headers.length, 3, 'TSV should have 3 headers');
    assertEqual(parsedTsv.rows.length, 1, 'TSV should have 1 row');

    // Space-separated
    const space = `id name role\n101 Alice Admin\n102 Bob Dev`;
    const parsedSpace = parseDelimitedText(space, 'space');
    assertEqual(parsedSpace.headers.length, 3, 'Space-separated should have 3 headers');
    assertEqual(parsedSpace.rows.length, 2, 'Space-separated should have 2 rows');

    // Canonical Header key
    assertEqual(toCanonicalHeaderKey('Customer_ID', false, true), 'customerid', 'Canonical header should strip underscores & lowercase');
    assertEqual(toCanonicalHeaderKey('First Name', false, true), 'firstname', 'Canonical header should strip spaces');
  });

  test('Data Set Matcher', 'Scrambled Headers & Matching Engine', () => {
    // Set A has headers: id, name, status, amount
    const setA = `id,name,status,amount\n101,Alice,ACTIVE,100.00\n102,Bob,PENDING,50.0\n103,Carol,ACTIVE,75.00`;
    // Set B has headers scrambled: amount, id, role, status, name
    // 101: identical (with numeric/case tolerance)
    // 102: status mismatch ('SUSPENDED' vs 'PENDING')
    // 104: only in B
    // 103 is missing in B (only in A)
    const setB = `amount\tid\trole\tstatus\tname\n100\t101\tAdmin\tactive\tAlice\n50.00\t102\tDev\tSUSPENDED\tBob\n200.00\t104\tManager\tACTIVE\tDavid`;

    const result = matchDataSets(setA, setB, {
      ...DEFAULT_DATA_SET_MATCHER_CONFIG,
      keyColumns: ['id'],
      ignoreValueCase: true,
      numericTolerance: true,
    });

    assertEqual(result.summary.totalRecordsEvaluated, 4, 'Should evaluate 4 unique keys: 101, 102, 103, 104');
    assertEqual(result.summary.exactMatches, 1, 'Key 101 should be an exact match (with case & numeric tolerance)');
    assertEqual(result.summary.valueMismatches, 1, 'Key 102 should be a value mismatch');
    assertEqual(result.summary.onlyInA, 1, 'Key 103 should be only in Set A');
    assertEqual(result.summary.onlyInB, 1, 'Key 104 should be only in Set B');

    // Check common columns vs extra columns
    assertTrue(result.commonColumns.includes('id'), 'id should be common');
    assertTrue(result.commonColumns.includes('name'), 'name should be common');
    assertTrue(result.commonColumns.includes('status'), 'status should be common');
    assertTrue(result.commonColumns.includes('amount'), 'amount should be common');
    assertTrue(result.onlyInBColumns.includes('role'), 'role should be recognized as only in B');
  });

  test('Data Set Matcher', 'Tolerance & Normalization Rules', () => {
    // Numeric tolerance
    const eqNum = areValuesEqual('150.00', '150.0', { ...DEFAULT_DATA_SET_MATCHER_CONFIG, numericTolerance: true });
    assertTrue(eqNum.isEqual, '150.00 and 150.0 should be equal under numeric tolerance');

    // Case insensitive
    const eqCase = areValuesEqual('DELIVERED', 'delivered', { ...DEFAULT_DATA_SET_MATCHER_CONFIG, ignoreValueCase: true });
    assertTrue(eqCase.isEqual, 'DELIVERED and delivered should be equal under case insensitivity');

    // Date normalization
    const eqDate = areValuesEqual('24/10/2023', '2023-10-24', { ...DEFAULT_DATA_SET_MATCHER_CONFIG, normalizeDates: true });
    assertTrue(eqDate.isEqual, '24/10/2023 and 2023-10-24 should be normalized to equal dates');

    // Null and empty equivalence
    const eqNull = areValuesEqual('', 'NULL', { ...DEFAULT_DATA_SET_MATCHER_CONFIG, treatNullAndEmptyAsEqual: true });
    assertTrue(eqNull.isEqual, 'Empty string and NULL should be treated as equal');
  });

  test('Data Set Matcher', 'SQL Reconciliation & Export Generation', () => {
    const setA = SAMPLE_DATASETS.ecommerce.dataA;
    const setB = SAMPLE_DATASETS.ecommerce.dataB;
    const result = matchDataSets(setA, setB, DEFAULT_DATA_SET_MATCHER_CONFIG);

    // SQL Generation
    const sql = generateReconciliationSql(result, 'customer_orders', 'update_b_to_match_a');
    assertTrue(sql.includes('UPDATE customer_orders'), 'SQL should contain UPDATE statements');
    assertTrue(sql.includes('BEGIN;') && sql.includes('COMMIT;'), 'SQL should be wrapped in transaction');

    // CSV Diff Export
    const csvDiff = exportDiffToCsv(result);
    assertTrue(csvDiff.includes('Status,Key,Row_in_A,Row_in_B'), 'CSV Diff should contain header columns');

    // Markdown Report
    const md = exportDiffToMarkdown(result);
    assertTrue(md.includes('### Data Comparison Summary'), 'Markdown should have summary title');
    assertTrue(md.includes('| Status | Key |'), 'Markdown should have comparison table');
  });

  test('Data Set Matcher', 'Interactive Column Sorting on Matched Rows', () => {
    const setA = `id,name,amount\n101,Charlie,150.00\n102,Alice,50.00\n103,Bob,200.00\n104,David,75.00`;
    const setB = `id,name,amount\n101,Charlie,150.00\n102,Alice,55.00\n103,Bob,200.00\n105,Emma,300.00`;

    const result = matchDataSets(setA, setB, {
      ...DEFAULT_DATA_SET_MATCHER_CONFIG,
      keyColumns: ['id'],
    });

    // 1. Sort by Key ascending
    const sortedByKeyAsc = sortMatchedRows(result.rows, 'key', 'asc', result.rows);
    assertEqual(sortedByKeyAsc[0].keyValue, '101', 'First row should be 101');
    assertEqual(sortedByKeyAsc[sortedByKeyAsc.length - 1].keyValue, '105', 'Last row should be 105');

    // 2. Sort by Key descending
    const sortedByKeyDesc = sortMatchedRows(result.rows, 'key', 'desc', result.rows);
    assertEqual(sortedByKeyDesc[0].keyValue, '105', 'First row descending should be 105');
    assertEqual(sortedByKeyDesc[sortedByKeyDesc.length - 1].keyValue, '101', 'Last row descending should be 101');

    // 3. Sort by Status (mismatches and diffs first)
    const sortedByStatus = sortMatchedRows(result.rows, 'status', 'asc', result.rows);
    // 102 is VALUE_MISMATCH (amount 50 vs 55)
    assertEqual(sortedByStatus[0].status, 'VALUE_MISMATCH', 'First status sorted should be VALUE_MISMATCH');
    assertEqual(sortedByStatus[0].keyValue, '102', 'Row 102 has mismatch');

    // 4. Sort by numeric column 'amount'
    const sortedByAmountAsc = sortMatchedRows(result.rows, 'amount', 'asc', result.rows);
    const firstAmountVal = sortedByAmountAsc[0].dataA?.amount || sortedByAmountAsc[0].dataB?.amount;
    assertEqual(firstAmountVal, '50.00', 'Lowest amount should be 50.00');

    const sortedByAmountDesc = sortMatchedRows(result.rows, 'amount', 'desc', result.rows);
    const highestAmountVal = sortedByAmountDesc[0].dataB?.amount || sortedByAmountDesc[0].dataA?.amount;
    assertEqual(highestAmountVal, '300.00', 'Highest amount should be 300.00');

    // 5. Test numeric parser helper
    assertEqual(tryParseNumericValue('$1,250.50'), 1250.5, 'Should parse currency formatted string');
    assertEqual(tryParseNumericValue('98.5%'), 98.5, 'Should parse percentage formatted string');
    assertEqual(tryParseNumericValue('non-numeric'), null, 'Should return null for non-numeric string');

    // 6. Reset to original order when sortField is null
    const originalOrder = sortMatchedRows(sortedByKeyDesc, null, 'asc', result.rows);
    assertEqual(originalOrder[0].rowId, result.rows[0].rowId, 'Should restore original index');
  });

  // =========================================================================
  // Query Obfuscator Test Suites
  // =========================================================================
  test('Query Obfuscator', 'Table & Column Name Obfuscation in UPDATE Queries', () => {
    const updateSql = `UPDATE "business_entities"
SET "current_category" = 'SME', "annual_turnover" = 5000000
WHERE "no_of_employees" <= 249;`;

    const res = obfuscateSqlQuery(updateSql, {
      dialect: 'postgres',
      namingStyle: 'prefixed',
      tablePrefix: 'tbl_sec_',
      columnPrefix: 'col_sec_',
      excludedIdentifiers: [],
    });

    assertTrue(res.obfuscatedSql.includes('UPDATE "tbl_sec_01"'), 'Table name business_entities must be obfuscated');
    assertTrue(res.obfuscatedSql.includes('SET "col_sec_01" = \'SME\''), 'Column current_category must be obfuscated');
    assertTrue(res.obfuscatedSql.includes('"col_sec_02" = 5000000'), 'Column annual_turnover must be obfuscated');
    assertTrue(res.obfuscatedSql.includes('"col_sec_03" <= 249'), 'Column no_of_employees in WHERE must be obfuscated');
    assertTrue(res.obfuscatedSql.includes('WHERE'), 'SQL Keyword WHERE must be preserved');
    assertTrue(res.obfuscatedSql.includes('UPDATE'), 'SQL Keyword UPDATE must be preserved');

    // Verify mapping dictionary
    assertEqual(res.mapping.tables['business_entities'], 'tbl_sec_01', 'Table mapping must match');
    assertEqual(res.mapping.columns['current_category'], 'col_sec_01', 'Column mapping must match');
    assertEqual(res.mapping.reverseMapping['tbl_sec_01'], 'business_entities', 'Reverse mapping for table must match');
    assertEqual(res.mapping.reverseMapping['col_sec_01'], 'current_category', 'Reverse mapping for column must match');
  });

  test('Query Obfuscator', 'Reversible De-obfuscation with 100% Roundtrip Guarantee', () => {
    for (const preset of SQL_QUERY_PRESETS) {
      const obf = obfuscateSqlQuery(preset.sql, { dialect: preset.dialect });
      const deob = deobfuscateSqlQuery(obf.obfuscatedSql, obf.mapping);

      assertEqual(
        deob.deobfuscatedSql,
        preset.sql,
        `Roundtrip de-obfuscation must match original query for preset: ${preset.id}`
      );
      assertEqual(deob.unrecognizedTokens.length, 0, 'No unrecognized tokens should remain after de-obfuscation');
      assertTrue(deob.restoredCount > 0, 'Should have restored at least one identifier');
    }
  });

  test('Query Obfuscator', 'Dialect Quoting Styles: MySQL Backticks & SQL Server Brackets', () => {
    // MySQL with backticks
    const mysqlSql = 'SELECT `user_id`, `email` FROM `users` WHERE `status` = 1;';
    const mysqlRes = obfuscateSqlQuery(mysqlSql, {
      dialect: 'mysql',
      excludedIdentifiers: [],
    });
    assertTrue(mysqlRes.obfuscatedSql.includes('`tbl_01`'), 'MySQL backticks around table name must be retained');
    assertTrue(mysqlRes.obfuscatedSql.includes('`col_01`'), 'MySQL backticks around column names must be retained');
    const mysqlDeob = deobfuscateSqlQuery(mysqlRes.obfuscatedSql, mysqlRes.mapping);
    assertEqual(mysqlDeob.deobfuscatedSql, mysqlSql, 'MySQL roundtrip must match exactly');

    // SQL Server with square brackets
    const tsql = 'SELECT [BalanceAmount] FROM [Customers] WHERE [IsActive] = 1;';
    const tsqlRes = obfuscateSqlQuery(tsql, {
      dialect: 'sqlserver',
      excludedIdentifiers: [],
    });
    assertTrue(tsqlRes.obfuscatedSql.includes('[tbl_01]'), 'SQL Server brackets around table name must be retained');
    assertTrue(tsqlRes.obfuscatedSql.includes('[col_01]'), 'SQL Server brackets around column name must be retained');
    const tsqlDeob = deobfuscateSqlQuery(tsqlRes.obfuscatedSql, tsqlRes.mapping);
    assertEqual(tsqlDeob.deobfuscatedSql, tsql, 'SQL Server roundtrip must match exactly');
  });

  test('Query Obfuscator', 'Mapping JSON Export & Import Validation', () => {
    const originalSql = 'SELECT first_name, last_name FROM employees;';
    const obf = obfuscateSqlQuery(originalSql, { excludedIdentifiers: [] });

    // 1. Export structure validation
    const exportedJson = JSON.stringify(obf.mapping);
    assertTrue(exportedJson.includes('"format":"devhub-sql-obfuscator-mapping"'), 'JSON must include format identifier');
    assertTrue(exportedJson.includes('"tables"'), 'JSON must include tables object');
    assertTrue(exportedJson.includes('"columns"'), 'JSON must include columns object');

    // 2. Validate import of full DevHub mapping
    const importRes = validateImportedMapping(exportedJson);
    assertTrue(importRes.success, 'Valid DevHub mapping JSON should succeed import');
    assertEqual(importRes.mapping?.tables['employees'], 'tbl_01', 'Imported table mapping should match');

    // 3. Validate import of simplified key-value mapping
    const simpleJson = JSON.stringify({
      tables: { customers: 'tbl_custom' },
      columns: { email: 'col_custom' },
    });
    const simpleImport = validateImportedMapping(simpleJson);
    assertTrue(simpleImport.success, 'Simple dictionary mapping JSON should succeed import');
    assertEqual(simpleImport.mapping?.tables['customers'], 'tbl_custom', 'Simple table mapping imported');
    assertEqual(simpleImport.mapping?.reverseMapping['tbl_custom'], 'customers', 'Auto-generated reverse mapping');

    // 4. Invalid JSON rejection
    const invalidJson = '{ not valid json';
    const failRes = validateImportedMapping(invalidJson);
    assertTrue(!failRes.success, 'Malformed JSON should fail gracefully');
    assertTrue(failRes.error !== undefined, 'Error message should be provided');
  });

  test('Query Obfuscator', 'Excluded Identifiers & Naming Styles', () => {
    const query = 'SELECT id, created_at, full_name FROM customers WHERE status = \'ACTIVE\';';
    
    // Test with default exclusions (id, created_at, status)
    const res = obfuscateSqlQuery(query, {
      excludedIdentifiers: ['id', 'created_at', 'status'],
    });

    assertTrue(res.obfuscatedSql.includes('id,'), 'Excluded column id must NOT be obfuscated');
    assertTrue(res.obfuscatedSql.includes('created_at,'), 'Excluded column created_at must NOT be obfuscated');
    assertTrue(res.obfuscatedSql.includes('WHERE status ='), 'Excluded column status must NOT be obfuscated');
    assertTrue(!res.obfuscatedSql.includes('full_name'), 'Non-excluded column full_name must be obfuscated');

    // Test Pseudonym naming style
    const pseudoRes = obfuscateSqlQuery(query, {
      namingStyle: 'pseudonym',
      excludedIdentifiers: [],
    });
    assertTrue(pseudoRes.mapping.tables['customers'] !== undefined, 'Customer table must have pseudonym mapping');
    assertTrue(pseudoRes.mapping.tables['customers'].length > 2, 'Pseudonym table name must be populated');
  });

  test('Query Obfuscator', 'PostgreSQL Types & Keywords Protection (character, character varying, cast)', () => {
    // 1. Types like character, character varying, integer, boolean must never be obfuscated
    const createSql = 'CREATE TABLE "accounts" (id integer, username character varying(255), code character(10), bio text, is_active boolean);';
    const createRes = obfuscateSqlQuery(createSql, { dialect: 'postgres', excludedIdentifiers: ['id'] });

    assertTrue(createRes.obfuscatedSql.includes('character varying(255)'), 'character varying type must be preserved');
    assertTrue(createRes.obfuscatedSql.includes('character(10)'), 'character type must be preserved');
    assertTrue(createRes.obfuscatedSql.includes('integer'), 'integer type must be preserved');
    assertTrue(createRes.obfuscatedSql.includes('boolean'), 'boolean type must be preserved');
    assertTrue(!createRes.detectedColumns.includes('character'), 'character must not be detected as a column');
    assertTrue(!createRes.detectedColumns.includes('varying'), 'varying must not be detected as a column');

    // 2. Type casting with :: and CAST(... AS type)
    const castSql = 'SELECT col_a::character varying(100), CAST(col_b AS character(20)) FROM "my_table";';
    const castRes = obfuscateSqlQuery(castSql, { dialect: 'postgres' });

    assertTrue(castRes.obfuscatedSql.includes('::character varying(100)'), '::character varying must be preserved in cast');
    assertTrue(castRes.obfuscatedSql.includes('CAST(') && castRes.obfuscatedSql.includes('AS character(20))'), 'CAST AS character must be preserved');
    assertTrue(!castRes.detectedColumns.includes('character'), 'character in CAST must not be a column');

    // 3. PostgreSQL keywords like LATERAL, CONFLICT, RETURNING, ILIKE must not be obfuscated
    const kwSql = 'SELECT * FROM users WHERE email ILIKE \'%@example.com\' ON CONFLICT (id) DO NOTHING RETURNING id;';
    const kwRes = obfuscateSqlQuery(kwSql, { dialect: 'postgres', excludedIdentifiers: ['id'] });
    assertTrue(kwRes.obfuscatedSql.includes('ILIKE'), 'ILIKE keyword preserved');
    assertTrue(kwRes.obfuscatedSql.includes('ON CONFLICT'), 'ON CONFLICT clause preserved');
    assertTrue(kwRes.obfuscatedSql.includes('DO NOTHING'), 'DO NOTHING clause preserved');
    assertTrue(kwRes.obfuscatedSql.includes('RETURNING'), 'RETURNING clause preserved');
  });

  test('Query Obfuscator', 'Comment De-obfuscation in Single-line & Block Comments', () => {
    // 1. De-obfuscating user-provided obfuscated comments
    const obfWithComments = `-- Fetch user email from tbl_01\n/* Note: tbl_01 joins with tbl_02 on col_01 */\nSELECT tbl_01.col_01, tbl_02.col_02 FROM tbl_01 JOIN tbl_02 ON tbl_01.col_01 = tbl_02.col_01;`;
    const mapping = {
      format: 'devhub-sql-obfuscator-mapping' as const,
      version: '1.0',
      id: 'test-comments',
      name: 'Test Comments Mapping',
      createdAt: '',
      updatedAt: '',
      tables: { customers: 'tbl_01', orders: 'tbl_02' },
      columns: { email_address: 'col_01', order_total: 'col_02' },
      reverseMapping: {
        tbl_01: 'customers',
        tbl_02: 'orders',
        col_01: 'email_address',
        col_02: 'order_total',
      },
      stats: { tablesCount: 2, columnsCount: 2, literalsCount: 0, totalReplacements: 4 },
    };

    const deob = deobfuscateSqlQuery(obfWithComments, mapping);
    assertTrue(deob.deobfuscatedSql.includes('-- Fetch user email from customers'), 'Line comment table name must be de-obfuscated');
    assertTrue(deob.deobfuscatedSql.includes('/* Note: customers joins with orders on email_address */'), 'Block comment identifiers must be de-obfuscated');
    assertTrue(deob.restoredCount >= 4, 'Restorations must account for identifiers restored in comments');

    // 2. Full roundtrip with comments
    const originalWithComments = `-- Audit query for accounts table\n/* Important: accounts.username is unique */\nSELECT accounts.username FROM accounts;`;
    const obfResult = obfuscateSqlQuery(originalWithComments);
    assertTrue(obfResult.obfuscatedSql.includes('-- Audit query for tbl_01 table'), 'Comment table name must be obfuscated');
    assertTrue(obfResult.obfuscatedSql.includes('tbl_01.col_01'), 'Comment column name must be obfuscated');

    const deobResult = deobfuscateSqlQuery(obfResult.obfuscatedSql, obfResult.mapping);
    assertEqual(deobResult.deobfuscatedSql.trim(), originalWithComments.trim(), 'Full roundtrip with comments must match exactly');
  });

  // --- Suite: Clipboard Manager Overlay (Persistence & Last 10 Snippets) ---
  test('Clipboard Manager', 'Snippet Content Type Detection', () => {
    assertEqual(detectSnippetType('{"name": "DevHub", "version": 2}'), 'json', 'Detects valid JSON object');
    assertEqual(detectSnippetType('[1, 2, 3, {"ok": true}]'), 'json', 'Detects valid JSON array');
    assertEqual(detectSnippetType('SELECT id, name FROM users WHERE active = 1;'), 'sql', 'Detects SQL query');
    assertEqual(detectSnippetType('UPDATE accounts SET balance = 500 WHERE id = 12;'), 'sql', 'Detects SQL update');
    assertEqual(detectSnippetType('def process_stream(data):\n    return [x * 2 for x in data]'), 'python', 'Detects Python function');
    assertEqual(detectSnippetType('import os\nfrom datetime import datetime'), 'python', 'Detects Python imports');
    assertEqual(detectSnippetType('curl -X POST https://api.test.com/v1 -H "Authorization: Bearer token"'), 'curl', 'Detects cURL command');
    assertEqual(detectSnippetType('https://github.com/google/ai-studio'), 'url', 'Detects HTTP/HTTPS URL');
    assertEqual(detectSnippetType('123e4567-e89b-12d3-a456-426614174000'), 'uuid', 'Detects UUID v4');
    assertEqual(detectSnippetType('Just a normal plain text note with no code tags.'), 'text', 'Falls back to text');
  });

  test('Clipboard Manager', 'Snippet Preview Formatting', () => {
    const multiLine = 'const a = 1;\nconst b = 2;\nconsole.log(a + b);';
    const preview = generateSnippetPreview(multiLine);
    assertEqual(preview, 'const a = 1;', 'Preview takes clean first line');

    const longLine = 'A'.repeat(120);
    const shortPreview = generateSnippetPreview(longLine, 50);
    assertTrue(shortPreview.length <= 50, 'Preview truncates to specified length');
    assertTrue(shortPreview.endsWith('...'), 'Preview appends ellipsis on truncation');
  });

  test('Clipboard Manager', 'Add, Deduplicate & Cap to Last 10 Items', () => {
    // Start with empty clipboard
    clearClipboardHistory(false);
    assertEqual(getClipboardHistory().length, 0, 'Clipboard history should be empty initially');

    // Add 12 unique items
    for (let i = 1; i <= 12; i++) {
      addClipboardItem(`Snippet content #${i} for DevHub`, `Source Tool ${i}`);
    }

    const history = getClipboardHistory();
    assertEqual(history.length, MAX_CLIPBOARD_ITEMS, 'Must strictly enforce MAX_CLIPBOARD_ITEMS (10)');
    assertEqual(history[0].text, 'Snippet content #12 for DevHub', 'Latest item must be at index 0');
    assertEqual(history[9].text, 'Snippet content #3 for DevHub', 'Items 1 and 2 should have rolled off the 10 limit');

    // Test deduplication: Re-adding item #5 should move it to index 0 without exceeding 10 items
    addClipboardItem('Snippet content #5 for DevHub', 'Updated Source');
    const updated = getClipboardHistory();
    assertEqual(updated.length, 10, 'Length remains 10 after re-adding existing snippet');
    assertEqual(updated[0].text, 'Snippet content #5 for DevHub', 'Re-added snippet moves to top');
    assertEqual(updated[0].source, 'Updated Source', 'Source updates on re-add');
  });

  test('Clipboard Manager', 'Pin, Remove, and Clear Options', () => {
    clearClipboardHistory(false);
    addClipboardItem('Item A');
    addClipboardItem('Item B');
    addClipboardItem('Item C');

    let current = getClipboardHistory();
    assertEqual(current.length, 3, 'Should have 3 items');

    // Pin Item B
    const itemBId = current.find((it) => it.text === 'Item B')!.id;
    current = togglePinClipboardItem(itemBId);
    const pinnedB = current.find((it) => it.id === itemBId);
    assertTrue(Boolean(pinnedB?.pinned), 'Item B should be pinned');

    // Remove Item C
    const itemCId = current.find((it) => it.text === 'Item C')!.id;
    current = removeClipboardItem(itemCId);
    assertEqual(current.length, 2, 'Should have 2 items after removing Item C');
    assertTrue(!current.some((it) => it.id === itemCId), 'Item C should be absent');

    // Clear history while keeping pinned
    current = clearClipboardHistory(true);
    assertEqual(current.length, 1, 'Only pinned items remain when keepPinned is true');
    assertEqual(current[0].text, 'Item B', 'Item B remained because it was pinned');

    // Full clear
    current = clearClipboardHistory(false);
    assertEqual(current.length, 0, 'All items cleared when keepPinned is false');
  });

  test('Clipboard Manager', 'Export and Import JSON Roundtrip', () => {
    clearClipboardHistory(false);
    addClipboardItem('SELECT * FROM audit_logs;', 'Query Obfuscator');
    addClipboardItem('{"status": "ok", "latencyMs": 42}', 'JSON Beautifier');

    const json = exportClipboardHistoryJson();
    assertTrue(json.includes('audit_logs'), 'Exported JSON contains snippet text');
    assertTrue(json.includes('"app": "DevHub"'), 'Exported JSON contains metadata');

    // Clear and import back
    clearClipboardHistory(false);
    assertEqual(getClipboardHistory().length, 0, 'Cleared before import');

    const importRes = importClipboardHistoryJson(json);
    assertTrue(importRes.success, 'Import should succeed with valid JSON');
    assertEqual(importRes.count, 2, 'Imported count should be 2');

    const restored = getClipboardHistory();
    assertEqual(restored.length, 2, 'Restored history length is 2');
    assertTrue(restored.some((it) => it.text.includes('audit_logs')), 'Snippet text restored');
    assertEqual(restored.find((it) => it.text.includes('audit_logs'))?.detectedType, 'sql', 'Type detection preserved');
  });

  // =========================================================================
  // Database Insert Query Generator Test Suites
  // =========================================================================
  test('Database Insert Generator', 'PostgreSQL DDL Schema Parser', () => {
    const ddl = `
CREATE TABLE IF NOT EXISTS "public"."ecommerce_customers" (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email_address CHARACTER VARYING(255) UNIQUE,
  account_balance NUMERIC(10,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`;

    const parsed = parsePostgresSchema(ddl);
    assertTrue(parsed.success, 'Schema parser should succeed for valid CREATE TABLE');
    assertEqual(parsed.tableName, 'ecommerce_customers', 'Extracted table name matches');
    assertEqual(parsed.schema, 'public', 'Extracted schema matches');
    assertEqual(parsed.columns.length, 7, 'Extracted 7 columns from DDL');

    const idCol = parsed.columns.find((c) => c.name === 'id');
    assertTrue(Boolean(idCol?.isPrimaryKey), 'id should be marked as primary key');
    assertTrue(Boolean(idCol?.excludeFromInsert), 'SERIAL primary key should be auto-excluded from INSERT');

    const nameCol = parsed.columns.find((c) => c.name === 'full_name');
    assertTrue(!nameCol?.nullable, 'NOT NULL constraint should set nullable to false');

    const emailCol = parsed.columns.find((c) => c.name === 'email_address');
    assertEqual(emailCol?.type, 'character varying', 'character varying type preserved');
    assertTrue(Boolean(emailCol?.isUnique), 'UNIQUE constraint recognized');
  });

  test('Database Insert Generator', 'Bulk Single Statement & Batch Chunking', () => {
    const opts = {
      ...DEFAULT_INSERT_OPTIONS,
      tableName: 'products',
      rowCount: 5,
      insertStrategy: 'bulk_single_statement' as const,
      returningClause: '*',
    };

    const res = generatePostgresInsertQuery(opts);
    assertTrue(res.sql.includes('INSERT INTO "products"'), 'Contains INSERT INTO products');
    assertTrue(res.sql.includes('VALUES'), 'Contains VALUES clause');
    assertTrue(res.sql.includes('RETURNING *'), 'Contains RETURNING clause');
    assertEqual(res.rowCount, 5, 'Generated 5 rows');
    assertTrue(res.columnsIncluded.length > 0, 'Active columns included');
    assertTrue(res.columnsExcluded.includes('id'), 'id excluded from column list');
  });

  test('Database Insert Generator', 'UPSERT (ON CONFLICT DO NOTHING & DO UPDATE)', () => {
    // 1. DO NOTHING
    const doNothingOpts = {
      ...DEFAULT_INSERT_OPTIONS,
      conflictStrategy: 'do_nothing' as const,
      conflictTargetColumns: ['email'],
    };
    const res1 = generatePostgresInsertQuery(doNothingOpts);
    assertTrue(res1.sql.includes('ON CONFLICT ("email") DO NOTHING'), 'Contains ON CONFLICT DO NOTHING');

    // 2. DO UPDATE SET
    const doUpdateOpts = {
      ...DEFAULT_INSERT_OPTIONS,
      conflictStrategy: 'do_update' as const,
      conflictTargetColumns: ['id'],
      conflictUpdateColumns: ['current_category', 'annual_turnover'],
    };
    const res2 = generatePostgresInsertQuery(doUpdateOpts);
    assertTrue(res2.sql.includes('ON CONFLICT ("id") DO UPDATE SET'), 'Contains ON CONFLICT DO UPDATE SET');
    assertTrue(res2.sql.includes('"current_category" = EXCLUDED."current_category"'), 'Contains EXCLUDED update assignment');
    assertTrue(res2.sql.includes('"annual_turnover" = EXCLUDED."annual_turnover"'), 'Contains EXCLUDED annual_turnover assignment');
  });

  test('Database Insert Generator', 'Strategies: Individual Statements, CTE, & Parameterized', () => {
    // 1. Individual statements
    const indivOpts = {
      ...DEFAULT_INSERT_OPTIONS,
      rowCount: 3,
      insertStrategy: 'individual_statements' as const,
    };
    const indivRes = generatePostgresInsertQuery(indivOpts);
    const matches = indivRes.sql.match(/INSERT INTO/g);
    assertEqual(matches?.length, 3, 'Should generate 3 separate INSERT INTO statements');

    // 2. CTE Values
    const cteOpts = {
      ...DEFAULT_INSERT_OPTIONS,
      rowCount: 4,
      insertStrategy: 'cte_values' as const,
    };
    const cteRes = generatePostgresInsertQuery(cteOpts);
    assertTrue(cteRes.sql.includes('WITH source_rows'), 'Contains WITH source_rows CTE');
    assertTrue(cteRes.sql.includes('SELECT'), 'Contains SELECT from CTE');

    // 3. Parameterized
    const paramOpts = {
      ...DEFAULT_INSERT_OPTIONS,
      rowCount: 2,
      insertStrategy: 'parameterized' as const,
    };
    const paramRes = generatePostgresInsertQuery(paramOpts);
    assertTrue(paramRes.sql.includes('$1'), 'Contains parameter placeholder $1');
    assertTrue(paramRes.sql.includes('$2'), 'Contains parameter placeholder $2');
    assertTrue(Array.isArray(paramRes.parameterValues), 'Returns parameter values matrix');
    assertEqual(paramRes.parameterValues?.length, 2, '2 rows of parameter values');
  });

  test('Database Insert Generator', 'Configuration Export & Import Roundtrip', () => {
    const exportedJson = createDbInsertConfigExport(DEFAULT_INSERT_OPTIONS);
    assertTrue(exportedJson.includes('"app": "DevHub"'), 'Exported JSON contains metadata');
    assertTrue(exportedJson.includes('"tableName": "business_entities"'), 'Exported JSON contains tableName');

    const importRes = validateAndParseDbInsertConfig(exportedJson);
    assertTrue(importRes.success, 'Valid JSON should import successfully');
    assertEqual(importRes.options?.tableName, 'business_entities', 'Restored table name matches');
    assertEqual(importRes.options?.columns.length, DEFAULT_INSERT_OPTIONS.columns.length, 'Restored column count matches');

    // Invalid JSON check
    const invalidRes = validateAndParseDbInsertConfig('{ not json');
    assertTrue(!invalidRes.success, 'Invalid JSON fails validation gracefully');
  });

  test('Database Insert Generator', 'Preferred Values Parsing (Spreadsheet & Pool Input)', () => {
    // 1. Spreadsheet newline paste
    const spreadsheetInput = `Micro SME\nSME\nSmall Midcap\nLarge Enterprise`;
    const parsedList = parsePreferredValuesInput(spreadsheetInput);
    assertEqual(parsedList.length, 4, 'Parsed 4 values from newline-separated input');
    assertEqual(parsedList[0], 'Micro SME', 'First preferred value matches');
    assertEqual(parsedList[3], 'Large Enterprise', 'Last preferred value matches');

    // 2. Comma and semicolon separated input
    const mixedInput = 'PENDING, PROCESSING; SHIPPED, DELIVERED';
    const mixedList = parsePreferredValuesInput(mixedInput);
    assertEqual(mixedList.length, 4, 'Parsed 4 values from mixed comma/semicolon input');
    assertEqual(mixedList[1], 'PROCESSING', 'Second item matches');

    // 3. Pool cycling in query generation
    const poolCol = {
      id: 'col_status',
      name: 'status',
      type: 'varchar' as const,
      nullable: false,
      hasDefault: false,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'pool' as const,
      fixedValue: '',
      valuePool: ['ACTIVE', 'INACTIVE'],
      generatorType: 'name' as const,
    };

    const poolOpts = {
      ...DEFAULT_INSERT_OPTIONS,
      columns: [poolCol],
      rowCount: 4,
    };
    const res = generatePostgresInsertQuery(poolOpts);
    assertTrue(res.sql.includes(`'ACTIVE'`), 'Contains ACTIVE from pool');
    assertTrue(res.sql.includes(`'INACTIVE'`), 'Contains INACTIVE from pool');
  });

  test('Database Insert Generator', 'Data Grid Preview Rows & CSV Export', () => {
    const opts = {
      ...DEFAULT_INSERT_OPTIONS,
      rowCount: 3,
    };
    const res = generatePostgresInsertQuery(opts);
    assertTrue(Array.isArray(res.previewRows), 'Returns previewRows array');
    assertEqual(res.previewRows?.length, 3, 'Preview rows count matches rowCount');
    assertTrue(typeof res.previewCsv === 'string', 'Returns previewCsv string');
    assertTrue(res.previewCsv?.includes('business_name'), 'CSV includes column headers');
  });

  test('Database Insert Generator', 'Generate PostgreSQL CREATE TABLE DDL', () => {
    const ddl = generateCreateTableDdl(DEFAULT_INSERT_OPTIONS);
    assertTrue(ddl.includes('CREATE TABLE IF NOT EXISTS "business_entities"'), 'Contains CREATE TABLE statement');
    assertTrue(ddl.includes('"id" SERIAL'), 'Contains id SERIAL definition');
    assertTrue(ddl.includes('PRIMARY KEY ("id")'), 'Contains PRIMARY KEY table constraint');
  });

  test('Database Insert Generator', 'Size Constraints (character varying (25), numeric(2), char(5))', () => {
    // 1. DDL Parsing of size constraints
    const ddl = `
CREATE TABLE "size_test" (
  code character varying (25) PRIMARY KEY,
  rating numeric(2) NOT NULL,
  cost numeric(10, 2) NOT NULL,
  tag character(5),
  description varchar(20)
);`;

    const parsed = parsePostgresSchema(ddl);
    assertTrue(parsed.success, 'Parsed DDL with size constraints');
    assertEqual(parsed.columns.length, 5, '5 columns parsed');

    const codeCol = parsed.columns.find((c) => c.name === 'code');
    assertEqual(codeCol?.type, 'character varying', 'code type is character varying');
    assertEqual(codeCol?.maxLength, 25, 'character varying (25) size constraint extracted as 25');

    const ratingCol = parsed.columns.find((c) => c.name === 'rating');
    assertEqual(ratingCol?.type, 'numeric', 'rating type is numeric');
    assertEqual(ratingCol?.precision, 2, 'numeric(2) precision extracted as 2');
    assertEqual(ratingCol?.scale, 0, 'numeric(2) scale defaults to 0');

    const costCol = parsed.columns.find((c) => c.name === 'cost');
    assertEqual(costCol?.precision, 10, 'numeric(10, 2) precision extracted as 10');
    assertEqual(costCol?.scale, 2, 'numeric(10, 2) scale extracted as 2');

    const tagCol = parsed.columns.find((c) => c.name === 'tag');
    assertEqual(tagCol?.type, 'character', 'tag type is character');
    assertEqual(tagCol?.maxLength, 5, 'character(5) length extracted as 5');

    const descCol = parsed.columns.find((c) => c.name === 'description');
    assertEqual(descCol?.maxLength, 20, 'varchar(20) length extracted as 20');

    // 2. Query Generation with Size Constraints
    const queryOpts = {
      tableName: 'size_test',
      schema: 'public',
      columns: parsed.columns,
      rowCount: 10,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 100,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '*',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: false,
    };

    const result = generatePostgresInsertQuery(queryOpts);
    assertTrue(Boolean(result.previewRows && result.previewRows.length === 10), '10 preview rows generated');

    // Verify all rows strictly respect character varying (25) and numeric(2)
    for (const row of result.previewRows!) {
      const codeVal = String(row['code']);
      assertTrue(codeVal.length <= 25, `code "${codeVal}" length ${codeVal.length} does not exceed 25`);

      const ratingVal = Number(row['rating']);
      assertTrue(!isNaN(ratingVal), `rating "${ratingVal}" is a valid number`);
      assertTrue(ratingVal <= 99 && ratingVal >= -99, `rating ${ratingVal} fits in numeric(2) <= 99`);
      assertEqual(Math.floor(ratingVal), ratingVal, `rating ${ratingVal} has 0 decimal places`);

      const descVal = String(row['description']);
      assertTrue(descVal.length <= 20, `description "${descVal}" length ${descVal.length} does not exceed 20`);
    }

    // 3. Clamping of oversized fixed and pool values
    const clampedColOpts = {
      tableName: 'size_clamp_test',
      schema: 'public',
      columns: [
        {
          id: 'c1',
          name: 'short_code',
          type: 'character varying' as const,
          maxLength: 10,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed' as const,
          fixedValue: 'This string is way longer than 10 characters',
          valuePool: [],
          generatorType: 'lorem' as const,
        },
        {
          id: 'c2',
          name: 'small_num',
          type: 'numeric' as const,
          precision: 2,
          scale: 0,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed' as const,
          fixedValue: '2500000',
          valuePool: [],
          generatorType: 'random_decimal' as const,
        },
      ],
      rowCount: 2,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 100,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: false,
    };

    const clampedResult = generatePostgresInsertQuery(clampedColOpts);
    for (const row of clampedResult.previewRows!) {
      assertEqual(String(row['short_code']).length, 10, 'Oversized fixed string clamped to max 10 chars');
      assertEqual(row['small_num'], 99, 'Oversized numeric value clamped to max 99 for numeric(2)');
    }

    // 4. CREATE TABLE DDL preserves size constraints
    const ddlOutput = generateCreateTableDdl(queryOpts);
    assertTrue(ddlOutput.includes('"code" CHARACTER VARYING(25)'), 'DDL output includes CHARACTER VARYING(25)');
    assertTrue(ddlOutput.includes('"rating" NUMERIC(2)'), 'DDL output includes NUMERIC(2)');
    assertTrue(ddlOutput.includes('"cost" NUMERIC(10, 2)'), 'DDL output includes NUMERIC(10, 2)');

    // 5. Data Grid Updates: Resultant queries update based on user grid edits
    const gridEditedOpts = {
      ...clampedColOpts,
      rowCount: 2,
      customGridRows: [
        { short_code: 'USER_ED_1', small_num: 45 },
        { short_code: 'USER_ED_2', small_num: 'DEFAULT' },
      ],
    };
    const gridResult = generatePostgresInsertQuery(gridEditedOpts);
    assertTrue(gridResult.sql.includes("'USER_ED_1'"), 'SQL query includes user-edited grid cell value USER_ED_1');
    assertTrue(gridResult.sql.includes('45'), 'SQL query includes user-edited numeric cell value 45');
    assertTrue(gridResult.sql.includes('DEFAULT'), 'SQL query includes user-edited DEFAULT value');
    assertEqual(gridResult.previewRows?.[0]['short_code'], 'USER_ED_1', 'Preview row 0 reflects custom grid short_code');
    assertEqual(gridResult.previewRows?.[0]['small_num'], 45, 'Preview row 0 reflects custom grid small_num');
    assertEqual(gridResult.previewRows?.[1]['small_num'], 'DEFAULT', 'Preview row 1 reflects custom grid DEFAULT');

    // 6. User Override for Sample Descriptive Text
    const loremOpts = {
      tableName: 'audit_records',
      schema: 'public',
      columns: [
        {
          id: 'c_default',
          name: 'default_note',
          type: 'text' as const,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'lorem' as const,
        },
        {
          id: 'c_custom',
          name: 'custom_note',
          type: 'text' as const,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'lorem' as const,
          sampleTextTemplate: 'Order audit note for transaction #{row}',
        },
        {
          id: 'c_clamped',
          name: 'clamped_note',
          type: 'character varying' as const,
          maxLength: 15,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'lorem' as const,
          sampleTextTemplate: 'Very long descriptive message #{row}',
        },
      ],
      rowCount: 2,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 100,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: false,
    };

    const loremRes = generatePostgresInsertQuery(loremOpts);
    // Default text
    assertTrue(loremRes.sql.includes('Sample record entry #1 generated for PostgreSQL integration testing.'), 'Contains default descriptive text');
    // Custom overridden text
    assertTrue(loremRes.sql.includes('Order audit note for transaction #1'), 'Contains overridden descriptive text for row 1');
    assertTrue(loremRes.sql.includes('Order audit note for transaction #2'), 'Contains overridden descriptive text for row 2');
    // Clamped text
    assertEqual(String(loremRes.previewRows?.[0]['clamped_note']).length, 15, 'Overridden descriptive text clamped to maxLength 15');

    // Config export and import preserves sampleTextTemplate
    const exportedConfig = createDbInsertConfigExport(loremOpts);
    const imported = validateAndParseDbInsertConfig(exportedConfig);
    assertTrue(imported.success, 'Config with sampleTextTemplate imported successfully');
    assertEqual(imported.options?.columns[1].sampleTextTemplate, 'Order audit note for transaction #{row}', 'sampleTextTemplate restored from imported JSON');

    // 7. Project Rules & Column Mappings
    // Rule matching by name, alias, and custom mapping
    const directRule = findMatchingProjectRule('product', DEFAULT_PROJECT_RULES, DEFAULT_COLUMN_MAPPINGS);
    assertEqual(directRule?.name, 'product', 'Direct match on product rule');

    const aliasRule = findMatchingProjectRule('item_name', DEFAULT_PROJECT_RULES, DEFAULT_COLUMN_MAPPINGS);
    assertEqual(aliasRule?.name, 'product', 'Alias match on item_name -> product');

    const mappedRule = findMatchingProjectRule('product_name', DEFAULT_PROJECT_RULES, { product_name: 'product' });
    assertEqual(mappedRule?.name, 'product', 'Custom mapping match product_name -> product');

    // Applying Project Rules to Columns
    const testCols: InsertColumnConfig[] = [
      {
        id: 'col_a',
        name: 'product_name',
        type: 'varchar' as const,
        nullable: false,
        hasDefault: false,
        isPrimaryKey: false,
        isUnique: false,
        excludeFromInsert: false,
        valueMode: 'generator' as const,
        fixedValue: '',
        valuePool: [],
        generatorType: 'name' as const,
      },
      {
        id: 'col_b',
        name: 'billing_country',
        type: 'varchar' as const,
        nullable: true,
        hasDefault: false,
        isPrimaryKey: false,
        isUnique: false,
        excludeFromInsert: false,
        valueMode: 'generator' as const,
        fixedValue: '',
        valuePool: [],
        generatorType: 'city' as const,
      },
    ];

    const { updatedColumns, matchedCount } = applyProjectRulesToColumns(
      testCols,
      DEFAULT_PROJECT_RULES,
      DEFAULT_COLUMN_MAPPINGS,
      true
    );

    assertEqual(matchedCount, 2, '2 columns matched to project rules');
    assertEqual(updatedColumns[0].linkedProjectRule, 'product', 'product_name linked to product rule');
    assertEqual(updatedColumns[0].valueMode, 'pool', 'product_name valueMode updated to pool');
    assertTrue(updatedColumns[0].valuePool.includes('Widget Pro'), 'product_name shares Widget Pro from product rule');
    assertEqual(updatedColumns[1].linkedProjectRule, 'country', 'billing_country linked to country rule');
    assertTrue(updatedColumns[1].valuePool.includes('United States'), 'billing_country shares United States from country rule');

    // Export & Import Project Rules JSON
    const rulesJson = exportProjectRulesJson(DEFAULT_PROJECT_RULES, DEFAULT_COLUMN_MAPPINGS, 'Catalog Project', 'General default note for {col} #{row}');
    assertTrue(rulesJson.includes('"tool": "db-insert-query-generator"'), 'Includes tool identifier');
    assertTrue(rulesJson.includes('"product"'), 'Includes product rule in exported JSON');
    assertTrue(rulesJson.includes('"General default note for {col} #{row}"'), 'Includes generalDescriptiveTextTemplate in exported rules');

    const parsedRules = validateAndParseProjectRulesJson(rulesJson);
    assertTrue(parsedRules.success, 'Project rules parsed successfully');
    assertEqual(parsedRules.rules?.length, DEFAULT_PROJECT_RULES.length, 'Restored all default project rules');
    assertEqual(parsedRules.mappings?.['product_name'], 'product', 'Restored product_name -> product mapping');
    assertEqual(parsedRules.generalDescriptiveTextTemplate, 'General default note for {col} #{row}', 'Restored generalDescriptiveTextTemplate');

    // 8. General Descriptive Text Template Rule vs Value-Level Configuration Override Hierarchy
    const hierarchyOpts = {
      tableName: 'system_audits',
      schema: 'public',
      generalDescriptiveTextTemplate: 'General audit log for {table}.{col} #{row}',
      columns: [
        {
          id: 'col_inherited',
          name: 'standard_note',
          type: 'text' as const,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'lorem' as const,
          // no column-level override: inherits general rule
        },
        {
          id: 'col_overridden',
          name: 'vip_note',
          type: 'text' as const,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'lorem' as const,
          // value-level override: should take priority over general rule
          sampleTextTemplate: 'Custom VIP specific override #{row}',
        },
      ],
      rowCount: 2,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 100,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: false,
    };

    const hierarchyRes = generatePostgresInsertQuery(hierarchyOpts);

    // standard_note inherits general template rule with {table} and {col} and {row}
    assertTrue(
      hierarchyRes.sql.includes('General audit log for system_audits.standard_note #1'),
      'standard_note inherits general descriptive rule for row 1'
    );
    assertTrue(
      hierarchyRes.sql.includes('General audit log for system_audits.standard_note #2'),
      'standard_note inherits general descriptive rule for row 2'
    );

    // vip_note uses its own value-level configuration override
    assertTrue(
      hierarchyRes.sql.includes('Custom VIP specific override #1'),
      'vip_note uses value-level override for row 1'
    );
    assertTrue(
      hierarchyRes.sql.includes('Custom VIP specific override #2'),
      'vip_note uses value-level override for row 2'
    );

    // Config export and import preserves generalDescriptiveTextTemplate
    const exportedHierarchyConfig = createDbInsertConfigExport(hierarchyOpts);
    const importedHierarchy = validateAndParseDbInsertConfig(exportedHierarchyConfig);
    assertTrue(importedHierarchy.success, 'Imported hierarchy config successfully');
    assertEqual(
      importedHierarchy.options?.generalDescriptiveTextTemplate,
      'General audit log for {table}.{col} #{row}',
      'generalDescriptiveTextTemplate restored from imported JSON'
    );

    // 9. Data Grid View Updates Column Rule as Fixed Constant Value
    const gridFixedOpts = {
      tableName: 'orders',
      schema: 'public',
      columns: [
        {
          id: 'col_status',
          name: 'status',
          type: 'varchar' as const,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed' as const, // updated to fixed constant rule
          fixedValue: 'CONFIRMED',
          valuePool: [],
          generatorType: 'lorem' as const,
        },
        {
          id: 'col_discount',
          name: 'discount_pct',
          type: 'numeric' as const,
          precision: 4,
          scale: 2,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed' as const, // updated to fixed constant numeric rule
          fixedValue: '15.50',
          valuePool: [],
          generatorType: 'random_decimal' as const,
        },
      ],
      rowCount: 3,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 100,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: false,
    };

    const gridFixedRes = generatePostgresInsertQuery(gridFixedOpts);
    assertTrue(
      gridFixedRes.sql.includes("('CONFIRMED', 15.50)"),
      'Fixed Constant values CONFIRMED and 15.50 properly generated in SQL statement'
    );
    assertEqual(gridFixedRes.previewRows?.length, 3, '3 preview rows generated');
    assertEqual(gridFixedRes.previewRows?.[0]['status'], 'CONFIRMED', 'Preview row 1 has fixed value CONFIRMED');
    assertEqual(gridFixedRes.previewRows?.[1]['status'], 'CONFIRMED', 'Preview row 2 has fixed value CONFIRMED');
    assertEqual(gridFixedRes.previewRows?.[2]['status'], 'CONFIRMED', 'Preview row 3 has fixed value CONFIRMED');
  });

  test('Database Insert Generator', 'General Shared Properties Reusability, Matching & Modes', () => {
    // 1. Shared rules dictionary
    const sharedRules: Record<string, InsertSharedPropertyRule> = {
      tenant_id: {
        id: 'sp_t1',
        columnName: 'tenant_id',
        mode: 'constant',
        constantValue: 'tenant_shared_99',
        active: true,
        matchCaseInsensitive: true,
      },
      created_by: {
        id: 'sp_t2',
        columnName: 'created_by',
        mode: 'constant',
        constantValue: 'sys_admin_user',
        active: true,
        matchCaseInsensitive: true,
      },
      created_at: {
        id: 'sp_t3',
        columnName: 'created_at',
        mode: 'expression',
        expression: 'CURRENT_TIMESTAMP',
        active: true,
        matchCaseInsensitive: true,
      },
      environment: {
        id: 'sp_t4',
        columnName: 'environment',
        mode: 'pool',
        valuePool: ['PROD-1', 'PROD-2'],
        active: true,
        matchCaseInsensitive: true,
      },
      inactive_col: {
        id: 'sp_t5',
        columnName: 'inactive_col',
        mode: 'constant',
        constantValue: 'INACTIVE_VAL',
        active: false,
        matchCaseInsensitive: true,
      },
    };

    // 2. Matching function tests
    const matchExact = findMatchingInsertSharedProperty('tenant_id', sharedRules);
    assertTrue(Boolean(matchExact), 'Exact match on tenant_id found');
    assertEqual(matchExact?.constantValue, 'tenant_shared_99', 'Matched constant value');

    const matchCase = findMatchingInsertSharedProperty('TENANT_ID', sharedRules, true);
    assertTrue(Boolean(matchCase), 'Case-insensitive match on TENANT_ID found');
    assertEqual(matchCase?.columnName, 'tenant_id', 'Matched canonical column name');

    const matchInactive = findMatchingInsertSharedProperty('inactive_col', sharedRules);
    assertEqual(matchInactive, undefined, 'Inactive shared rule does not match');

    const matchNonExistent = findMatchingInsertSharedProperty('unknown_field', sharedRules);
    assertEqual(matchNonExistent, undefined, 'Unknown column name does not match');

    // 3. Query Generation with shared properties applied
    const testCols: InsertColumnConfig[] = [
      {
        id: 'col_1',
        name: 'tenant_id',
        type: 'varchar',
        nullable: false,
        hasDefault: false,
        isPrimaryKey: false,
        isUnique: false,
        excludeFromInsert: false,
        valueMode: 'generator',
        fixedValue: '',
        valuePool: [],
        generatorType: 'company',
      },
      {
        id: 'col_2',
        name: 'created_by',
        type: 'varchar',
        nullable: false,
        hasDefault: false,
        isPrimaryKey: false,
        isUnique: false,
        excludeFromInsert: false,
        valueMode: 'generator',
        fixedValue: '',
        valuePool: [],
        generatorType: 'name',
      },
      {
        id: 'col_3',
        name: 'created_at',
        type: 'timestamptz',
        nullable: false,
        hasDefault: false,
        isPrimaryKey: false,
        isUnique: false,
        excludeFromInsert: false,
        valueMode: 'generator',
        fixedValue: '',
        valuePool: [],
        generatorType: 'current_timestamp',
      },
      {
        id: 'col_4',
        name: 'environment',
        type: 'varchar',
        nullable: false,
        hasDefault: false,
        isPrimaryKey: false,
        isUnique: false,
        excludeFromInsert: false,
        valueMode: 'generator',
        fixedValue: '',
        valuePool: [],
        generatorType: 'name',
      },
      {
        id: 'col_5',
        name: 'item_name',
        type: 'varchar',
        nullable: false,
        hasDefault: false,
        isPrimaryKey: false,
        isUnique: false,
        excludeFromInsert: false,
        valueMode: 'generator',
        fixedValue: '',
        valuePool: [],
        generatorType: 'company',
      },
    ];

    const queryOpts = {
      tableName: 'tenant_records',
      schema: 'public',
      columns: testCols,
      rowCount: 4,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 100,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: true,
      sharedProperties: sharedRules,
      applySharedProperties: true,
    };

    const res = generatePostgresInsertQuery(queryOpts);

    // Verify shared properties applied to output
    assertTrue(res.sql.includes("'tenant_shared_99'"), 'SQL contains shared constant tenant_shared_99');
    assertTrue(res.sql.includes("'sys_admin_user'"), 'SQL contains shared constant sys_admin_user');
    assertTrue(res.sql.includes('CURRENT_TIMESTAMP'), 'SQL contains shared expression CURRENT_TIMESTAMP');
    assertTrue(res.sql.includes("'PROD-1'"), 'SQL contains shared pool PROD-1');
    assertTrue(res.sql.includes("'PROD-2'"), 'SQL contains shared pool PROD-2');
    assertTrue(res.sql.includes('-- Shared Properties Inherited (4): tenant_id, created_by, created_at, environment'), 'Comment contains shared columns count and list');
    assertEqual(res.sharedPropertiesApplied?.length, 4, '4 shared properties recorded in result');

    // 4. Verify preview rows
    assertEqual(res.previewRows?.[0]['tenant_id'], 'tenant_shared_99', 'Row 0 tenant_id matches');
    assertEqual(res.previewRows?.[0]['created_by'], 'sys_admin_user', 'Row 0 created_by matches');
    assertEqual(res.previewRows?.[0]['environment'], 'PROD-1', 'Row 0 environment matches pool 0');
    assertEqual(res.previewRows?.[1]['environment'], 'PROD-2', 'Row 1 environment matches pool 1');

    // 5. Master disable toggle (applySharedProperties = false)
    const disabledOpts = {
      ...queryOpts,
      applySharedProperties: false,
    };
    const disabledRes = generatePostgresInsertQuery(disabledOpts);
    assertEqual(disabledRes.sharedPropertiesApplied?.length, 0, 'No shared properties applied when disabled');
    assertTrue(!disabledRes.sql.includes('-- Shared Properties Inherited'), 'No shared properties comment when disabled');
  });

  test('Database Insert Generator', 'Shared Properties Config Export & Import Roundtrip', () => {
    const configWithOptions = {
      tableName: 'enterprise_assets',
      schema: 'inventory',
      columns: [
        {
          id: 'col_1',
          name: 'asset_id',
          type: 'uuid' as const,
          nullable: false,
          hasDefault: true,
          isPrimaryKey: true,
          isUnique: true,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'uuid' as const,
        },
        {
          id: 'col_2',
          name: 'tenant_id',
          type: 'varchar' as const,
          maxLength: 50,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'company' as const,
        },
      ],
      rowCount: 5,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 50,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '*',
      wrapInTransaction: true,
      includeTypeCasts: false,
      includeComments: true,
      sharedProperties: {
        tenant_id: {
          id: 'sp_export_tenant',
          columnName: 'tenant_id',
          mode: 'constant' as const,
          constantValue: 'tenant_corp_alpha',
          active: true,
          description: 'Enterprise partition code',
          isCustom: true,
          matchCaseInsensitive: true,
        },
        audit_tag: {
          id: 'sp_export_tag',
          columnName: 'audit_tag',
          mode: 'expression' as const,
          expression: 'CURRENT_DATE',
          active: true,
          description: 'Audit tracking date',
          isCustom: true,
          matchCaseInsensitive: true,
        },
      },
      applySharedProperties: true,
    };

    // Export to JSON string
    const jsonStr = createDbInsertConfigExport(configWithOptions);
    assertTrue(jsonStr.includes('"tenant_corp_alpha"'), 'Export JSON includes shared constantValue');
    assertTrue(jsonStr.includes('"audit_tag"'), 'Export JSON includes shared audit_tag');
    assertTrue(jsonStr.includes('"applySharedProperties": true'), 'Export JSON includes applySharedProperties');

    // Parse and restore config
    const parseRes = validateAndParseDbInsertConfig(jsonStr);
    assertTrue(parseRes.success, 'Configuration parsed successfully');
    assertTrue(Boolean(parseRes.options?.sharedProperties), 'Restored sharedProperties dictionary');
    assertEqual(
      parseRes.options?.sharedProperties?.['tenant_id']?.constantValue,
      'tenant_corp_alpha',
      'Restored tenant_id constant value'
    );
    assertEqual(
      parseRes.options?.sharedProperties?.['audit_tag']?.expression,
      'CURRENT_DATE',
      'Restored audit_tag expression'
    );
    assertEqual(parseRes.options?.applySharedProperties, true, 'Restored applySharedProperties boolean flag');
  });

  test('Database Insert Generator', 'Custom Grid Overrides Precedence over Shared Properties', () => {
    const optsWithCustomGrid = {
      tableName: 'devices',
      schema: 'public',
      columns: [
        {
          id: 'col_tenant',
          name: 'tenant_id',
          type: 'varchar' as const,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator' as const,
          fixedValue: '',
          valuePool: [],
          generatorType: 'company' as const,
        },
      ],
      rowCount: 3,
      insertStrategy: 'bulk_single_statement' as const,
      batchSize: 100,
      conflictStrategy: 'none' as const,
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: false,
      sharedProperties: {
        tenant_id: {
          id: 'sp_dev_tenant',
          columnName: 'tenant_id',
          mode: 'constant' as const,
          constantValue: 'shared_default_tenant',
          active: true,
        },
      },
      applySharedProperties: true,
      customGridRows: [
        { tenant_id: 'OVERRIDDEN_IN_GRID_ROW_0' },
        // Row 1 will use shared property
        {},
        { tenant_id: 'OVERRIDDEN_IN_GRID_ROW_2' },
      ],
    };

    const res = generatePostgresInsertQuery(optsWithCustomGrid);
    assertEqual(res.previewRows?.[0]['tenant_id'], 'OVERRIDDEN_IN_GRID_ROW_0', 'Row 0 cell overrides shared property');
    assertEqual(res.previewRows?.[1]['tenant_id'], 'shared_default_tenant', 'Row 1 inherits shared property');
    assertEqual(res.previewRows?.[2]['tenant_id'], 'OVERRIDDEN_IN_GRID_ROW_2', 'Row 2 cell overrides shared property');
  });

  // =========================================================================
  // JSON EDITOR TOOL UNIT TESTS
  // =========================================================================
  test('JSON Editor', 'Syntax Parsing & Error Detection', () => {
    // Valid JSON
    const valid = parseJsonSafe('{"name": "DevHub", "active": true, "version": 2}');
    assertEqual(valid.error, null, 'Valid JSON parsed without error');
    assertEqual(valid.data.name, 'DevHub', 'Parsed data name is correct');

    // Invalid JSON with syntax error
    const invalid = parseJsonSafe('{\n  "unclosed": "string\n}');
    assertTrue(invalid.error !== null, 'Invalid JSON returns error');
    assertTrue(invalid.line !== undefined, 'Line number is detected for syntax error');
  });

  test('JSON Editor', 'Auto-Repair Common Syntax Mistakes', () => {
    // 1. Single quotes, unquoted keys, trailing commas, python booleans & comments
    const broken = `{\n  // User config\n  username: 'alex_dev',\n  isActive: True,\n  items: [1, 2, 3,],\n  score: 98.5,\n}`;
    const repair = tryFixCommonJsonErrors(broken);
    assertTrue(repair.modified, 'Syntax mistakes repaired');
    assertTrue(repair.fixes.length > 0, 'Fixes list populated');

    const parsed = parseJsonSafe(repair.fixed);
    assertEqual(parsed.error, null, 'Repaired JSON parses into valid JSON');
    assertEqual(parsed.data.username, 'alex_dev', 'Repaired string value matches');
    assertEqual(parsed.data.isActive, true, 'Python True repaired to boolean true');
    assertEqual(parsed.data.items.length, 3, 'Trailing comma removed from array');
  });

  test('JSON Editor', 'Search and Replace Engine', () => {
    const sample = {
      title: 'DevHub Platform',
      metadata: {
        author: 'DevHub Team',
        env: 'production',
        servers: ['devhub-prod-1', 'devhub-prod-2'],
      },
      counts: {
        devhub_users: 1500,
      },
    };

    // Count matches case-insensitive
    const count = countMatches(sample, 'DevHub', {
      caseSensitive: false,
      wholeWord: false,
      useRegex: false,
      inKeys: true,
      inValues: true,
    });
    assertEqual(count, 5, 'Found 5 matches for "DevHub" across keys and values');

    // Replace all occurrences in keys and values
    const { result, replaceCount } = searchAndReplaceJson(
      sample,
      'DevHub',
      'AppCore',
      {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        inKeys: true,
        inValues: true,
      }
    );

    assertEqual(replaceCount, 5, '5 replacements executed');
    assertEqual(result.title, 'AppCore Platform', 'String value replaced');
    assertEqual(result.metadata.author, 'AppCore Team', 'Nested string value replaced');
    assertTrue('appcore_users' in result.counts, 'Object key was also replaced');
  });

  test('JSON Editor', 'Tree Operations (Update, Rename, Delete, Insert, Duplicate)', () => {
    const base = {
      name: 'Alice',
      roles: ['admin', 'developer'],
      profile: {
        age: 30,
        city: 'Seattle',
      },
    };

    // 1. Update node at path
    const updated = updateNodeAtPath(base, ['profile', 'city'], 'San Francisco');
    assertEqual(updated.profile.city, 'San Francisco', 'Updated city at path');
    assertEqual(base.profile.city, 'Seattle', 'Original object remained immutable');

    // 2. Rename key at path
    const renamed = renameKeyAtPath(updated, ['profile'], 'city', 'location');
    assertEqual(renamed.profile.location, 'San Francisco', 'Renamed key city to location');
    assertEqual(renamed.profile.city, undefined, 'Old key was removed');

    // 3. Insert child into array
    const insertedArray = insertChildAtPath(renamed, ['roles'], 2, 'maintainer');
    assertEqual(insertedArray.roles.length, 3, 'Array has 3 items after insert');
    assertEqual(insertedArray.roles[2], 'maintainer', 'New item appended to array');

    // 4. Duplicate node
    const duplicated = duplicateNodeAtPath(insertedArray, ['roles', 0]);
    assertEqual(duplicated.roles.length, 4, 'Array item duplicated');
    assertEqual(duplicated.roles[1], 'admin', 'Duplicated item is adjacent');

    // 5. Delete node
    const deleted = deleteNodeAtPath(duplicated, ['profile', 'age']);
    assertEqual(deleted.profile.age, undefined, 'Deleted profile.age');
  });

  test('JSON Editor', 'Sorting, Flattening & Conversions', () => {
    // 1. Sort Keys
    const unsorted = { z: 1, a: 2, m: { y: 10, b: 20 } };
    const sorted = sortJsonKeys(unsorted, 'asc', true);
    assertEqual(Object.keys(sorted).join(','), 'a,m,z', 'Top level keys sorted alphabetically');
    assertEqual(Object.keys(sorted.m).join(','), 'b,y', 'Nested object keys sorted alphabetically');

    // 2. Flatten and Unflatten
    const deep = { user: { name: 'Bob', address: { zip: 98101 } } };
    const flattened = flattenJson(deep);
    assertEqual(flattened['user.address.zip'], 98101, 'Flattened to dot-notation');
    const unflattened = unflattenJson(flattened);
    assertEqual(unflattened.user.address.zip, 98101, 'Unflattened back to deep structure');

    // 3. JSON to CSV and CSV to JSON
    const tableData = [
      { id: 1, name: 'Task A', completed: true },
      { id: 2, name: 'Task B', completed: false },
    ];
    const csv = jsonToCsv(tableData);
    assertTrue(csv.includes('"id","name","completed"'), 'CSV contains header row');
    const backToJson = csvToJson(csv);
    assertEqual(backToJson.length, 2, 'CSV converted back to 2 rows');
    assertEqual(backToJson[0].name, 'Task A', 'Row 0 name matches');

    // 4. JSON to YAML
    const yaml = jsonToYaml({ server: { port: 8080, host: 'localhost' } });
    assertTrue(yaml.includes('port: 8080'), 'YAML contains port');
    const yamlParsed = yamlToJson(yaml);
    assertEqual(yamlParsed.server.port, 8080, 'YAML parsed back to JSON object');

    // 5. TypeScript generation
    const tsCode = generateTypeScriptTypes({ id: 'usr_1', count: 42, active: true }, 'User');
    assertTrue(tsCode.includes('export interface User'), 'TypeScript interface generated');
    assertTrue(tsCode.includes('id: string;'), 'TypeScript field id typed as string');
    assertTrue(tsCode.includes('count: number;'), 'TypeScript field count typed as number');

    // 6. JSON Query with expression
    const queryData = {
      users: [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 32 },
        { name: 'Dave', age: 19 },
      ],
    };
    const queryResult = queryJsonWithExpression(queryData, 'data.users.filter(u => u.age > 20).map(u => u.name)');
    assertEqual(queryResult.error, null, 'Query executed successfully');
    assertEqual(queryResult.result.length, 2, 'Query returned 2 users over 20');
    assertEqual(queryResult.result[0], 'John', 'First result is John');

    // 7. Calculate stats
    const stats = calculateJsonStats(queryData, JSON.stringify(queryData, null, 2));
    assertTrue(stats.nodeCount > 5, 'Stats counted nodes');
    assertEqual(stats.maxDepth, 4, 'Max depth calculated');
  });

  // =========================================================================
  // CSV AUTO POPULATOR UNIT TESTS
  // =========================================================================
  test('CSV Auto Populator', 'Header Parsing & Rule Inference', () => {
    // 1. Header parsing with mixed delimiters and quotes
    const headers = parseHeadersInput('id, "first_name", last_name, email, salary, status, hire_date');
    assertEqual(headers.length, 7, 'Parsed 7 headers');
    assertEqual(headers[0], 'id', 'Header 0 is id');
    assertEqual(headers[1], 'first_name', 'Header 1 unquoted is first_name');

    // 2. Tab delimiter parsing
    const tabHeaders = parseHeadersInput('sku\tproduct_name\tcost_price\tstock_qty', '\t');
    assertEqual(tabHeaders.length, 4, 'Parsed 4 tab headers');

    // 3. Rule inference
    const idRule = inferColumnRule('user_id', 0);
    assertEqual(idRule.generatorType, 'sequence', 'Inferred sequence for user_id');
    assertTrue(Boolean(idRule.unique), 'Enforced unique for ID');

    const emailRule = inferColumnRule('corporate_email', 1);
    assertEqual(emailRule.generatorType, 'email', 'Inferred email generator');

    const salaryRule = inferColumnRule('annual_salary', 2);
    assertEqual(salaryRule.generatorType, 'decimal_range', 'Inferred decimal range for salary');

    const statusRule = inferColumnRule('account_status', 3);
    assertEqual(statusRule.generatorType, 'pick_list', 'Inferred pick list for status');

    const skuRule = inferColumnRule('item_sku', 4);
    assertEqual(skuRule.generatorType, 'pattern', 'Inferred pattern mask for sku');
  });

  test('CSV Auto Populator', 'Dataset Generation & Custom Rules', () => {
    const datasetOpts = {
      rowCount: 5,
      delimiter: ',' as const,
      quoteChar: '"' as const,
      quoteMode: 'needed' as const,
      lineEnding: '\n' as const,
      includeHeader: true,
      columns: [
        { id: 'c1', header: 'seq_id', generatorType: 'sequence' as const, startNumber: 100, stepNumber: 10 },
        { id: 'c2', header: 'sku', generatorType: 'pattern' as const, patternTemplate: 'ITEM-###', unique: true },
        { id: 'c3', header: 'score', generatorType: 'integer_range' as const, min: 80, max: 99 },
        { id: 'c4', header: 'rating_pct', generatorType: 'percentage' as const, min: 50, max: 95, decimals: 1 },
        { id: 'c5', header: 'full_name', generatorType: 'full_name' as const },
        { id: 'c6', header: 'formula_code', generatorType: 'formula' as const, formulaExpr: '`CODE_${row.seq_id}`' },
      ],
    };

    const dataset = generateCsvDataset(datasetOpts);
    assertEqual(dataset.rows.length, 5, 'Generated 5 rows');
    assertEqual(dataset.rows[0].seq_id, 100, 'First sequence is 100');
    assertEqual(dataset.rows[1].seq_id, 110, 'Second sequence is 110');
    assertTrue(dataset.rows[0].sku.startsWith('ITEM-'), 'Pattern template starts with ITEM-');
    assertTrue(dataset.rows[0].score >= 80 && dataset.rows[0].score <= 99, 'Integer range within [80, 99]');
    assertEqual(dataset.rows[0].formula_code, 'CODE_100', 'Formula computed CODE_100 using row.seq_id');

    // Header line check
    const lines = dataset.csv.split('\n');
    assertEqual(lines.length, 6, 'CSV contains header + 5 rows');
    assertTrue(lines[0].includes('seq_id,sku,score,rating_pct,full_name,formula_code'), 'Header row matches columns');
  });

  test('CSV Auto Populator', 'Resultant Grid Editing & Overrides', () => {
    const opts = {
      rowCount: 3,
      delimiter: ',' as const,
      quoteChar: '"' as const,
      quoteMode: 'needed' as const,
      lineEnding: '\n' as const,
      includeHeader: true,
      columns: [
        { id: 'c1', header: 'code', generatorType: 'fixed' as const, fixedText: 'GEN' },
        { id: 'c2', header: 'val', generatorType: 'integer_range' as const, min: 1, max: 10 },
      ],
      customGridRows: [
        { code: 'MANUAL_EDIT_A', val: 999 },
      ],
    };

    const dataset = generateCsvDataset(opts);
    assertEqual(dataset.rows[0].code, 'MANUAL_EDIT_A', 'Row 0 code overridden by grid edit');
    assertEqual(dataset.rows[0].val, 999, 'Row 0 val overridden by grid edit');
    assertEqual(dataset.rows[1].code, 'GEN', 'Row 1 code retains generated default');
    assertTrue(dataset.csv.includes('MANUAL_EDIT_A,999'), 'CSV output reflects manual grid edit');
  });

  test('CSV Auto Populator', 'Configuration Import & Export and SQL Conversion', () => {
    const configToExport = {
      ...CSV_POPULATOR_PRESETS[0].options,
      rowCount: 12,
    };

    // 1. Export configuration
    const exported = exportCsvPopulatorConfig(configToExport);
    assertTrue(exported.includes('"tool": "csv-auto-populator"'), 'Exported JSON includes tool tag');
    assertTrue(exported.includes('"rowCount": 12'), 'Exported JSON includes rowCount');

    // 2. Validate and Parse configuration
    const { config, error } = validateAndParseCsvPopulatorConfig(exported);
    assertEqual(error, null, 'Config imported without error');
    assertTrue(config !== null, 'Config is not null');
    assertEqual(config?.rowCount, 12, 'Imported rowCount matches');
    assertEqual(config?.columns.length, configToExport.columns.length, 'Imported columns count matches');

    // 3. SQL Insert generation
    const sampleRows = [
      { id: 101, title: 'Item O\'Connor', active: true, price: 49.99 },
    ];
    const sql = csvToSqlInsert('products', sampleRows, ['id', 'title', 'active', 'price']);
    assertTrue(sql.includes('INSERT INTO "products"'), 'Contains INSERT INTO "products"');
    assertTrue(sql.includes("'Item O''Connor'"), 'Escapes single quotes into SQL literal');
    assertTrue(sql.includes('TRUE'), 'Formats boolean as TRUE');
    assertTrue(sql.includes('49.99'), 'Formats numeric price');
  });

  // --- Suite: Database Row Copy Tool ---
  test('Database Row Copy Tool', 'CREATE TABLE DDL Schema Parsing', () => {
    const ddl = `
      CREATE TABLE sales.orders (
        order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id BIGINT NOT NULL,
        order_code VARCHAR(64) NOT NULL,
        total_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(24) DEFAULT 'PENDING',
        is_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const parsed = parseCreateTableDdl(ddl);
    assertEqual(parsed.tableName, 'orders', 'Parsed table name');
    assertEqual(parsed.schemaName, 'sales', 'Parsed schema name');
    assertEqual(parsed.columns.length, 7, 'Parsed 7 columns');

    const orderIdCol = parsed.columns.find((c) => c.name === 'order_id');
    assertTrue(Boolean(orderIdCol?.isPrimaryKey), 'order_id is detected as primary key');
    assertEqual(orderIdCol?.type, 'UUID', 'order_id type is UUID');

    const totalAmountCol = parsed.columns.find((c) => c.name === 'total_amount');
    assertEqual(totalAmountCol?.type, 'NUMERIC', 'total_amount type is NUMERIC');

    const statusCol = parsed.columns.find((c) => c.name === 'status');
    assertEqual(statusCol?.defaultValue, "'PENDING'", 'status default value parsed');
  });

  test('Database Row Copy Tool', 'Default ID and Overridden Lookup Column', () => {
    const preset = DB_ROW_COPY_PRESETS[0]; // orders table with order_id PK

    // 1. Default ID lookup
    const defaultRes = generateRowCopySql({
      ...preset,
      lookupColumn: 'order_id',
      lookupValue: 'e89b21f3-4a11-477c-a0e2-76bf38d99042',
      lookupOperator: '=',
    });
    assertTrue(defaultRes.sql.includes("WHERE order_id = 'e89b21f3-4a11-477c-a0e2-76bf38d99042'"), 'Default ID lookup generates exact WHERE clause');

    // 2. Overridden lookup column to another column (order_code)
    const customLookupRes = generateRowCopySql({
      ...preset,
      lookupColumn: 'order_code',
      lookupValue: 'ORD-2026-9041',
      lookupOperator: '=',
    });
    assertTrue(customLookupRes.sql.includes("WHERE order_code = 'ORD-2026-9041'"), 'Overridden lookup column generates WHERE on custom column');

    // 3. Batch lookup with IN operator
    const batchRes = generateRowCopySql({
      ...preset,
      lookupColumn: 'customer_id',
      lookupValue: '99482, 99483, 99484',
      lookupOperator: 'IN',
    });
    assertTrue(batchRes.sql.includes('WHERE customer_id IN (99482, 99483, 99484)'), 'Numeric batch IN operator formats unquoted integer list');
  });

  test('Database Row Copy Tool', 'Column Overrides Across Constant, Expression, Suffix & Exclude Modes', () => {
    const config: DbRowCopyConfig = {
      id: 'test_copy',
      name: 'User Clone Test',
      tableName: 'users',
      schemaName: 'public',
      columns: [
        { id: '1', name: 'id', type: 'UUID', isPrimaryKey: true, isNullable: false },
        { id: '2', name: 'username', type: 'VARCHAR', isPrimaryKey: false, isNullable: false },
        { id: '3', name: 'email', type: 'VARCHAR', isPrimaryKey: false, isNullable: false },
        { id: '4', name: 'status', type: 'VARCHAR', isPrimaryKey: false, isNullable: false },
        { id: '5', name: 'role', type: 'VARCHAR', isPrimaryKey: false, isNullable: false },
        { id: '6', name: 'login_count', type: 'INTEGER', isPrimaryKey: false, isNullable: false },
        { id: '7', name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isNullable: false },
      ],
      lookupColumn: 'id',
      lookupValue: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      lookupOperator: '=',
      overrides: {
        id: { columnName: 'id', mode: 'mock_random', randomType: 'uuid', active: true },
        username: { columnName: 'username', mode: 'prefix_suffix', suffix: '_CLONE', active: true },
        email: { columnName: 'email', mode: 'prefix_suffix', prefix: 'clone_', suffix: '.org', active: true },
        status: { columnName: 'status', mode: 'constant', constantValue: 'DRAFT', active: true },
        login_count: { columnName: 'login_count', mode: 'constant', constantValue: '0', active: true },
        created_at: { columnName: 'created_at', mode: 'expression', expression: 'CURRENT_TIMESTAMP', active: true },
        // role is intentionally not in overrides -> copied verbatim
      },
      options: {
        dialect: 'postgres',
        useTransaction: true,
        rollbackOnly: false,
        includeReturning: true,
        returningColumns: '*',
        copyCount: 1,
        strategy: 'insert_select',
        generatePythonScript: false,
      },
    };

    const res = generateRowCopySql(config);
    assertTrue(res.sql.includes('gen_random_uuid()'), 'UUID override generated');
    assertTrue(res.sql.includes("username || '_CLONE'"), 'Username suffix concatenation generated');
    assertTrue(res.sql.includes("'clone_' || email || '.org'"), 'Email prefix & suffix concatenation generated');
    assertTrue(res.sql.includes("'DRAFT'"), 'Constant status generated');
    assertTrue(res.sql.includes('0'), 'Constant numeric login_count generated');
    assertTrue(res.sql.includes('CURRENT_TIMESTAMP'), 'Expression CURRENT_TIMESTAMP generated');
    assertTrue(res.sql.includes('role'), 'Verbatim role column preserved');
    assertTrue(res.sql.includes('RETURNING *;'), 'RETURNING clause included');
    assertEqual(res.copySummary.overridden, 6, '6 columns overridden');
    assertEqual(res.copySummary.copiedVerbatim, 1, '1 column copied verbatim (role)');
  });

  test('Database Row Copy Tool', 'Multi-Dialect Output (Postgres, MySQL, SQL Server)', () => {
    const baseConfig = DB_ROW_COPY_PRESETS[3]; // products catalog item with SKU, title, unit_price

    // 1. PostgreSQL dialect
    const pgRes = generateRowCopySql({
      ...baseConfig,
      options: { ...baseConfig.options, dialect: 'postgres' },
    });
    assertTrue(pgRes.sql.includes("sku || '-V2'"), 'PostgreSQL uses || string concatenation');

    // 2. MySQL dialect
    const mysqlRes = generateRowCopySql({
      ...baseConfig,
      options: { ...baseConfig.options, dialect: 'mysql' },
    });
    assertTrue(mysqlRes.sql.includes("CONCAT(`sku`, '-V2')") || mysqlRes.sql.includes("CONCAT(sku, '-V2')"), 'MySQL uses CONCAT() string concatenation');

    // 3. SQL Server dialect
    const sqlServerRes = generateRowCopySql({
      ...baseConfig,
      options: { ...baseConfig.options, dialect: 'sqlserver', useTransaction: true },
    });
    assertTrue(sqlServerRes.sql.includes("[sku] + '-V2'") || sqlServerRes.sql.includes("sku + '-V2'"), 'SQL Server uses + string concatenation');
    assertTrue(sqlServerRes.sql.includes('BEGIN TRANSACTION;'), 'SQL Server uses BEGIN TRANSACTION;');
  });

  test('Database Row Copy Tool', 'Live Row Simulation and Value Differencing', () => {
    const preset = DB_ROW_COPY_PRESETS[1]; // user_accounts preset
    const sampleSource = preset.sampleSourceRow!;

    const { clonedRow, diffs } = simulateRowCopy(preset, sampleSource);

    // Email has prefix 'clone_' and suffix '.sandbox'
    assertEqual(clonedRow.email, 'clone_alice.smith@enterprise.com.sandbox', 'Simulated email prefix and suffix');
    assertEqual(diffs.email.status, 'overridden', 'Email diff status is overridden');

    // Full name has suffix ' (Staging Copy)'
    assertEqual(clonedRow.full_name, 'Alice Smith (Staging Copy)', 'Simulated full_name suffix');

    // Role is not in overrides -> copied verbatim
    assertEqual(clonedRow.role, sampleSource.role, 'Role is copied verbatim');
    assertEqual(diffs.role.status, 'identical', 'Role diff status is identical');

    // is_active is constant 'false'
    assertEqual(clonedRow.is_active, 'false', 'is_active set to false');
  });

  test('Database Row Copy Tool', 'JSON Configuration Import & Export Presets', () => {
    const preset = DB_ROW_COPY_PRESETS[0];

    // Serialization
    const serialized = JSON.stringify(preset, null, 2);
    assertTrue(serialized.includes('"tableName": "orders"'), 'Serialized JSON contains tableName');
    assertTrue(serialized.includes('"lookupColumn": "order_id"'), 'Serialized JSON contains lookupColumn');

    // Deserialization
    const parsed: DbRowCopyConfig = JSON.parse(serialized);
    assertEqual(parsed.tableName, preset.tableName, 'Deserialized tableName matches');
    assertEqual(parsed.columns.length, preset.columns.length, 'Columns length matches');
    assertEqual(parsed.lookupValue, preset.lookupValue, 'Lookup value matches');
    assertEqual(Object.keys(parsed.overrides).length, Object.keys(preset.overrides).length, 'Overrides count matches');
  });

  test('Database Row Copy Tool', 'PostgreSQL GENERATED BY DEFAULT AS IDENTITY & DDL Parsing', () => {
    const ddl = `
      CREATE TABLE finance.ledger_accounts (
        id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        account_number varchar(64) NOT NULL,
        customer_id bigint NOT NULL,
        balance numeric(14,2) NOT NULL,
        status varchar(30) DEFAULT 'ACTIVE'
      );
    `;

    const parsed = parseCreateTableDdl(ddl);
    assertEqual(parsed.tableName, 'ledger_accounts', 'Table name parsed');
    assertEqual(parsed.columns.length, 5, '5 columns parsed');

    const idCol = parsed.columns.find((c) => c.name === 'id');
    assertTrue(Boolean(idCol?.isIdentity), 'id column is marked as identity');
    assertEqual(idCol?.identityType, 'by_default', 'id identityType is by_default');
    assertEqual(idCol?.identityDefinition, 'GENERATED BY DEFAULT AS IDENTITY', 'identityDefinition matches');
    assertEqual(idCol?.type, 'BIGINT', 'id type is BIGINT');
    assertTrue(Boolean(idCol?.isPrimaryKey), 'id is primary key');
    assertEqual(idCol?.isNullable, false, 'id is NOT NULL');
    assertEqual(idCol?.defaultValue, undefined, 'defaultValue is not corrupted with "AS IDENTITY"');

    // 1. Standard Row Copy (Default: Auto-exclude identity so Postgres assigns fresh sequence value)
    const copySqlRes = generateRowCopySql({
      id: 'test_identity_copy',
      name: 'Identity Test',
      tableName: parsed.tableName,
      schemaName: 'finance',
      columns: parsed.columns,
      lookupColumn: 'id',
      lookupValue: '10042',
      lookupOperator: '=',
      overrides: {
        account_number: { columnName: 'account_number', mode: 'prefix_suffix', suffix: '-COPY', active: true },
      },
      options: {
        dialect: 'postgres',
        useTransaction: true,
        rollbackOnly: false,
        includeReturning: true,
        returningColumns: '*',
        copyCount: 1,
        strategy: 'insert_select',
        generatePythonScript: false,
      },
    });

    assertTrue(copySqlRes.copySummary.excludedColumns.includes('id'), 'id is in excludedColumns');
    assertTrue(!copySqlRes.copySummary.insertedColumns.includes('id'), 'id is NOT in insertedColumns');
    assertTrue(copySqlRes.sql.includes('account_number || \'-COPY\''), 'account_number override applied');
    assertTrue(copySqlRes.sql.includes('GENERATED BY DEFAULT AS IDENTITY'), 'SQL comments document identity handling');

    // 2. PostgreSQL OVERRIDING SYSTEM VALUE
    const systemValRes = generateRowCopySql({
      id: 'test_system_value',
      name: 'System Value Test',
      tableName: parsed.tableName,
      schemaName: 'finance',
      columns: parsed.columns,
      lookupColumn: 'id',
      lookupValue: '10042',
      lookupOperator: '=',
      overrides: {
        id: { columnName: 'id', mode: 'constant', constantValue: '99999', active: true },
      },
      options: {
        dialect: 'postgres',
        useTransaction: true,
        rollbackOnly: false,
        includeReturning: true,
        returningColumns: '*',
        copyCount: 1,
        strategy: 'insert_select',
        generatePythonScript: false,
        identityStrategy: 'overriding_system_value',
      },
    });

    assertTrue(systemValRes.sql.includes('OVERRIDING SYSTEM VALUE'), 'OVERRIDING SYSTEM VALUE clause included');
    assertTrue(systemValRes.sql.includes('99999'), 'Explicit constant id 99999 included in select');

    // 3. PostgreSQL OVERRIDING USER VALUE
    const userValRes = generateRowCopySql({
      id: 'test_user_value',
      name: 'User Value Test',
      tableName: parsed.tableName,
      schemaName: 'finance',
      columns: parsed.columns,
      lookupColumn: 'id',
      lookupValue: '10042',
      lookupOperator: '=',
      overrides: {
        id: { columnName: 'id', mode: 'constant', constantValue: '88888', active: true },
      },
      options: {
        dialect: 'postgres',
        useTransaction: true,
        rollbackOnly: false,
        includeReturning: true,
        returningColumns: '*',
        copyCount: 1,
        strategy: 'insert_select',
        generatePythonScript: false,
        identityStrategy: 'overriding_user_value',
      },
    });

    assertTrue(userValRes.sql.includes('OVERRIDING USER VALUE'), 'OVERRIDING USER VALUE clause included');
  });

  test('Database Row Copy Tool', 'Multi-Engine Identity Handling (MySQL AUTO_INCREMENT, SQL Server IDENTITY, SQLite)', () => {
    // 1. MySQL AUTO_INCREMENT
    const mysqlDdl = 'CREATE TABLE products (id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY, title varchar(100) NOT NULL);';
    const mysqlParsed = parseCreateTableDdl(mysqlDdl);
    const mysqlCol = mysqlParsed.columns.find((c) => c.name === 'id');
    assertEqual(mysqlCol?.identityType, 'auto_increment', 'MySQL auto_increment detected');

    const mysqlSql = generateRowCopySql({
      id: 'mysql_test',
      name: 'MySQL Test',
      tableName: 'products',
      columns: mysqlParsed.columns,
      lookupColumn: 'id',
      lookupValue: '5',
      lookupOperator: '=',
      overrides: {
        title: { columnName: 'title', mode: 'prefix_suffix', suffix: '_COPY', active: true },
      },
      options: {
        dialect: 'mysql',
        useTransaction: false,
        rollbackOnly: false,
        includeReturning: false,
        copyCount: 1,
        strategy: 'insert_select',
        generatePythonScript: false,
      },
    });
    assertTrue(!mysqlSql.copySummary.insertedColumns.includes('`id`'), 'MySQL auto_increment column omitted from INSERT');

    // 2. SQL Server IDENTITY
    const sqlServerDdl = 'CREATE TABLE users (id int identity(1,1) not null primary key, username varchar(50) not null);';
    const sqlServerParsed = parseCreateTableDdl(sqlServerDdl);
    const sqlServerCol = sqlServerParsed.columns.find((c) => c.name === 'id');
    assertEqual(sqlServerCol?.identityType, 'identity', 'SQL Server identity detected');

    // SQL Server with explicit ID override should automatically wrap in SET IDENTITY_INSERT
    const sqlServerSql = generateRowCopySql({
      id: 'sqlserver_test',
      name: 'SQL Server Test',
      tableName: 'users',
      columns: sqlServerParsed.columns,
      lookupColumn: 'id',
      lookupValue: '10',
      lookupOperator: '=',
      overrides: {
        id: { columnName: 'id', mode: 'constant', constantValue: '9999', active: true },
      },
      options: {
        dialect: 'sqlserver',
        useTransaction: true,
        rollbackOnly: false,
        includeReturning: false,
        copyCount: 1,
        strategy: 'insert_select',
        generatePythonScript: false,
      },
    });
    assertTrue(sqlServerSql.sql.includes('SET IDENTITY_INSERT [users] ON;'), 'SET IDENTITY_INSERT ON generated');
    assertTrue(sqlServerSql.sql.includes('SET IDENTITY_INSERT [users] OFF;'), 'SET IDENTITY_INSERT OFF generated');
  });

  test('Database Row Copy Tool', 'General Shared Properties Reusability, Precedence & Matching', () => {
    const config: DbRowCopyConfig = {
      id: 'shared_prop_test',
      name: 'Shared Properties Test',
      tableName: 'tenants_data',
      columns: [
        { id: '1', name: 'id', type: 'BIGINT', isPrimaryKey: true, isNullable: false },
        { id: '2', name: 'tenant_id', type: 'VARCHAR', isPrimaryKey: false, isNullable: false },
        { id: '3', name: 'status', type: 'VARCHAR', isPrimaryKey: false, isNullable: false },
        { id: '4', name: 'created_by', type: 'VARCHAR', isPrimaryKey: false, isNullable: false },
        { id: '5', name: 'notes', type: 'TEXT', isPrimaryKey: false, isNullable: true },
      ],
      lookupColumn: 'id',
      lookupValue: '101',
      lookupOperator: '=',
      // Table-specific explicit overrides (status is explicitly overridden)
      overrides: {
        status: { columnName: 'status', mode: 'constant', constantValue: 'SPECIAL_OVERRIDE', active: true },
      },
      // Shared generic properties configured in separate tab
      sharedProperties: {
        tenant_id: {
          id: 'sp_tenant',
          columnName: 'tenant_id',
          mode: 'constant',
          constantValue: 'SHARED_TENANT_99',
          active: true,
          isCustom: true,
        },
        status: {
          id: 'sp_status',
          columnName: 'status',
          mode: 'constant',
          constantValue: 'GENERIC_DRAFT',
          active: true,
          isCustom: false,
        },
        created_by: {
          id: 'sp_created_by',
          columnName: 'CREATED_BY', // Test case-insensitivity
          mode: 'constant',
          constantValue: 'shared_clone_service',
          active: true,
          isCustom: true,
          matchCaseInsensitive: true,
        },
        // Custom property not in this table
        organization_code: {
          id: 'sp_org',
          columnName: 'organization_code',
          mode: 'constant',
          constantValue: 'CORP_HQ',
          active: true,
          isCustom: true,
        },
      },
      options: {
        dialect: 'postgres',
        useTransaction: false,
        rollbackOnly: false,
        includeReturning: false,
        copyCount: 1,
        strategy: 'insert_select',
        generatePythonScript: false,
        applySharedProperties: true,
      },
    };

    // 1. Generate SQL with Shared Properties enabled
    const res = generateRowCopySql(config);

    // tenant_id should use shared property value
    assertTrue(res.sql.includes("'SHARED_TENANT_99'"), 'tenant_id matches shared property value');

    // created_by should use shared property value via case-insensitive match
    assertTrue(res.sql.includes("'shared_clone_service'"), 'created_by matches shared property case-insensitively');

    // status should use table-specific override (SPECIAL_OVERRIDE), NOT generic draft
    assertTrue(res.sql.includes("'SPECIAL_OVERRIDE'"), 'Table explicit override takes precedence over shared property');
    assertTrue(!res.sql.includes("'GENERIC_DRAFT'"), 'Generic status was overridden by table-specific override');

    // notes is neither in table overrides nor shared properties -> copied verbatim
    assertTrue(res.sql.includes('notes'), 'notes is copied verbatim');

    // Check summary metrics
    assertEqual(res.copySummary.sharedApplied, 2, '2 columns applied from shared generic properties (tenant_id, created_by)');
    assertEqual(res.copySummary.overridden, 3, 'Total 3 overridden (1 explicit + 2 shared)');

    // 2. Test disabling applySharedProperties
    const disabledRes = generateRowCopySql({
      ...config,
      options: { ...config.options, applySharedProperties: false },
    });
    assertTrue(!disabledRes.sql.includes("'SHARED_TENANT_99'"), 'Shared property not applied when applySharedProperties is false');
    assertEqual(disabledRes.copySummary.sharedApplied, 0, '0 columns from shared properties when disabled');
  });

  test('Database Row Copy Tool', 'General Shared Properties Live Diff Simulation & JSON Export/Import', () => {
    const config = DB_ROW_COPY_PRESETS[0]; // orders preset with sharedProperties
    assertTrue(Boolean(config.sharedProperties), 'orders preset has sharedProperties configured');

    const sample = config.sampleSourceRow!;
    const { clonedRow, diffs } = simulateRowCopy(config, sample);

    // In orders preset, tenant_id is in sharedProperties
    if (diffs.tenant_id) {
      assertTrue(diffs.tenant_id.isShared === true, 'tenant_id is marked as isShared: true in simulation diffs');
    }

    // JSON Export / Import round-trip preserves sharedProperties
    const serialized = JSON.stringify(config, null, 2);
    assertTrue(serialized.includes('"sharedProperties"'), 'Serialized JSON contains sharedProperties');

    const deserialized: DbRowCopyConfig = JSON.parse(serialized);
    assertTrue(Boolean(deserialized.sharedProperties), 'Deserialized config has sharedProperties');
    assertEqual(
      Object.keys(deserialized.sharedProperties || {}).length,
      Object.keys(config.sharedProperties || {}).length,
      'Shared properties count preserved across export/import'
    );
  });

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  return {
    total: results.length,
    passed,
    failed,
    durationMs,
    results,
  };
}
