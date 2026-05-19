import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, BookOpen, Clock, Trophy, History as HistoryIcon, 
  Settings, Star, CheckCircle, XCircle, ChevronLeft, ArrowRight,
  Smile, Award, Zap
} from 'lucide-react';

// --- UTILITY & LOGIC FUNCTIONS ---

const generateQuestion = (operation, difficulty) => {
  let maxNum = 10;
  
  // Set boundaries based on difficulty
  if (difficulty === 'easy') maxNum = 10;
  if (difficulty === 'medium') maxNum = 50;
  if (difficulty === 'hard') maxNum = 100;

  // Multiplication limits (keep it up to 10 for easy/medium, 20 for hard)
  if (operation === '×') {
    maxNum = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
  }

  let n1 = Math.floor(Math.random() * maxNum) + 1;
  let n2 = Math.floor(Math.random() * maxNum) + 1;

  // Formatting specific operations to be kid-friendly
  if (operation === '-') {
    // No negative answers
    if (n2 > n1) {
      let temp = n1;
      n1 = n2;
      n2 = temp;
    }
  }

  if (operation === '÷') {
    // Ensure clean division (whole numbers)
    let maxDivisor = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
    n2 = Math.floor(Math.random() * maxDivisor) + 1;
    let answer = Math.floor(Math.random() * maxDivisor) + 1;
    n1 = n2 * answer; // n1 is the dividend
  }

  let correctAnswer = 0;
  if (operation === '+') correctAnswer = n1 + n2;
  if (operation === '-') correctAnswer = n1 - n2;
  if (operation === '×') correctAnswer = n1 * n2;
  if (operation === '÷') correctAnswer = n1 / n2;

  return { n1, n2, operation, correctAnswer };
};

const calculateStars = (score, total) => {
  const percentage = score / total;
  if (percentage >= 0.9) return 3;
  if (percentage >= 0.6) return 2;
  return 1;
};

// --- MAIN APPLICATION COMPONENT ---

