const ALL_BIT_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export function generateQuestionForRound(roundLevel = 1, currentBitLength = 5, questionsSolvedInLevel = 0) {
  // Check for unlock challenge after 3 solved questions in Rounds 1-3
  if (questionsSolvedInLevel >= 3 && currentBitLength < 8 && roundLevel < 4) {
    const nextBitMap = { 5: 32, 6: 64, 7: 128 };
    const nextBitVal = nextBitMap[currentBitLength];
    const nextLength = currentBitLength + 1;

    return {
      type: 'UNLOCK_CHALLENGE',
      target: 0,
      targetBit: nextBitVal,
      nextBitLength: nextLength,
      bitLength: currentBitLength,
      questionsSolvedInLevel: 0,
      label: `🔓 TANTANGAN BUKA BIT KE-${nextLength} (Berapa bobot setelah ${Math.pow(2, currentBitLength - 1)}?)`
    };
  }

  // Generate round-specific question types
  switch (roundLevel) {
    case 1:
      return generateStandardDecimal(currentBitLength, questionsSolvedInLevel);
    case 2:
      return generateLogicGateQuestion(currentBitLength, questionsSolvedInLevel);
    case 3:
      return generateBitShiftQuestion(currentBitLength, questionsSolvedInLevel);
    case 4:
      return generateTwosComplementQuestion(8, questionsSolvedInLevel);
    default:
      return generateStandardDecimal(currentBitLength, questionsSolvedInLevel);
  }
}

// ROUND 1: Standard Decimal Conversion
function generateStandardDecimal(bitLength, solvedCount) {
  const maxTarget = Math.pow(2, bitLength) - 1;
  const target = Math.floor(Math.random() * maxTarget) + 1;

  return {
    type: 'STANDARD',
    target: target,
    targetBit: null,
    nextBitLength: null,
    bitLength: bitLength,
    questionsSolvedInLevel: solvedCount,
    label: `ROUND 1 | LEVEL ${bitLength - 4}: ${bitLength}-BIT DESIMAL (MAX ${maxTarget})`
  };
}

// ROUND 2: Logic Gates (AND / OR / XOR)
function generateLogicGateQuestion(bitLength, solvedCount) {
  const gates = ['AND', 'OR', 'XOR'];
  const gate = gates[Math.floor(Math.random() * gates.length)];

  const maxVal = Math.pow(2, bitLength) - 1;
  const valA = Math.floor(Math.random() * maxVal) + 1;
  const valB = Math.floor(Math.random() * maxVal) + 1;

  let resultDecimal = 0;
  if (gate === 'AND') resultDecimal = valA & valB;
  if (gate === 'OR') resultDecimal = valA | valB;
  if (gate === 'XOR') resultDecimal = valA ^ valB;

  const binA = valA.toString(2).padStart(bitLength, '0');
  const binB = valB.toString(2).padStart(bitLength, '0');

  return {
    type: 'STANDARD',
    target: resultDecimal,
    targetBit: null,
    nextBitLength: null,
    bitLength: bitLength,
    questionsSolvedInLevel: solvedCount,
    label: `ROUND 2 | LOGIC GATE: ${binA} ${gate} ${binB}`
  };
}

// ROUND 3: Bit Shifts (<< / >>)
function generateBitShiftQuestion(bitLength, solvedCount) {
  const isLeftShift = Math.random() > 0.5;
  const shiftAmount = Math.floor(Math.random() * 2) + 1; // 1 or 2 positions

  const maxVal = Math.pow(2, bitLength - shiftAmount) - 1;
  const baseVal = Math.floor(Math.random() * maxVal) + 1;

  let resultDecimal = isLeftShift ? (baseVal << shiftAmount) : (baseVal >> shiftAmount);
  const opSymbol = isLeftShift ? '<<' : '>>';
  const binBase = baseVal.toString(2).padStart(bitLength, '0');

  return {
    type: 'STANDARD',
    target: resultDecimal,
    targetBit: null,
    nextBitLength: null,
    bitLength: bitLength,
    questionsSolvedInLevel: solvedCount,
    label: `ROUND 3 | BIT SHIFT: ${binBase} ${opSymbol} ${shiftAmount}`
  };
}

// ROUND 4: Two's Complement (Signed 8-Bit)
function generateTwosComplementQuestion(bitLength = 8, solvedCount) {
  const negVal = -(Math.floor(Math.random() * 100) + 1); // Negative decimal (-1 to -100)
  
  // Calculate Two's Complement unsigned integer equivalent for 8 bits
  const twosCompUnsigned = (256 + negVal) & 255;

  return {
    type: 'STANDARD',
    target: twosCompUnsigned,
    targetBit: null,
    nextBitLength: null,
    bitLength: 8,
    questionsSolvedInLevel: solvedCount,
    label: `GRAND FINAL | TWO'S COMPLEMENT: Konversi Desimal ${negVal}`
  };
}