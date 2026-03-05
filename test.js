/**
 * Converts a raw uint256 value (18 decimals) to a human-readable number.
 * @param {bigint|number|string} rawValue - The raw on-chain value
 * @param {number} decimals - Number of decimals (default: 18)
 * @returns {number}
 */
function calculate(rawValue, decimals = 18) {
  return Number(rawValue) / Math.pow(10, decimals);
}

// const rawValue = 2236799971767642661n;
const rawValue = 843438347120624547n;
const result = calculate(rawValue);
console.log(`Raw:    ${rawValue}`);
console.log(`Result: ${result}`);
