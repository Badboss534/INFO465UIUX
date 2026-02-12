/* jshint esversion: 6 */

// cleanData(inputWord):
// - lowercases
// - removes spaces, commas, periods
// - returns cleaned string
function cleanData(inputWord) {
  return inputWord
    .toLowerCase()
    .replace(/[ ,\.]/g, "");
}

// testPalindrome(cleanedWord):
// - reverses cleaned string
// - compares reversed to original
// - returns true if same, else false
function testPalindrome(cleanedWord) {
  const reversed = cleanedWord.split("").reverse().join("");
  return reversed === cleanedWord;
}

// validatePalindrome(inputWord):
// - calls cleanData()
// - calls testPalindrome()
// - returns true/false
function validatePalindrome(inputWord) {
  if (typeof inputWord !== "string") return false;

  const cleaned = cleanData(inputWord);

  // Treat empty string after cleaning as NOT a palindrome
  // (prevents inputs like " , . " being counted)
  if (cleaned.length === 0) return false;

  return testPalindrome(cleaned);
}

module.exports = validatePalindrome;
