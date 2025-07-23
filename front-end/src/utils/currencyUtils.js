/**
 * Utility functions for currency formatting
 */

/**
 * Format price to VND currency
 * @param {number} price - The price to format
 * @returns {string} Formatted price in VND
 */
export const formatVND = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0 ₫';
  }
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Format price to VND without currency symbol (just number with commas)
 * @param {number} price - The price to format
 * @returns {string} Formatted price without currency symbol
 */
export const formatVNDNumber = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0';
  }
  
  return new Intl.NumberFormat("vi-VN").format(price);
};

/**
 * Format price to VND with custom suffix
 * @param {number} price - The price to format
 * @param {string} suffix - Custom suffix (default: 'VND')
 * @returns {string} Formatted price with custom suffix
 */
export const formatVNDWithSuffix = (price, suffix = 'VND') => {
  if (price === null || price === undefined || isNaN(price)) {
    return `0 ${suffix}`;
  }
  
  return `${new Intl.NumberFormat("vi-VN").format(price)} ${suffix}`;
}; 