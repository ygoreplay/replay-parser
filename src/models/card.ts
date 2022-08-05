import * as _ from "lodash";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

import { Text } from "@models/text";

@Entity({ name: "datas" })
export class Card extends BaseEntity {
    private static parseSetCode(setCode: number) {
        let setcodes: number[] = [];
        for (let i = 0; i < 4; ++i) {
            const setcode = (setCode >> (i * 16)) & 0xffff;
            if (setcode) {
                setcodes.push(setcode);
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
