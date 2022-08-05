import { Deck, Replay } from "yrp";
import * as fastGlob from "fast-glob";
import * as fs from "fs-extra";

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

    await fs.writeFile("./output.json", JSON.stringify(deckBuffer));
}

clearConsole().then(main).then();
