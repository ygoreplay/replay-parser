import * as _ from "lodash";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { Text } from "@models/text";

const SET_CODE_ALIASES: Record<number, number> = {
    // 섬도 => 섬도희
    [0x115]: 0x1115,

    // 엘드릭실, 황금향 => 엘드리치
    [0x2142]: 0x1142,
    [0x143]: 0x1142,

    // E·, V, E-, M, D => HERO
    [0x3008]: 0x8,
    [0x5008]: 0x8,
    [0x6008]: 0x8,
    [0xa008]: 0x8,
    [0xc008]: 0x8,

    // DDD => DD
    [0x10af]: 0xaf,

    // 사이버네틱, 사이버 드래곤 => 사이버
    [0x1093]: 0x93,
    [0x94]: 0x93,

    // Evil★Twin => Live☆Twin
    [0x2151]: 0x1151,
};

@Entity({ name: "datas" })
export class Card extends BaseEntity {
    private static parseSetCode(setCode: number) {
        let setcodes: number[] = [];
        for (let i = 0; i < 4; ++i) {
            const setcode = (setCode >> (i * 16)) & 0xffff;
            if (setcode) {
                setcodes.push(SET_CODE_ALIASES[setcode] || setcode);
                setcodes = _.uniq(setcodes);
            }
        }

        return setcodes;
    }

    public get setcodes(): number[] {
        if (this._setcode === 0) {
            return [];
        }

        if (!this._setcodes) {
            this._setcodes = Card.parseSetCode(this._setcode);
        }

        return this._setcodes;
    }

    public get isSpell() {
        return Boolean(this.type & 0x2);
    }
    public get isTrap() {
        return Boolean(this.type & 0x4);
    }
    public get isContinuous() {
        return Boolean(this.type & 0x20000);
    }
    public get isEquip() {
        return Boolean(this.type & 0x40000);
    }
    public get isField() {
        return Boolean(this.type & 0x80000);
    }
    public get isCounter() {
        return Boolean(this.type & 0x100000);
    }
    public get isQuickPlay() {
        return Boolean(this.type & 0x10000);
    }

    public get isMonster() {
        return Boolean(this.type & 0x1);
    }
    public get isSynchro() {
        return Boolean(this.type & 0x2000);
    }
    public get isXYZ() {
        return Boolean(this.type & 0x800000);
    }
    public get isFusion() {
        return Boolean(this.type & 0x40);
    }
    public get isLink() {
        return Boolean(this.type & 0x4000000);
    }
    public get isPendulum() {
        return Boolean(this.type & 0x1000000);
    }
    public get isRitual() {
        return Boolean(this.type & 0x80);
    }
    public get isExtraCard() {
        return this.isMonster && (this.isFusion || this.isSynchro || this.isXYZ || this.isLink);
    }

    private _setcodes?: number[];

    @PrimaryColumn({ type: "int" })
    public id!: number;

    @Column({ type: "int" })
    public ot!: number;

    @Column({ type: "int" })
    public alias!: number;

    @Column({ type: "int", name: "setcode" })
    private _setcode!: number;

    @Column({ type: "int" })
    public type!: number;

    @Column({ type: "int" })
    public atk!: number;

    @Column({ type: "int" })
    public def!: number;

    @Column({ type: "int" })
    public level!: number;

    @Column({ type: "int" })
    public race!: number;

    @Column({ type: "int" })
    public attribute!: number;

    @Column({ type: "int" })
    public category!: number;

    @OneToOne(() => Text, { eager: true })
    @JoinColumn({ name: "id" })
    public text!: Text;
}
