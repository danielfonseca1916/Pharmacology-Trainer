import { createLogger } from "@/lib/server-logger";

export class DatasetError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DatasetError";
  }
}

export const DatasetErrorCodes = {
  LOAD_FAILED: "DATASET_LOAD_FAILED",
  VALIDATION_FAILED: "DATASET_VALIDATION_FAILED",
  PARSE_FAILED: "DATASET_PARSE_FAILED",
  FILE_NOT_FOUND: "DATASET_FILE_NOT_FOUND",
  INVALID_FORMAT: "DATASET_INVALID_FORMAT",
  DATABASE_ERROR: "DATASET_DATABASE_ERROR",
  UNKNOWN: "DATASET_UNKNOWN_ERROR",
} as const;

interface DatasetLoadOptions {
  fallbackData?: unknown;
  throwOnError?: boolean;
  timeout?: number;
}

/**
 * Safely load dataset with error handling and logging
 */
export async function loadDatasetSafely<T>(
  loader: () => Promise<T>,
  options: DatasetLoadOptions = {}
): Promise<{ data: T | null; error: DatasetError | null }> {
  const logger = createLogger("DatasetLoader");
  const startTime = Date.now();
  const { fallbackData = null, throwOnError = false, timeout = 30000 } = options;

  try {
    // Create a promise that rejects on timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Dataset load timeout")), timeout)
    );

    const data = await Promise.race([loader(), timeoutPromise]);
    const duration = Date.now() - startTime;

    logger.logTiming("Dataset loaded", duration, true);
    return { data, error: null };
  } catch (err) {
    const duration = Date.now() - startTime;
    const error = err instanceof Error ? err : new Error(String(err));

    const datasetError = new DatasetError(
      `Failed to load dataset: ${error.message}`,
      DatasetErrorCodes.LOAD_FAILED,
      500,
      { originalError: error.message }
    );

    logger.errorWithTiming("Dataset load failed", startTime, datasetError);

    if (throwOnError) throw datasetError;

    return { data: fallbackData as T | null, error: datasetError };
  }
}

/**
 * Safely validate dataset with error handling
 */
export async function validateDatasetSafely<T>(
  data: unknown,
  validator: (data: unknown) => Promise<T>,
  options: DatasetLoadOptions = {}
): Promise<{ data: T | null; error: DatasetError | null }> {
  const logger = createLogger("DatasetValidator");
  const startTime = Date.now();
  const { fallbackData = null, throwOnError = false } = options;

  try {
    const validated = await validator(data);
    const duration = Date.now() - startTime;

    logger.logTiming("Dataset validated", duration, true);
    return { data: validated, error: null };
  } catch (err) {
    const duration = Date.now() - startTime;
    const error = err instanceof Error ? err : new Error(String(err));

    const datasetError = new DatasetError(
      `Failed to validate dataset: ${error.message}`,
      DatasetErrorCodes.VALIDATION_FAILED,
      400,
      { originalError: error.message }
    );

    logger.errorWithTiming("Dataset validation failed", startTime, datasetError);

    if (throwOnError) throw datasetError;

    return { data: fallbackData as T | null, error: datasetError };
  }
}

/**
 * Get user-friendly error message
 */
export function getDatasetErrorMessage(
  error: DatasetError,
  language: "en" | "cs" = "en"
): string {
  const messages = {
    en: {
      [DatasetErrorCodes.LOAD_FAILED]: "Failed to load dataset. Please try again later.",
      [DatasetErrorCodes.VALIDATION_FAILED]: "Dataset validation failed. The data format may be invalid.",
      [DatasetErrorCodes.PARSE_FAILED]: "Failed to parse dataset file.",
      [DatasetErrorCodes.FILE_NOT_FOUND]: "Dataset file not found.",
      [DatasetErrorCodes.INVALID_FORMAT]: "Invalid dataset format.",
      [DatasetErrorCodes.DATABASE_ERROR]: "Database error occurred while loading dataset.",
      [DatasetErrorCodes.UNKNOWN]: "An unexpected error occurred while loading the dataset.",
    },
    cs: {
      [DatasetErrorCodes.LOAD_FAILED]: "Nepodařilo se načíst datovou sadu. Zkuste to prosím později.",
      [DatasetErrorCodes.VALIDATION_FAILED]: "Ověření datové sady se nezdařilo. Formát dat může být neplatný.",
      [DatasetErrorCodes.PARSE_FAILED]: "Nepodařilo se analyzovat soubor datové sady.",
      [DatasetErrorCodes.FILE_NOT_FOUND]: "Soubor datové sady nebyl nalezen.",
      [DatasetErrorCodes.INVALID_FORMAT]: "Neplatný formát datové sady.",
      [DatasetErrorCodes.DATABASE_ERROR]: "Při načítání datové sady došlo k chybě databáze.",
      [DatasetErrorCodes.UNKNOWN]: "Při načítání datové sady došlo k neočekávané chybě.",
    },
  };

  const messageMap = messages[language] || messages.en;
  return messageMap[error.code as keyof typeof messageMap] || messageMap[DatasetErrorCodes.UNKNOWN];
}
