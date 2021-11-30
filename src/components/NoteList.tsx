import { h } from 'preact';

export function mapNotes(n) {
    return n.reduce((acc, cur) => {
        const year = new Date(cur.published_at).getFullYear().toString()
        return {
            ...acc,
            [year]: acc[year] ? [...acc[year], cur] : [cur]
        }
    }, {})
}

interface Note {
    title: string
    url: string
    published_at: string
}

interface NotePreviewProps {
    notes: { [key: string]: Note[] }
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return `${pad(date.getDate(), 2)}.${pad(date.getMonth() + 1, 2)}`
}

function renderNotes (notes: Note[]) {
    return notes.map(i => (
        <div className="notes-item">
            <a href={i.url} className="notes-title">{i.title}</a>
            <span className="notes-date">{formatDate(i.published_at)}</span>
        </div>
    ))
}

function sortYears (a: string, b: string) {
    return parseInt(b, 10) - parseInt(a, 10)
}

export function NoteList({ notes }: NotePreviewProps) {
    const years = Object
        .keys(notes)
        .sort(sortYears)
    return (
        <div className="notes">
            {years.map(year => (
                <div className="notes-block">
                    <div className="notes-yearContainer">
                        <span className="notes-year">{year}</span>
                    </div>
                    <div className="notes-links">
                        {renderNotes(notes[year])}
                    </div>
                </div>
            ))}
        </div>
    )
}