export function random(len: number): string {
  const options = "kncownvwoivnwiocqooen1134243211";
  const optionsLen = options.length;
  let result = "";

  for (let i = 0; i < len; i++) {
    const idx = Math.floor(Math.random() * optionsLen);
    result += options.charAt(idx);
  }

  return result;
}
