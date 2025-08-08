import pinyin from 'pinyin';

/**
 * Generate pinyin array for Chinese text
 * @param {string} text - Chinese text
 * @param {Object} customPronunciations - Optional object with position-based custom pronunciations (format: "position:char")
 * @returns {Array} Array of pinyin strings for each character
 */
export const generatePinyin = (text, customPronunciations = {}) => {
  if (!text) return [];
  
  // Convert text to array of characters
  const chars = text.split('');
  
  // Generate pinyin for each character
  return chars.map((char, position) => {
    const positionKey = `${position}:${char}`;
    
    // Check if we have a custom pronunciation for this character at this position
    if (customPronunciations[positionKey]) {
      return customPronunciations[positionKey];
    }
    
    // Use pinyin library to get the pronunciation
    // Using style: NORMAL for tone marks and heteronym: false to get only first pronunciation
    const result = pinyin(char, {
      style: pinyin.STYLE_NORMAL, // Normal style with tone numbers
      heteronym: false // Don't return multiple pronunciations
    });
    
    // The result is an array of arrays, so we need to get the first item of the first array
    return result[0][0];
  });
};

/**
 * Get the initial letter of a pinyin string
 * @param {string} pinyinStr - Pinyin string
 * @returns {string} Initial letter in lowercase
 */
export const getPinyinInitial = (pinyinStr) => {
  if (!pinyinStr) return '';
  return pinyinStr.charAt(0).toLowerCase();
};

/**
 * Generate an array of pinyin initials
 * @param {Array} pinyinArray - Array of pinyin strings
 * @returns {Array} Array of pinyin initials
 */
export const generatePinyinInitials = (pinyinArray) => {
  return pinyinArray.map(getPinyinInitial);
};

/**
 * Check if a character is a punctuation mark
 * @param {string} char - Character to check
 * @returns {boolean} True if the character is punctuation
 */
export const isPunctuation = (char) => {
  // Common Chinese and English punctuation marks
  const punctuationMarks = [
    '，', '。', '！', '？', '；', '：', '"', '"', '\'', '\'', '【', '】',
    '（', '）', '《', '》', '”', '“', '、', '…', '—', '～', '·',
    ',', '.', '!', '?', ';', ':', '"', '\'', '(', ')', '[', ']',
    '{', '}', '<', '>', '/', '\\', '|', '-', '_', '+', '=', '*', '&', '^', '%', '$', '#', '@'
  ];
  
  return punctuationMarks.includes(char) || /\s/.test(char); // Also consider whitespace as punctuation
};