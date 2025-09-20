import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "/api"; //Change if backend is hosted elsewhere

function App() {
  const [notes, setNotes] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/notes`);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const buildAnalysisPrompt = (text) => {
    return `
You are an expert code and text reviewer.
Analyze the following note or code strictly in a **point-wise** format.

Requirements:
1. Highlight key ideas or functionality.
2. Detect and explain any errors or issues (syntax, logic, clarity).
3. Suggest improvements or best practices.
4. Avoid any irrelevant or unrelated information.
5. Keep the tone professional and concise.

Here is the content to analyze:
---
${text}
---`;
  };

  const handleInvokeSonnet = async (text) => {
    try {
      const prompt = buildAnalysisPrompt(text);
      const res = await axios.get("/claude/claude/ask", {
        params: { q: prompt },
      });
      setAnalysisResult(res.data);
      setLastAnalyzedText(text);
    } catch (err) {
      console.error(err);
      setAnalysisResult("❌ Error invoking model");
    }
  };

  const handleReloadAnalysis = () => {
    if (lastAnalyzedText) {
      handleInvokeSonnet(lastAnalyzedText);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await axios.put(`${API_URL}/notes/${editingNote}`, { content });
        setEditingNote(null);
      } else {
        await axios.post(`${API_URL}/notes`, { name, content });
      }
      setName("");
      setContent("");
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note.name);
    setName(note.name);
    setContent(note.content);
  };

  const handleDelete = async (noteName) => {
    try {
      await axios.delete(`${API_URL}/notes/${noteName}`);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1 className="title">📒 Code Analyzer</h1>

      {/* Note Form with Analysis */}
      <form onSubmit={handleSubmit} className="note-form">
        {!editingNote && (
          <input
            type="text"
            placeholder="Note name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <textarea
          placeholder="Note content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <div className="analysis-actions">
          <button
            type="button"
            onClick={() => handleInvokeSonnet(content)}
            className="btn btn-secondary"
          >
            Analyze
          </button>
          <button
            type="button"
            onClick={handleReloadAnalysis}
            disabled={!lastAnalyzedText}
            className="btn btn-secondary"
          >
            🔄 Reload Analysis
          </button>
        </div>

        {analysisResult && (
          <div className="analysis-result">
            <strong>Analysis:</strong>
            <p>{analysisResult}</p>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingNote ? "Update Note" : "Add Note"}
          </button>
          {editingNote && (
            <button
              type="button"
              onClick={() => {
                setEditingNote(null);
                setName("");
                setContent("");
              }}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Notes List */}
      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note.name} className="note-item">
            <h3>{note.name}</h3>
            <p>{note.content}</p>
            <div className="note-actions">
              <button
                onClick={() => handleEdit(note)}
                className="btn btn-secondary"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.name)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
