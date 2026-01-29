import {
  DatasetError,
  DatasetErrorCodes,
  getDatasetErrorMessage,
  loadDatasetSafely,
  validateDatasetSafely,
} from "@/lib/dataset-error";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Dataset Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadDatasetSafely", () => {
    it("should load dataset successfully", async () => {
      const mockData = { id: 1, name: "Test" };
      const loader = vi.fn(async () => mockData);

      const result = await loadDatasetSafely(loader);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(loader).toHaveBeenCalledOnce();
    });

    it("should catch load errors and return null data with error", async () => {
      const loader = vi.fn(async () => {
        throw new Error("Load failed");
      });

      const result = await loadDatasetSafely(loader);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(DatasetErrorCodes.LOAD_FAILED);
      expect(result.data).toBeNull();
    });

    it("should return fallback data on error when provided", async () => {
      const fallbackData = { id: 0, name: "Fallback" };
      const loader = vi.fn(async () => {
        throw new Error("Load failed");
      });

      const result = await loadDatasetSafely(loader, { fallbackData });

      expect(result.error).toBeDefined();
      expect(result.data).toEqual(fallbackData);
    });

    it("should throw error when throwOnError is true", async () => {
      const loader = vi.fn(async () => {
        throw new Error("Load failed");
      });

      await expect(loadDatasetSafely(loader, { throwOnError: true })).rejects.toThrow(DatasetError);
    });

    it("should handle timeout errors", async () => {
      const loader = vi.fn(async () => {
        return new Promise((resolve) => setTimeout(() => resolve({ data: "test" }), 100));
      });

      const result = await loadDatasetSafely(loader, { timeout: 10 });

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(DatasetErrorCodes.LOAD_FAILED);
    });
  });

  describe("validateDatasetSafely", () => {
    it("should validate data successfully", async () => {
      const mockData = { id: 1, name: "Test" };
      const validator = vi.fn(async (data) => {
        if (!data.id) throw new Error("Missing ID");
        return data;
      });

      const result = await validateDatasetSafely(mockData, validator);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
      expect(validator).toHaveBeenCalledWith(mockData);
    });

    it("should catch validation errors", async () => {
      const mockData = { name: "Test" };
      const validator = vi.fn(async (data) => {
        if (!data.id) throw new Error("Missing ID");
        return data;
      });

      const result = await validateDatasetSafely(mockData, validator);

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(DatasetErrorCodes.VALIDATION_FAILED);
      expect(result.data).toBeNull();
    });

    it("should return fallback data on validation error", async () => {
      const fallbackData = { name: "Fallback" };
      const mockData = { name: "Test" };
      const validator = vi.fn(async () => {
        throw new Error("Validation failed");
      });

      const result = await validateDatasetSafely(mockData, validator, { fallbackData });

      expect(result.error).toBeDefined();
      expect(result.data).toEqual(fallbackData);
    });

    it("should throw validation error when throwOnError is true", async () => {
      const mockData = { name: "Test" };
      const validator = vi.fn(async () => {
        throw new Error("Validation failed");
      });

      await expect(
        validateDatasetSafely(mockData, validator, { throwOnError: true })
      ).rejects.toThrow(DatasetError);
    });
  });

  describe("DatasetError", () => {
    it("should create error with correct properties", () => {
      const context = { field: "value" };
      const error = new DatasetError(
        "Test message",
        DatasetErrorCodes.INVALID_FORMAT,
        422,
        context
      );

      expect(error.message).toBe("Test message");
      expect(error.code).toBe(DatasetErrorCodes.INVALID_FORMAT);
      expect(error.statusCode).toBe(422);
      expect(error.context).toEqual(context);
      expect(error.name).toBe("DatasetError");
    });

    it("should have default statusCode of 500", () => {
      const error = new DatasetError("Test", DatasetErrorCodes.LOAD_FAILED);

      expect(error.statusCode).toBe(500);
    });
  });

  describe("getDatasetErrorMessage", () => {
    it("should return English error message", () => {
      const error = new DatasetError("Test", DatasetErrorCodes.LOAD_FAILED);

      const message = getDatasetErrorMessage(error, "en");

      expect(message).toBe("Failed to load dataset. Please try again later.");
    });

    it("should return Czech error message", () => {
      const error = new DatasetError("Test", DatasetErrorCodes.LOAD_FAILED);

      const message = getDatasetErrorMessage(error, "cs");

      expect(message).toBe("Nepodařilo se načíst datovou sadu. Zkuste to prosím později.");
    });

    it("should return message for validation error in English", () => {
      const error = new DatasetError("Test", DatasetErrorCodes.VALIDATION_FAILED);

      const message = getDatasetErrorMessage(error, "en");

      expect(message).toBe("Dataset validation failed. The data format may be invalid.");
    });

    it("should handle unknown error code", () => {
      const error = new DatasetError("Test", "UNKNOWN_CODE" as any);

      const message = getDatasetErrorMessage(error, "en");

      expect(message).toBe("An unexpected error occurred while loading the dataset.");
    });
  });

  describe("Graceful Degradation", () => {
    it("should gracefully handle loader failure with fallback", async () => {
      const emptyArray: any[] = [];
      const loader = vi.fn(async () => {
        throw new Error("Network error");
      });

      const result = await loadDatasetSafely(loader, {
        fallbackData: emptyArray,
        throwOnError: false,
      });

      expect(result.data).toEqual(emptyArray);
      expect(result.error).toBeDefined();
    });

    it("should log errors for debugging", async () => {
      const loader = vi.fn(async () => {
        throw new Error("Specific error message");
      });

      const result = await loadDatasetSafely(loader);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Specific error message");
    });
  });
});