export default function MathApp() {
  const [view, setView] = useState('home'); // home, learn, practice, test, history
  const [operation, setOperation] = useState('+');
  const [difficulty, setDifficulty] = useState('easy');
  const [history, setHistory] = useState([]);

  // Load history from local storage on init
  useEffect(() => {
    const savedHistory = localStorage.getItem('mathWizardHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (record) => {
    const newHistory = [record, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('mathWizardHistory', JSON.stringify(newHistory));
  };

  const renderHeader = (title, showBack = true) => (
    <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-3xl shadow-sm border-b-4 border-indigo-100">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => setView('home')}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
        )}
        <h1 className="text-2xl font-black text-indigo-800 tracking-tight">{title}</h1>
      </div>
      <div className="flex gap-2">
        <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full text-yellow-500 font-bold text-xl">
          🌟
        </div>
      </div>
    </div>
  );

  // --- VIEWS ---

  const HomeView = () => (
    <div className="animate-fade-in text-center">
      <div className="mb-8 mt-4">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 drop-shadow-sm pb-2 mb-4 hover:scale-105 transition-transform cursor-default leading-tight md:leading-snug">
          Math Wizard TMag
        </h1>
        <p className="text-lg text-gray-600 font-medium">Let's make learning math super fun!</p>
      </div>

      {/* Main Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button 
          onClick={() => setView('learn')}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-400 p-6 rounded-3xl text-white shadow-lg shadow-blue-200 transform transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 border-b-8 border-blue-500"
        >
          <BookOpen className="w-12 h-12 mb-3 opacity-90 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold">Learn</h2>
          <p className="text-blue-50 font-medium mt-1">Study tables & concepts</p>
          <div className="absolute top-2 right-2 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">📚</div>
        </button>

        <button 
          onClick={() => setView('practice')}
          className="group relative overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-green-200 transform transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 border-b-8 border-green-600"
        >
          <Play className="w-12 h-12 mb-3 opacity-90 group-hover:scale-110 transition-transform" fill="currentColor" />
          <h2 className="text-2xl font-bold">Practice</h2>
          <p className="text-green-50 font-medium mt-1">No timer, just fun!</p>
          <div className="absolute top-2 right-2 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🎯</div>
        </button>

        <button 
          onClick={() => setView('test')}
          className="group relative overflow-hidden bg-gradient-to-br from-orange-400 to-red-400 p-6 rounded-3xl text-white shadow-lg shadow-orange-200 transform transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 border-b-8 border-orange-500 md:col-span-2"
        >
          <Clock className="w-12 h-12 mb-3 opacity-90 group-hover:scale-110 transition-transform mx-auto" />
          <h2 className="text-2xl font-bold">Take a Test!</h2>
          <p className="text-orange-50 font-medium mt-1">Beat the clock & earn stars</p>
          <div className="absolute top-2 right-2 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">⚡</div>
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button 
          onClick={() => setView('history')}
          className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-sm hover:bg-indigo-50 transition-colors border-2 border-indigo-100"
        >
          <HistoryIcon size={20} /> My Trophies
        </button>
      </div>
    </div>
  );

  const ConfigPanel = () => (
    <div className="bg-white p-5 rounded-3xl shadow-sm mb-6 border-2 border-indigo-50">
      <div className="flex items-center gap-2 mb-4 text-indigo-800 font-bold">
        <Settings size={20} /> Game Settings
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Choose Magic Power</label>
          <div className="flex gap-2">
            {[
              { op: '+', label: 'Plus', color: 'bg-pink-100 text-pink-600 border-pink-300 hover:bg-pink-200' },
              { op: '-', label: 'Minus', color: 'bg-blue-100 text-blue-600 border-blue-300 hover:bg-blue-200' },
              { op: '×', label: 'Times', color: 'bg-green-100 text-green-600 border-green-300 hover:bg-green-200' },
              { op: '÷', label: 'Divide', color: 'bg-purple-100 text-purple-600 border-purple-300 hover:bg-purple-200' }
            ].map(item => (
              <button
                key={item.op}
                onClick={() => setOperation(item.op)}
                className={`flex-1 py-2 px-1 rounded-xl border-2 font-bold text-lg transition-all ${
                  operation === item.op 
                    ? `${item.color.replace('100', '500').replace('text-pink-600', 'text-white').replace('text-blue-600', 'text-white').replace('text-green-600', 'text-white').replace('text-purple-600', 'text-white')} shadow-md scale-105` 
                    : `${item.color} opacity-70`
                }`}
              >
                {item.op}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Difficulty Level</label>
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-2 px-3 rounded-xl border-2 font-bold capitalize transition-all ${
                  difficulty === level 
                    ? 'bg-indigo-500 text-white border-indigo-600 shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {level === 'easy' && '🌱 '}
                {level === 'medium' && '🔥 '}
                {level === 'hard' && '🐉 '}
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const LearnView = () => {
    const [tableBase, setTableBase] = useState(2);
    
    return (
      <div className="animate-fade-in pb-10">
        {renderHeader('Magic Tables')}
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-indigo-50 mt-4">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setTableBase(Math.max(1, tableBase - 1))}
              className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-200 font-bold text-xl disabled:opacity-50"
              disabled={tableBase <= 1}
            >
              -
            </button>
            <h2 className="text-3xl font-black text-indigo-800">
              Table of {tableBase}
            </h2>
            <button 
              onClick={() => setTableBase(Math.min(20, tableBase + 1))}
              className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-200 font-bold text-xl disabled:opacity-50"
              disabled={tableBase >= 20}
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(multiplier => (
              <div key={multiplier} className="flex items-center justify-center p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl text-xl font-bold text-gray-700 border border-indigo-100 hover:scale-105 transition-transform">
                <span className="w-8 text-right text-indigo-500">{tableBase}</span>
                <span className="w-8 text-center text-gray-400">×</span>
                <span className="w-8 text-left text-pink-500">{multiplier}</span>
                <span className="w-8 text-center text-gray-400">=</span>
                <span className="w-12 text-center text-green-600 text-2xl">
                  {tableBase * multiplier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const PracticeView = () => {
    const [q, setQ] = useState(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
    const [streak, setStreak] = useState(0);

    const newQuestion = useCallback(() => {
      setQ(generateQuestion(operation, difficulty));
      setAnswer('');
      setFeedback(null);
    }, [operation, difficulty]);

    useEffect(() => {
      newQuestion();
    }, [newQuestion]);

    const checkAnswer = (e) => {
      e.preventDefault();
      if (answer === '') return;
      
      const numAnswer = parseFloat(answer);
      if (numAnswer === q.correctAnswer) {
        setFeedback('correct');
        setStreak(s => s + 1);
        setTimeout(newQuestion, 1200);
      } else {
        setFeedback('wrong');
        setStreak(0);
        setTimeout(() => setFeedback(null), 1500);
      }
    };

    if (!q) return null;

    return (
      <div className="animate-fade-in pb-10">
        {renderHeader('Training Grounds')}
        <ConfigPanel />

        <div className="bg-white rounded-[3rem] shadow-sm border-4 border-indigo-100 p-8 text-center relative overflow-hidden">
          {/* Streak indicator */}
          <div className="absolute top-4 right-6 flex items-center gap-1 font-bold text-orange-500 bg-orange-100 px-3 py-1 rounded-full">
            <Zap size={16} className="fill-current" /> Streak: {streak}
          </div>

          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-6">Solve This!</h2>
          
          <div className="text-7xl md:text-8xl font-black text-indigo-900 mb-8 tracking-tighter flex items-center justify-center gap-4">
            <span>{q.n1}</span>
            <span className={`${
              operation === '+' ? 'text-pink-500' :
              operation === '-' ? 'text-blue-500' :
              operation === '×' ? 'text-green-500' : 'text-purple-500'
            }`}>{q.operation}</span>
            <span>{q.n2}</span>
            <span className="text-gray-300">=</span>
            <span>?</span>
          </div>

          <form onSubmit={checkAnswer} className="max-w-xs mx-auto">
            <div className="relative">
              <input 
                type="number" 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className={`w-full text-center text-4xl font-bold py-4 rounded-2xl border-4 outline-none transition-colors ${
                  feedback === 'correct' ? 'bg-green-100 border-green-400 text-green-700' :
                  feedback === 'wrong' ? 'bg-red-100 border-red-400 text-red-700 animate-shake' :
                  'bg-gray-50 border-indigo-200 focus:border-indigo-500 text-indigo-900'
                }`}
                placeholder="0"
                autoFocus
              />
              
              {/* Feedback Animations */}
              {feedback === 'correct' && (
                <div className="absolute inset-y-0 right-4 flex items-center text-green-500 animate-bounce">
                  <CheckCircle size={32} />
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="absolute inset-y-0 right-4 flex items-center text-red-500">
                  <XCircle size={32} />
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="mt-6 w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-200 transform transition-all active:scale-95 border-b-4 border-indigo-700"
            >
              Check Answer
            </button>
          </form>
        </div>
      </div>
    );
  };

  const TestView = () => {
    const TOTAL_QUESTIONS = 10;
    const TIME_LIMIT = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 90 : 120; // seconds
    
    const [gameState, setGameState] = useState('config'); // config, playing, summary
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [answer, setAnswer] = useState('');
    const timerRef = useRef(null);

    const startGame = () => {
      // Generate questions array
      const qs = Array(TOTAL_QUESTIONS).fill(null).map(() => generateQuestion(operation, difficulty));
      setQuestions(qs);
      setCurrentIdx(0);
      setScore(0);
      setTimeLeft(TIME_LIMIT);
      setAnswer('');
      setGameState('playing');
    };

    const quitTest = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('config');
    };

    const endGame = useCallback(() => {
      setGameState('summary');
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Save result
      const stars = calculateStars(score, TOTAL_QUESTIONS);
      saveToHistory({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        operation,
        difficulty,
        score,
        total: TOTAL_QUESTIONS,
        stars
      });
    }, [score, operation, difficulty]); // Only dependencies needed for endGame logic

    // Timer effect
    useEffect(() => {
      if (gameState === 'playing') {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              endGame();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [gameState, endGame]);

    const submitAnswer = (e) => {
      e.preventDefault();
      if (answer === '') return;

      const numAnswer = parseFloat(answer);
      const isCorrect = numAnswer === questions[currentIdx].correctAnswer;
      
      if (isCorrect) setScore(s => s + 1);
      
      if (currentIdx < TOTAL_QUESTIONS - 1) {
        setCurrentIdx(idx => idx + 1);
        setAnswer('');
      } else {
        // We defer endGame slightly so the state has time to update score if the last question was right
        setTimeout(() => endGame(), 0);
      }
    };

    if (gameState === 'config') {
      return (
        <div className="animate-fade-in pb-10">
          {renderHeader('Hero Challenge')}
          <ConfigPanel />
          <div className="bg-white p-8 rounded-3xl shadow-sm text-center border-4 border-orange-100">
            <Trophy className="w-20 h-20 mx-auto text-orange-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready for the Test?</h2>
            <p className="text-gray-500 mb-6">
              You will have <strong>{TIME_LIMIT} seconds</strong> to answer <strong>{TOTAL_QUESTIONS}</strong> questions. Do your best!
            </p>
            <button 
              onClick={startGame}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xl py-4 px-12 rounded-full shadow-lg shadow-orange-200 transform transition-all hover:scale-105 active:scale-95 border-b-4 border-orange-700"
            >
              Start Game! 🚀
            </button>
          </div>
        </div>
      );
    }

    if (gameState === 'playing') {
      const q = questions[currentIdx];
      const progressPct = ((currentIdx) / TOTAL_QUESTIONS) * 100;

      return (
        <div className="animate-fade-in pb-10">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={quitTest}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-2xl shadow-sm font-bold border-2 border-red-200 hover:bg-red-200 transition-colors flex items-center gap-1 text-sm md:text-base"
            >
              <XCircle size={18} /> Quit
            </button>
            <div className="bg-white px-3 py-2 rounded-2xl shadow-sm font-bold text-indigo-800 border-2 border-indigo-100 text-sm md:text-base">
              Q: {currentIdx + 1} / {TOTAL_QUESTIONS}
            </div>
            <div className={`px-3 py-2 rounded-2xl shadow-sm font-bold border-2 flex items-center gap-1 text-sm md:text-base ${
              timeLeft <= 10 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-white text-gray-700 border-gray-100'
            }`}>
              <Clock size={18} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border-4 border-indigo-100 p-8 text-center relative">
            <div className="text-7xl md:text-8xl font-black text-indigo-900 mb-8 tracking-tighter flex items-center justify-center gap-4">
              <span>{q.n1}</span>
              <span className="text-orange-500">{q.operation}</span>
              <span>{q.n2}</span>
              <span className="text-gray-300">=</span>
            </div>

            <form onSubmit={submitAnswer} className="max-w-xs mx-auto">
              <input 
                type="number" 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full text-center text-4xl font-bold py-4 rounded-2xl border-4 bg-gray-50 border-indigo-200 focus:border-indigo-500 text-indigo-900 outline-none"
                placeholder="0"
                autoFocus
              />
              <button 
                type="submit"
                className="mt-6 w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-200 transform transition-all active:scale-95 border-b-4 border-indigo-700 flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (gameState === 'summary') {
      const stars = calculateStars(score, TOTAL_QUESTIONS);
      
      return (
        <div className="animate-fade-in pb-10 text-center">
          {renderHeader('Results', false)}
          
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border-4 border-yellow-100 mt-6 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-50 rounded-full blur-3xl opacity-50"></div>
            
            <h2 className="text-3xl font-black text-gray-800 mb-6 relative z-10">
              {stars === 3 ? "Awesome Job! 🌟" : stars === 2 ? "Great Effort! 👍" : "Keep Practicing! 💪"}
            </h2>

            <div className="flex justify-center gap-4 mb-8 relative z-10">
              {[1, 2, 3].map(s => (
                <Star 
                  key={s} 
                  size={64} 
                  className={`transform transition-all ${
                    s <= stars ? 'fill-yellow-400 text-yellow-500 scale-110 drop-shadow-md' : 'fill-gray-100 text-gray-200'
                  }`} 
                />
              ))}
            </div>

            <div className="text-6xl font-black text-indigo-600 mb-2">{score} / {TOTAL_QUESTIONS}</div>
            <p className="text-gray-500 font-medium mb-8">Correct Answers</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setGameState('config')}
                className="py-3 px-8 rounded-full bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition-colors"
              >
                Play Again
              </button>
              <button 
                onClick={() => setView('home')}
                className="py-3 px-8 rounded-full bg-indigo-500 text-white font-bold shadow-md hover:bg-indigo-600 transition-colors"
              >
                Home Menu
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  const HistoryView = () => (
    <div className="animate-fade-in pb-10">
      {renderHeader('My Trophies')}
      
      <div className="bg-white rounded-3xl shadow-sm border-2 border-indigo-50 overflow-hidden">
        {history.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Trophies Yet!</h3>
            <p>Take a test to start earning stars and see your history here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((record, idx) => (
              <div key={record.id || idx} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white ${
                    record.operation === '+' ? 'bg-pink-400' :
                    record.operation === '-' ? 'bg-blue-400' :
                    record.operation === '×' ? 'bg-green-400' : 'bg-purple-400'
                  }`}>
                    {record.operation}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-lg">Score: {record.score}/{record.total}</span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded-lg">
                        {record.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{record.date}</div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {[1, 2, 3].map(s => (
                    <Star 
                      key={s} 
                      size={20} 
                      className={s <= record.stars ? 'fill-yellow-400 text-yellow-500' : 'fill-gray-100 text-gray-200'} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 selection:bg-indigo-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Nunito', sans-serif; background-color: #f8fafc; }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-100 to-transparent -z-10"></div>
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        {view === 'home' && <HomeView />}
        {view === 'learn' && <LearnView />}
        {view === 'practice' && <PracticeView />}
        {view === 'test' && <TestView />}
        {view === 'history' && <HistoryView />}
      </div>
    </div>
  );
}