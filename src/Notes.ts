import {NoteData} from "./lib";
import * as Mustache from 'mustache';
import Note from "./Note";
// @ts-ignore
import Sortable from '../node_modules/sortablejs';


export default class Notes {

    private data: NoteData;
    private container: HTMLElement;
    private noteTemplate: string;
    private trashTemplate: string;
    private template: string;

    constructor(container: HTMLElement) {
        this.container = container;
        this.template = document.querySelector('[data-id="tpl-notes"]').innerHTML;
        this.noteTemplate = document.querySelector('[data-id="tpl-note"]').innerHTML;
        this.trashTemplate = document.querySelector('[data-id="tpl-trash"]').innerHTML;
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
            trashBtn: document.querySelector('#trash'),
        }

        elements.trashBtn.addEventListener('click', () => {
            this.displayTrash();
        })

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

        let sortable = new Sortable(this.container, {
            animation: 150,
            onEnd: (ev: any) => {
                let order = sortable.toArray();
                for (let i in order) {
                    let note = this.getNoteById(parseInt(order[i]));
                    note.setSortIndex(Number(i))
                    this.save();
                    this.data = this.getData();
                    this.render();
                }
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
            data = JSON.parse(data);
            let notes = [];
            for (const item of data) {
                let note = Note.createFromData(item)
                notes.push(note);
            }
            return notes.sort((a: Note, b: Note) => {
                return a.getSortIndex() - b.getSortIndex()
            });
        } else {
            return [
                Note.createNewNote()
            ]
        }
    }

    render() {
        const html = this.template,
            partials = {
                note: this.noteTemplate,
            };

        let data = this.data;

        const context = {
            data: data,
        }

        this.container.innerHTML = Mustache.render(html, context, partials);
        this.setupNotes()
    }

    createNewNote() {
        const note = Note.createNewNote()
        this.data.notes.push(note)
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

    getNoteById(id: number): Note {
        for (const note of this.data.notes) {
            if (id === note.id) {
                return note;
            }
        }

        return null
    }

    private setupNotes() {
        const elements: any = {
            notes: this.container.querySelectorAll('.note'),
        }

        for (const note of elements.notes) {
            this.setupNote(note);
        }
    }

    private setupNote(note: HTMLElement) {
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

        const updateNote = (ev: any) => {
            let note = this.getNoteById(id);
            note.setTitle(elements.title.innerText);
            note.setContent(elements.content.innerHTML);
            this.save();
        }

        let timeoutId: any;
        elements.title.addEventListener('input', (ev: any) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                updateNote(ev);
            }, 200)
        })

        elements.content.addEventListener('input', (ev: any) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                updateNote(ev)
            }, 200)
        })

        elements.title.addEventListener('keydown', (ev: any) => {
            if(ev.key === 'Enter') {
                ev.preventDefault();
                updateNote(ev)
                elements.title.blur();
            }
        })

        elements.colorSelect.addEventListener('click', (ev: any) => {
            let note = this.getNoteById(id);
            if(ev.target.dataset.color) {
                note.setColor(ev.target.dataset.color);
            }
            this.save();
            this.render();
        })

    }

    private deleteNote(id: number) {
        let note = this.getNoteById(id);
        note.delete();
        this.save();
        this.render();

        document.dispatchEvent((new CustomEvent('NoteDeleted')));

    }

    displayTrash() {

        const el = document.createElement('div');
        el.classList.add('trash-container')

        const render = () => {
            el.innerHTML = Mustache.render(this.trashTemplate, {notes: this.data.notes});
        }

        const setup = () => {
            const elements: any = {
                closeBtn: el.querySelector('#close-trash'),
                restore: el.querySelectorAll('.restore'),
            }

            for (const btn of elements.restore) {
                const id = parseInt(btn.dataset.id);
                btn.addEventListener('click', () => {
                    this.restoreNote(id);
                    render();
                    setup();
                })
            }

            elements.closeBtn.addEventListener('click', () => {
                el.parentElement.removeChild(el);
            })

            document.addEventListener('NoteDeleted', () => {
                render();
                setup();
            })
        }

        render();
        setup();




        document.body.appendChild(el);

    }

    private restoreNote(id: number) {
        let note = this.getNoteById(id);
        note.restore();
        this.save();
        this.render();
    }
}