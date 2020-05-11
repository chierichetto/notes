import {NoteData} from "./lib";
import * as Mustache from 'mustache';
import Note from "./Note";

export default class Notes {

    private data: NoteData;
    private container: HTMLElement;
    private noteTemplate: string;
    private template: string;

    constructor(container: HTMLElement) {
        this.container = container;
        this.template = document.querySelector('[data-id="tpl-notes"]').innerHTML;
        this.noteTemplate = document.querySelector('[data-id="tpl-note"]').innerHTML;
        this.data = this.getData();
        this.render();
        this.setup();
    }

    static init(container: HTMLElement) {
        new Notes(container);
    }

    setup() {
        const elements: any = {
            newBtn: document.querySelector('#new-note'),
        }

        elements.newBtn.addEventListener('click', () => {
            this.createNewNote();
        })

        document.addEventListener('keydown', (ev: any) => {
            if(ev.shiftKey && ev.ctrlKey && ev.key === 'N') {
                ev.preventDefault();
                ev.stopPropagation();
                this.createNewNote();
            }
        });
    }

    save() {
        const data = JSON.stringify(this.data.notes);
        localStorage.setItem('notes', data);
    }

    getSavedNotes() {
        let data = localStorage.getItem('notes');
        if (data) {
            return JSON.parse(data);
        } else {
            let note = Note.createNewNote(this.container);
            return note.getData();
        }
    }

    render() {
        const html = this.template,
            partials = {
                note: this.noteTemplate,
            };

        const context = {
            data: this.data,
        }

        this.container.innerHTML = Mustache.render(html, context, partials);
        this.setupNotes()
    }

    createNewNote() {
        const note = Note.createNewNote(this.container)
        this.data.notes.push(note.getData())
        this.save();
        this.render();
        const elNote: any = this.container.querySelector('[data-id="' + note.getId() + '"]');
        const content = elNote.querySelector('.note-content');
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(content);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    private getData(): NoteData {
        return {
            notes: this.getSavedNotes()
        }
    }

    getNoteById(id: number) {
        for (const note of this.data.notes) {
            if(id === note.id) {
                return note;
            }
        }

        return {}
    }

    private setupNotes() {
        const elements: any = {
            notes: this.container.querySelectorAll('.note'),
        }

        for (const note of elements.notes) {
            this.setupNote(note);
        }
    }

    private setupNote(note: any) {
        const id = parseInt(note.dataset.id);
        const elements: any = {
            delete: note.querySelector('.delete-note'),
            title: note.querySelector('h2.note-title'),
            content: note.querySelector('p.note-content'),
            colorSelect: note.querySelector('.note-color-select'),
        }

        elements.delete.addEventListener('click', () => {
            this.deleteNote(id)
        })

        let timeoutId: any;
        elements.title.addEventListener('input', (ev: any) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                let note = this.getNoteById(id);
                note.title = ev.target.innerText;
                this.save();
            }, 200)
        })

        elements.content.addEventListener('input', (ev: any) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                let note = this.getNoteById(id);
                note.content = ev.target.innerHTML;
                this.save();
            }, 200)
        })

        elements.title.addEventListener('keydown', (ev: any) => {
            if(ev.key === 'Enter') {
                ev.preventDefault();
                let note = this.getNoteById(id);
                note.title = ev.target.innerText;
                elements.title.blur();
                this.save();
            }
        })

        elements.content.addEventListener('keydown', (ev: any) => {
            if(ev.key === 'Enter' && ev.shiftKey) {
                ev.preventDefault();
                let note = this.getNoteById(id);
                note.content = ev.target.innerHTML
                elements.content.blur();
                this.save();
                this.createNewNote();
            }
        })

        elements.colorSelect.addEventListener('click', (ev: any) => {
            console.log(ev);
            let note = this.getNoteById(id);
            if(ev.target.dataset.color) {
                note.color = ev.target.dataset.color;
            }
            this.save();
            this.render();
        })

    }

    private deleteNote(id: number) {
        this.data.notes = this.data.notes.filter((value: any) => {
            return value.id !== id;
        });

        this.save();
        this.render();
    }

}