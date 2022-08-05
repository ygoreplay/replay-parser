import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "texts" })
export class Text {
    @PrimaryColumn({ type: "int" })
    public id!: number;

    @Column({ type: "text" })
    public name!: string;

    @Column({ type: "text" })
    public desc!: string;

    @Column({ type: "text" })
    public str1!: string;

    @Column({ type: "text" })
    public str2!: string;

    @Column({ type: "text" })
    public str3!: string;

    @Column({ type: "text" })
    public str4!: string;

    @Column({ type: "text" })
    public str5!: string;

    @Column({ type: "text" })
    public str6!: string;

    @Column({ type: "text" })
    public str7!: string;

    @Column({ type: "text" })
    public str8!: string;

    @Column({ type: "text" })
    public str9!: string;

    @Column({ type: "text" })
    public str10!: string;

    @Column({ type: "text" })
    public str11!: string;

    @Column({ type: "text" })
    public str12!: string;

    @Column({ type: "text" })
    public str13!: string;

    @Column({ type: "text" })
    public str14!: string;

    @Column({ type: "text" })
    public str15!: string;

    @Column({ type: "text" })
    public str16!: string;
}
