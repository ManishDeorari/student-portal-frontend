export function getEmojiFromUnified(unified) {
  return unified
    .split("-")
    .map(u => String.fromCodePoint(`0x${u}`))
    .join("");
}
