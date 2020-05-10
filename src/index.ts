import './css/main.scss';
import Notes from "./Notes";
import Note from "./Note";

document.addEventListener('DOMContentLoaded', () => {
    Notes.init(document.querySelector('#notes'));
})