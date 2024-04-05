function getRandomLetters(len) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let final = "";
  for (let i = 1; i <= parseInt(len); i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    final += alphabet[randomIndex];
  }
  return final;
}

module.exports = {
  randomId: (prefix = "DG") => {
    const timeStamp = `${Date.now()}`;
    const randomStringLength = 24 - (prefix.length + timeStamp.length);
    const randomString = getRandomLetters(randomStringLength);
    const uniqueId = prefix + timeStamp + randomString;
    return uniqueId;
  },
};
