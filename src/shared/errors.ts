/**
 * Shared error classes for BITS-QRIS-Converter
 * Mengikuti coding standard: PascalCase untuk class, deskriptif, extends Error
 */

export class QrisError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class QrisValidationError extends QrisError {
  constructor(message: string) {
    super(message, 'QRIS_VALIDATION_ERROR');
  }
}

export class QrisParseError extends QrisError {
  constructor(message: string) {
    super(message, 'QRIS_PARSE_ERROR');
  }
}

export class QrisConvertError extends QrisError {
  constructor(message: string) {
    super(message, 'QRIS_CONVERT_ERROR');
  }
}

export class QrisImageError extends QrisError {
  constructor(message: string) {
    super(message, 'QRIS_IMAGE_ERROR');
  }
}
