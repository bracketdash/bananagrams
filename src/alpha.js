export const fromAlphaCode = function(s) {
  const seq = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (seq[s] !== undefined) {
    return seq.indexOf(s);
  }
  
  const BASE = 36;
  let n = 0;
  let places = 1;
  let range = BASE;
  let pow = 1;
  
  while(places < s.length) {
    n += range;
    places++;
    range *= BASE;
  }
  
  for (let i = s.length - 1; i >= 0; i--) {
    let d = s.charCodeAt(i) - 48;
    if (d > 10) {
      d -= 7;
    }
    n += d * pow;
    pow *= BASE;
  }
  return n;
}
