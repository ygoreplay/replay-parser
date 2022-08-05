import * as ProgressBar from "progress";
import * as _ from "lodash";
import { Deck, Replay } from "yrp";
import * as fastGlob from "fast-glob";
import * as fs from "fs-extra";
import { createConnection } from "typeorm";

import { Card } from "@models/card";
import { Text } from "@models/text";

async function clearConsole() {
    process.stdout.write("\x1Bc");
}

interface ResultData {
    allCount: number;
    mainCount: number;
    extraCount: number;
    monsterCount: number;
    spellCount: number;
    trapCount: number;
    fusionCount: number;
    synchroCount: number;
    xyzCount: number;
    pendulumCount: number;
    ritualCount: number;
    linkCount: number;
    setCodeRank: number[];
    setCodeCountRank: number[];
}

interface CardDeck {
    main: Card[];
    extra: Card[];
}

async function main() {
    const replayPaths = await fastGlob(["./replays/*.yrp"]);
    if (!replayPaths.length) {
        return;
    }

    const textData = await fs.readFile("./data/strings.conf").then(buf => buf.toString());
    const codeNameMap = Object.fromEntries(
        textData
            .split("\n")
            .filter(line => line.startsWith("!setname "))
            .map(line => {
                const [, value, ...rest] = line.split(" ");
                return [parseInt(value, 16), rest.join(" ").replace(/.*?\(정발명:(.*?)\).*?$/, "$1")];
            }),
    );

    await createConnection({
        type: "sqlite",
        database: "./data/cards.cdb",
        entities: [Card, Text],
    });

    const allCards = await Card.find();
    const cardMap = _.chain(allCards)
        .keyBy(c => c.id)
        .mapValues(c => c)
        .value();

    function checkInvalidDeck({ main, extra }: Deck) {
        return ![...main, ...extra].some(id => !cardMap[id]);
    }

    function convertDeckToCardDeck({ main, extra }: Deck): CardDeck {
        return {
            main: main.map(id => cardMap[id]),
            extra: extra.map(id => cardMap[id]),
        };
    }

    const progressBar = new ProgressBar("Processing decks [:bar] :rate/dps :percent :etas", {
        complete: "=",
        incomplete: " ",
        width: 20,
        total: replayPaths.length,
    });

    const deckBuffer: CardDeck[] = [];
    for (const path of replayPaths) {
        const replay = await Replay.fromFile(path);
        const decks = replay
            .getDecks()
            .filter(checkInvalidDeck)
            .filter(s => s.main.length >= 40)
            .filter(s => s.extra.length === 15); // we don't care incomplete decks

        deckBuffer.push(...decks.map(convertDeckToCardDeck));
        progressBar.tick();
    }

    progressBar.terminate();

    let codeNames: string[] = [];
    const resultData = deckBuffer
        .map((deck): ResultData | null => {
            const allCards = [...deck.main, ...deck.extra];
            const allSetCodes = _.chain(allCards).map("setcodes").flattenDeep().value();
            const topCodes = _.chain(allSetCodes)
                .countBy(c => c)
                .entries()
                .orderBy(p => p[1], "desc")
                .map(p => [parseInt(p[0], 10), p[1]])
                .slice(0, 3)
                .value();

            if (topCodes.length <= 0) {
                return null;
            }

            codeNames.push(codeNameMap[topCodes[0][0]]);

            return {
                allCount: deck.main.length + deck.extra.length,
                mainCount: deck.main.length,
                extraCount: deck.extra.length,
                monsterCount: deck.main.filter(c => c.isMonster).length,
                spellCount: deck.main.filter(c => c.isSpell).length,
                trapCount: deck.main.filter(c => c.isTrap).length,
                fusionCount: deck.extra.filter(c => c.isFusion).length,
                synchroCount: deck.extra.filter(c => c.isSynchro).length,
                xyzCount: deck.extra.filter(c => c.isXYZ).length,
                pendulumCount: deck.extra.filter(c => c.isPendulum).length,
                ritualCount: deck.main.filter(c => c.isRitual).length,
                linkCount: deck.extra.filter(c => c.isLink).length,
                setCodeRank: topCodes.map(p => p[0]),
                setCodeCountRank: topCodes.map(p => p[1]),
            };
        })
        .filter((item): item is ResultData => Boolean(item));

    const topUsedCodeNames = _.chain(codeNames)
        .countBy(c => c)
        .entries()
        .orderBy(p => p[1], "desc")
        .slice(0, 10)
        .map(p => p[0])
        .value();

    let minimalData = _.chain(resultData)
        .map(item => [
            item.allCount,
            item.mainCount,
            item.extraCount,
            item.monsterCount,
            item.spellCount,
            item.trapCount,
            item.fusionCount,
            item.synchroCount,
            item.xyzCount,
            item.pendulumCount,
            item.linkCount,
            item.ritualCount,
            item.setCodeRank[0] || 0,
            item.setCodeCountRank[0] || 0,
            item.setCodeRank[1] || 0,
            item.setCodeCountRank[1] || 0,
            item.setCodeRank[2] || 0,
            item.setCodeCountRank[2] || 0,
            codeNameMap[item.setCodeRank[0]],
        ])
        .filter(i => topUsedCodeNames.includes(i.at(-1) as string))
        .uniqBy(i => i.join(", "))
        .value();

    codeNames = minimalData.map(item => item.at(-1) as string);
    minimalData = minimalData.map(data => data.slice(0, data.length - 2));

    await fs.writeFile("./output.json", JSON.stringify(minimalData));
    await fs.writeFile("./names.txt", codeNames.join("\n"));
    await fs.writeFile("./features.txt", minimalData.map(item => item.join(", ")).join("\n"));
}

clearConsole().then(main).then();
