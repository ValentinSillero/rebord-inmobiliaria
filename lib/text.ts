const emojiSequence = /(?:\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0E|\uFE0F|\p{Emoji_Modifier})*(?:\u200D\p{Extended_Pictographic}(?:\uFE0E|\uFE0F|\p{Emoji_Modifier})*)*|[\u2190-\u21ff\u2300-\u23ff\u25a0-\u27bf](?:\uFE0E|\uFE0F)?)/gu;
const residualEmojiMarks = /[\u200d\u20e3\ufe0e\ufe0f]|\p{Emoji_Modifier}/gu;

export function removeEmojis(text: string) {
  return text
    .replace(emojiSequence, '')
    .replace(residualEmojiMarks, '')
    .split(/\r?\n/)
    .map(line => line.replace(/[\t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
