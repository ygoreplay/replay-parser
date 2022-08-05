import { Deck, Replay } from "yrp";
import * as fastGlob from "fast-glob";

async function clearConsole() {
    process.stdout.write("\x1Bc");
}

async function main() {
    const replayPaths = await fastGlob(["./replays/*.yrp"]);
    if (!replayPaths.length) {
        return;
    }

    const deckBuffer: Deck[] = [];
    for (const path of replayPaths) {
        const replay = await Replay.fromFile(path);
        const decks = replay.getDecks();

        deckBuffer.push(...decks);
    }
}

clearConsole().then(main).then();
