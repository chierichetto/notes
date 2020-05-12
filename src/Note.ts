import * as Mustache from 'mustache';
import DateTimeFormat = Intl.DateTimeFormat;


export default class Note {

    private id: number;
    private title: string;
    private content: string;
    private status: string;
    private template: string;
    private container: HTMLElement;
    private color: string;
    private sortIndex: number;
    private deleted: boolean = false;

    private static oneLiners: any = [
        'What is the biggest lie in the entire universe? <br>"I have read and agree to the Terms & Conditions."',
        'How does a computer get drunk? <br>It takes screenshots. ',
        // 'Why are iPhone chargers not called Apple Juice?!',
        // 'Why did the PowerPoint Presentation cross the road? <br>To get to the other slide.',
        'Have you heard of that new band "1023 Megabytes"? They\'re pretty good, but they don\'t have a gig just yet.',
        'We\'ll we\'ll we\'ll...if it isn\'t autocorrect.',
        'My computer suddenly started belting out "Someone Like You." It\'s a Dell. ',
        'I know a joke about UDP, but i\'m not sure you\'ll get it.',
    ];

    private static dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }

    setId(id: number): void {
        this.id = id;
    }

    setTitle(title: string) {
        this.title = title;
    }

    setContent(content: string) {
        this.content = content;
    }

    setStatus(status: string) {
        this.status = status;
    }

    getId() {
        return this.id;
    }

    getTitle() {
        return this.title;
    }

    getContent() {
        return this.content;
    }

    getStatus() {
        return this.status;
    }

    static generateId() {
        return Math.floor(Math.random() * 100000000);
    }

    setColor(color: string) {
        this.color = color;
    }

    getColor() {
        return this.color;
    }

    setSortIndex(index: number) {
        this.sortIndex = index;
    }

    getSortIndex(): number {
        return this.sortIndex;
    }

    delete(): void {
        this.deleted = true;
    }

    restore(): void {
        this.deleted = false;
    }

    isDeleted() {
        return this.deleted === true;
    }

    static createNewNote() {
        const self = new Note();
        let dtf = new DateTimeFormat('no-NB', Note.dateOptions);

        self.id = Note.generateId();
        self.title = dtf.format((Date.now()));
        self.content = Note.oneLiners[Math.floor(Math.random() * Note.oneLiners.length)]
        return self;
    }

    static createFromData(data: any) {
        let self = new Note();
        self.id = data.id;
        self.title = data.title;
        self.content = data.content;
        self.color = data.color;
        self.sortIndex = data.sortIndex;
        self.deleted = data.deleted;

        return self;
    }


}
