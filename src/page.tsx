'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './globals.css'; // Import your CSS

interface Book {
  id: number;
  title: string;
  author: string;
  duration: number;
  progress: number;
  icon: string;
  audio_url?: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [speedIndex, setSpeedIndex] = useState(1);
  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const audioPlayer = useRef<HTMLAudioElement>(null);

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const res = await fetch('/api/books');
    const data = await res.json();
    setBooks(data);
  }

  // Search books
  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setBooks(data);
  }

  // Select book
  function selectBook(book: Book) {
    setCurrentBook(book);
    if (audioPlayer.current && book.audio_url) {
      audioPlayer.current.src = book.audio_url;
      audioPlayer.current.load();
    }
    document.getElementById('player')?.classList.add('active');
    updatePlayerTime();
  }


useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('Service Worker registered');
    });
  }
  fetchBooks();
}, []);

  // Toggle play/pause
  function togglePlay() {
    if (!currentBook || !audioPlayer.current) return;
    if (isPlaying) {
      audioPlayer.current.pause();
      setIsPlaying(false);
      document.getElementById('play-btn')!.textContent = '▶️';
    } else {
      audioPlayer.current.play();
      setIsPlaying(true);
      document.getElementById('play-btn')!.textContent = '⏸️';
    }
  }

  // Skip functions
  function skipBackward() {
    if (audioPlayer.current && audioPlayer.current.currentTime > 30 /

System: You are Grok 3 built by xAI.

It looks like your message was cut off. You provided an HTML file for an audiobook app and asked to make it server-side for deployment on Vercel. I was in the process of explaining how to convert it to a Next.js app with serverless API routes, cloud storage, and a database. The last part I was working on was the frontend code in `src/app/page.tsx`, which was incomplete.

To continue, I'll complete the `page.tsx` file and provide the remaining steps to deploy the app on Vercel. I'll assume you want me to finish the frontend implementation and include any missing functionality from your original script (e.g., skip functions, speed control, modal handling, and time updates). I'll also ensure the app integrates with the API routes and Vercel Blob storage as described.

### Completing the Frontend (`src/app/page.tsx`)

Below is the completed `page.tsx` file, incorporating all the functionality from your original script, adapted to fetch data from the server-side API and handle audio file URLs from Vercel Blob.

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './globals.css'; // Import your CSS (ensure it's correctly set up)

interface Book {
  id: number;
  title: string;
  author: string;
  duration: number;
  progress: number;
  icon: string;
  audio_url?: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const audioPlayer = useRef<HTMLAudioElement>(null);

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Update time display
  useEffect(() => {
    const player = audioPlayer.current;
    if (!player) return;

    const updateTime = () => {
      setCurrentTime(player.currentTime);
      setTotalTime(player.duration || 0);
    };

    player.addEventListener('timeupdate', updateTime);
    player.addEventListener('loadedmetadata', updateTime);
    player.addEventListener('ended', () => {
      setIsPlaying(false);
      document.getElementById('play-btn')!.textContent = '▶️';
    });

    return () => {
      player.removeEventListener('timeupdate', updateTime);
      player.removeEventListener('loadedmetadata', updateTime);
      player.removeEventListener('ended', () => {});
    };
  }, []);

  async function fetchBooks() {
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('Failed to fetch books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  }

  function selectBook(book: Book) {
    setCurrentBook(book);
    if (audioPlayer.current && book.audio_url) {
      audioPlayer.current.src = book.audio_url;
      audioPlayer.current.load();
    }
    document.getElementById('player')?.classList.add('active');
  }

  function togglePlay() {
    if (!currentBook || !audioPlayer.current) return;
    if (isPlaying) {
      audioPlayer.current.pause();
      setIsPlaying(false);
      document.getElementById('play-btn')!.textContent = '▶️';
    } else {
      audioPlayer.current.play().catch((err) => console.error('Playback error:', err));
      setIsPlaying(true);
      document.getElementById('play-btn')!.textContent = '⏸️';
    }
  }

  function skipBackward() {
    if (audioPlayer.current) {
      audioPlayer.current.currentTime = Math.max(0, audioPlayer.current.currentTime - 30);
    }
  }

  function skipForward() {
    if (audioPlayer.current) {
      audioPlayer.current.currentTime += 30;
    }
  }

  function changeSpeed() {
    const newIndex = (speedIndex + 1) % speeds.length;
    const newSpeed = speeds[newIndex];
    setSpeedIndex(newIndex);
    setCurrentSpeed(newSpeed);
    if (audioPlayer.current) {
      audioPlayer.current.playbackRate = newSpeed;
    }
    document.getElementById('speed-btn')!.textContent = `${newSpeed}x`;
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  function openAddBookModal() {
    document.getElementById('add-book-modal')?.classList.add('active');
  }

  function closeAddBookModal() {
    document.getElementById('add-book-modal')?.classList.remove('active');
    clearAddBookForm();
  }

  function clearAddBookForm() {
    (document.getElementById('book-title') as HTMLInputElement).value = '';
    (document.getElementById('book-author') as HTMLInputElement).value = '';
    (document.getElementById('book-file') as HTMLInputElement).value = '';
  }

  async function addBook() {
    const title = (document.getElementById('book-title') as HTMLInputElement).value.trim();
    const author = (document.getElementById('book-author') as HTMLInputElement).value.trim();
    const fileInput = document.getElementById('book-file') as HTMLInputElement;

    if (!title || !author) {
      alert('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('icon', '📚');
    if (fileInput.files?.[0]) {
      formData.append('file', fileInput.files[0]);
      // Calculate duration client-side
      const file = fileInput.files[0];
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        formData.append('duration', Math.round(audio.duration).toString());
        // Send to API
        fetch('/api/books', {
          method: 'POST',
          body: formData,
        })
          .then((res) => res.json())
          .then((newBook) => {
            setBooks([...books, newBook]);
            closeAddBookModal();
          })
          .catch((err) => console.error('Error adding book:', err));
      });
    } else {
      // No file uploaded
      fetch('/api/books', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((newBook) => {
          setBooks([...books, newBook]);
          closeAddBookModal();
        })
        .catch((err) => console.error('Error adding book:', err));
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🎧</div>
          <div className="logo-text">AudioBooks</div>
        </div>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search your library..."
            onChange={handleSearch}
          />
          <div className="search-icon">🔍</div>
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
          <span id="book-count">{books.length}</span> books
        </div>
      </header>

      <div className="library-grid" id="library-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card" onClick={() => selectBook(book)}>
            <div className="book-cover">{book.icon}</div>
            <div className="book-info">
              <h3>{book.title}</h3>
              <p>By {book.author}</p>
              <p>
                {Math.floor(book.duration / 3600)}h{' '}
                {Math.floor((book.duration % 3600) / 60)}m
              </p>
              <div className="book-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.round(book.progress * 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">{Math.round(book.progress * 100)}% complete</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="add-book-btn" onClick={openAddBookModal}>
        +
      </button>

      <div className="player" id="player">
        <div className="player-content">
          <div className="current-book">
            <div className="current-cover" id="current-cover">
              {currentBook?.icon || '📖'}
            </div>
            <div className="current-info">
              <h4 id="current-title">{currentBook?.title || 'No book selected'}</h4>
              <p id="current-author">
                {currentBook ? `By ${currentBook.author}` : 'Select a book to start listening'}
              </p>
            </div>
          </div>
          <div className="player-controls">
            <button className="control-btn" onClick={skipBackward}>
              ⏪
            </button>
            <button className="control-btn play-btn" id="play-btn" onClick={togglePlay}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="control-btn" onClick={skipForward}>
              ⏩
            </button>
          </div>
          <div className="time-info">
            <span id="current-time">{formatTime(currentTime)}</span>
            <span>/</span>
            <span id="total-time">{formatTime(totalTime)}</span>
          </div>
          <button className="speed-control" id="speed-btn" onClick={changeSpeed}>
            {currentSpeed}x
          </button>
        </div>
      </div>

      <div className="modal" id="add-book-modal" onClick={(e) => {
        if (e.target === e.currentTarget) closeAddBookModal();
      }}>
        <div className="modal-content">
          <h3>Add New Audiobook</h3>
          <input
            type="text"
            className="file-input"
            id="book-title"
            placeholder="Book Title"
            style={{ marginBottom: '12px' }}
          />
          <input
            type="text"
            className="file-input"
            id="book-author"
            placeholder="Author"
            style={{ marginBottom: '12px' }}
          />
          <input
            type="file"
            className="file-input"
            id="book-file"
            accept="audio/*"
            style={{ marginBottom: '20px' }}
          />
          <div>
            <button className="btn btn-primary" onClick={addBook}>
              Add Book
            </button>
            <button className="btn btn-secondary" onClick={closeAddBookModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <audio id="audio-player" ref={audioPlayer} preload="metadata"></audio>
    </div>
  );
}