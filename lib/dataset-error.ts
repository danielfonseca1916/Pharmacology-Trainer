import { createLogger } from "./server-logger";

export enum DatasetErrorCodes {
  LOAD_FAILED = "LOAD_FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  PARSE_FAILED = "PARSE_FAILED",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  INVALID_FORMAT = "INVALID_FORMAT",
  DATABASE_ERROR = "DATABASE_ERROR",
  UNKNOWN = "UNKNOWN",
}

export class DatasetError extends Error {
  constructor(
    message: string,
    public code: string = DatasetErrorCodes.UNKNOWN,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = "DatasetError";
  }
}

export async function loadDatasetSafely<T>(
  loader: () => Promise<T>,
  options?: {
    timeout?: number;
    fallbackData?: T;
    throwOnError?: boolean;
  }
): Promise<{ data: T | null; error: DatasetError | null }> {
  const logger = createLogger("DatasetLoader");
  const timeout = options?.timeout ?? 30000;

  try {
    const startTime = Date.now();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Dataset load timeout")), timeout)
    );

    const data = await Promise.race([loader(), timeoutPromise]);
    const elapsed = Date.now() - startTime;
    logger.info(`Dataset loaded: ${elapsed}ms (success)`, { duration: elapsed, success: true });
    return { data, error: null };
  } catch (err) {
    const elapsed = Date.now() - Date.now();
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error(`Dataset load failed (${elapsed}ms)`, {
      message: `Failed to load dataset: ${errorMessage}`,
    });

    if (options?.throwOnError) {
      throw new DatasetError(
        `Failed to load dataset: ${errorMessage}`,
        DatasetErrorCodes.LOAD_FAILED,
        500
      );
    }

    if (options?.fallbackData !== undefined) {
      return {
        data: options.fallbackData,
        error: new DatasetError(errorMessage, DatasetErrorCodes.LOAD_FAILED),
      };
    }

    return {
      data: null,
      error: new DatasetError(
        `Failed to load dataset: ${errorMessage}`,
        DatasetErrorCodes.LOAD_FAILED
      ),
    };
  }
}

export async function validateDatasetSafely<T>(
  data: T,
  validator: (data: T) => Promise<T>,
  options?: {
    fallbackData?: T;
    throwOnError?: boolean;
  }
): Promise<{ data: T | null; error: DatasetError | null }> {
  const logger = createLogger("DatasetValidator");

  try {
    const startTime = Date.now();
    const validated = await validator(data);
    const elapsed = Date.now() - startTime;
    logger.info(`Dataset validated: ${elapsed}ms (success)`, { duration: elapsed, success: true });
    return { data: validated, error: null };
  } catch (err) {
    const elapsed = Date.now() - Date.now();
    const errorMessage = err instanceof Error ? err.message : "Validation error";
    logger.error(`Dataset validation failed (${elapsed}ms)`, {
      message: `Failed to validate dataset: ${errorMessage}`,
    });

    if (options?.throwOnError) {
      throw new DatasetError(
        `Failed to validate dataset: ${errorMessage}`,
        DatasetErrorCodes.VALIDATION_FAILED,
        422
      );
    }

    if (options?.fallbackData !== undefined) {
      return {
        data: options.fallbackData,
        error: new DatasetError(errorMessage, DatasetErrorCodes.VALIDATION_FAILED, 422),
      };
    }

    return {
      data: null,
      error: new DatasetError(
        `Failed to validate dataset: ${errorMessage}`,
        DatasetErrorCodes.VALIDATION_FAILED,
        422
      ),
    };
  }
}

export function getDatasetErrorMessage(error: DatasetError, language: "en" | "cs"): string {
  const messages: Record<string, Record<"en" | "cs", string>> = {
    [DatasetErrorCodes.LOAD_FAILED]: {
      en: "Failed to load dataset. Please try again later.",
      cs: "Nepodařilo se načíst datovou sadu. Zkuste to prosím později.",
    },
    [DatasetErrorCodes.VALIDATION_FAILED]: {
      en: "Dataset validation failed. The data format may be invalid.",
      cs: "Ověření datové sady se nezdařilo. Formát dat může být neplatný.",
    },
    [DatasetErrorCodes.PARSE_FAILED]: {
      en: "Failed to parse the dataset. Please check the file format.",
      cs: "Nepodařilo se analyzovat datovou sadu. Prosím zkontrolujte formát souboru.",
    },
    [DatasetErrorCodes.FILE_NOT_FOUND]: {
      en: "The dataset file was not found.",
      cs: "Soubor datové sady nebyl nalezen.",
    },
    [DatasetErrorCodes.INVALID_FORMAT]: {
      en: "The dataset has an invalid format.",
      cs: "Datová sada má neplatný formát.",
    },
    [DatasetErrorCodes.DATABASE_ERROR]: {
      en: "A database error occurred. Please try again later.",
      cs: "Došlo k chybě databáze. Zkuste to prosím později.",
    },
  };

  return (
    messages[error.code]?.[language] ??
    messages[DatasetErrorCodes.UNKNOWN]?.[language] ??
    (language === "en"
      ? "An unexpected error occurred while loading the dataset."
      : "Při načítání datové sady došlo k neočekávané chybě.")
  );
}
