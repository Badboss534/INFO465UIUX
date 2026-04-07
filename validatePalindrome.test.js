const validatePalindrome = require("../../../info350/git-mean-median/validatePalindrome");

test("hello is NOT a palindrome", () => {
  expect(validatePalindrome("hello")).toBe(false);
});

test("Level IS a palindrome (case-insensitive)", () => {
  expect(validatePalindrome("Level")).toBe(true);
});

test("mad am IS a palindrome (ignores spaces)", () => {
  expect(validatePalindrome("mad am")).toBe(true);
});

test("A man, a plan, a canal. Panama is a palindrome (ignores commas/periods/spaces/case)", () => {
  expect(validatePalindrome("A man, a plan, a canal. Panama")).toBe(true);
});

test("not a palindrome is NOT a palindrome", () => {
  expect(validatePalindrome("not a palindrome")).toBe(false);
});
