export default function getEmojiFromUnified(unified) {
  return String.fromCodePoint(...unified.split("-").map((u) => "0x" + u));
}
