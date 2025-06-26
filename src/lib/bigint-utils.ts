/**
 * Convert BigInt values to Number for JSON serialization
 * This is needed because MariaDB/MySQL can return BigInt for aggregation functions
 * but JSON.stringify cannot serialize BigInt values
 */
export function convertBigIntToNumber(obj: any): any {
  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  if (obj !== null && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertBigIntToNumber(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}

/**
 * Safely convert a value to Number, handling BigInt and other types
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
}
