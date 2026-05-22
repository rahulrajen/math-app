import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, BookOpen, Clock, Trophy, History as HistoryIcon, 
  Settings, Star, CheckCircle, XCircle, ChevronLeft, ArrowRight,
  Smile, Award, Zap
} from 'lucide-react';

// --- UTILITY & LOGIC FUNCTIONS ---

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateQuestion = (operation, difficulty) => {
  let n1, n2, correctAnswer;

  if (operation === '+') {
    if (difficulty === 'easy') {
      n1 = randomBetween(1, 9);
      n2 = randomBetween(1, 9);
    } else if (difficulty === 'medium') {
      // Medium: Double digits, no carry over (easy mental calc)
      const tens1 = randomBetween(1, 8);
      const ones1 = randomBetween(1, 8);
      const tens2 = randomBetween(1, 9 - tens1);
      const ones2 = randomBetween(1, 9 - ones1);
      n1 = tens1 * 10 + ones1;
      n2 = tens2 * 10 + ones2;
    } else {
      // Hard: Double digits with carry over
      n1 = randomBetween(11, 89);
      n2 = randomBetween(11, 99 - n1); // Keep max at 99
      if (n1 % 10 + n2 % 10 <= 9) n1 += 3; // Force a carry if possible
    }
    correctAnswer = n1 + n2;
  } 
  else if (operation === '-') {
    if (difficulty === 'easy') {
      n1 = randomBetween(2, 9);
      n2 = randomBetween(1, n1 - 1);
    } else if (difficulty === 'medium') {
      // Medium: Double digits, no borrow (easy mental calc)
      const tens1 = randomBetween(2, 9);
      const ones1 = randomBetween(2, 9);
      const tens2 = randomBetween(1, tens1 - 1);
      const ones2 = randomBetween(1, ones1 - 1);
      n1 = tens1 * 10 + ones1;
      n2 = tens2 * 10 + ones2;
    } else {
      // Hard: Double digits with borrow
      n1 = randomBetween(21, 99);
      n2 = randomBetween(11, n1 - 1);
      if (n1 % 10 >= n2 % 10) n1 -= 5; // Force a borrow if possible
      if (n1 <= n2) n1 = n2 + 5; 
    }
    correctAnswer = n1 - n2;
  } 
  else if (operation === '×') {
    if (difficulty === 'easy') {
      n1 = randomBetween(1, 5);
      n2 = randomBetween(1, 5);
    } else if (difficulty === 'medium') {
      n1 = randomBetween(2, 10);
      n2 = randomBetween(2, 10);
    } else {
      // Hard: Double digit x single digit (result <= 99)
      n1 = randomBetween(11, 33); 
      n2 = randomBetween(2, Math.floor(99 / n1));
    }
    correctAnswer = n1 * n2;
  } 
  else if (operation === '÷') {
    if (difficulty === 'easy') {
      n2 = randomBetween(1, 5);
      correctAnswer = randomBetween(1, 5);
    } else if (difficulty === 'medium') {
      n2 = randomBetween(2, 10);
      correctAnswer = randomBetween(2, 10);
    } else {
      // Hard: Result is max 99, Divisor max 9
      n2 = randomBetween(2, 9);
      correctAnswer = randomBetween(11, Math.floor(99 / n2));
    }
    n1 = n2 * correctAnswer;
  }

  return { n1, n2, operation, correctAnswer };
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const calculateStars = (score, total) => {
  const percentage = score / total;
  if (percentage >= 0.9) return 3;
  if (percentage >= 0.6) return 2;
  return 1;
};

// --- MAIN APPLICATION COMPONENT ---

export default function MathApp() {
  const [view, setView] = useState('home'); 
  const [operation, setOperation] = useState('+');
  const [difficulty, setDifficulty] = useState('easy');
  const [testDuration, setTestDuration] = useState(1); // Mins
  const [history, setHistory] = useState([]);

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
    const newHistory = [record, ...history].slice(0, 50); 
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

  const HomeView = () => (
    <div className="animate-fade-in text-center">
      <div className="mb-8 mt-4">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 drop-shadow-sm pb-2 mb-4 hover:scale-105 transition-transform cursor-default leading-tight md:leading-snug">
          Math Wizard prototype for TMag
        </h1>
        <p className="text-lg text-gray-600 font-medium">An experimental App built by Ragul!</p>
      </div>

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
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Choose Magic Power</label>
          <div className="flex gap-2">
            {[
              { op: '+', active: 'bg-pink-500 text-white shadow-md scale-105 border-pink-500', inactive: 'bg-pink-50 text-pink-500 border-pink-200 hover:bg-pink-100' },
              { op: '-', active: 'bg-blue-500 text-white shadow-md scale-105 border-blue-500', inactive: 'bg-blue-50 text-blue-500 border-blue-200 hover:bg-blue-100' },
              { op: '×', active: 'bg-green-500 text-white shadow-md scale-105 border-green-500', inactive: 'bg-green-50 text-green-500 border-green-200 hover:bg-green-100' },
              { op: '÷', active: 'bg-purple-500 text-white shadow-md scale-105 border-purple-500', inactive: 'bg-purple-50 text-purple-500 border-purple-200 hover:bg-purple-100' }
            ].map(item => (
              <button
                key={item.op}
                onClick={() => setOperation(item.op)}
                className={`flex-1 py-2 px-1 rounded-xl border-2 font-bold text-xl transition-all ${
                  operation === item.op ? item.active : item.inactive
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

        {view === 'test' && (
          <div>
            <label className="flex justify-between text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
              <span>Test Time</span>
              <span className="text-indigo-600">{testDuration} Minute{testDuration > 1 ? 's' : ''}</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1" 
              value={testDuration} 
              onChange={(e) => setTestDuration(parseInt(e.target.value))}
              className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}
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
    const [feedback, setFeedback] = useState(null); 
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
    
    const [gameState, setGameState] = useState('config'); 
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answer, setAnswer] = useState('');
    const [finalStats, setFinalStats] = useState({ score: 0, timeTaken: 0 });
    
    const timerRef = useRef(null);
    const userAnswersRef = useRef([]);

    const startGame = () => {
      const TIME_LIMIT = testDuration * 60;
      
      // Generate 10 unique questions
      const qs = [];
      for(let i=0; i<TOTAL_QUESTIONS; i++) {
        let q;
        let attempts = 0;
        do {
          q = generateQuestion(operation, difficulty);
          attempts++;
        } while (
          qs.some(existing => existing.n1 === q.n1 && existing.n2 === q.n2) && 
          attempts < 20
        );
        qs.push(q);
      }
      
      setQuestions(qs);
      setUserAnswers([]);
      userAnswersRef.current = [];
      setCurrentIdx(0);
      setTimeLeft(TIME_LIMIT);
      setAnswer('');
      setGameState('playing');
    };

    const quitTest = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('config');
    };

    const finishTest = useCallback((finalAnswers, remainingTime) => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      const TIME_LIMIT = testDuration * 60;
      const score = finalAnswers.filter(a => a.isCorrect).length;
      const timeTaken = TIME_LIMIT - remainingTime;
      const stars = calculateStars(score, TOTAL_QUESTIONS);
      
      setFinalStats({ score, timeTaken });
      setGameState('summary');
      
      saveToHistory({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        operation,
        difficulty,
        score,
        total: TOTAL_QUESTIONS,
        timeTaken,
        stars
      });
    }, [operation, difficulty, testDuration]); 

    // Timer effect
    useEffect(() => {
      if (gameState === 'playing') {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              finishTest(userAnswersRef.current, 0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [gameState, finishTest]);

    const submitAnswer = (e) => {
      e.preventDefault();
      
      const numAnswer = parseFloat(answer);
      const isCorrect = answer !== '' && numAnswer === questions[currentIdx].correctAnswer;
      
      const updatedAnswers = [
        ...userAnswersRef.current, 
        { ...questions[currentIdx], userAnswer: answer === '' ? '-' : answer, isCorrect }
      ];
      
      setUserAnswers(updatedAnswers);
      userAnswersRef.current = updatedAnswers;
      
      if (currentIdx < TOTAL_QUESTIONS - 1) {
        setCurrentIdx(idx => idx + 1);
        setAnswer('');
      } else {
        finishTest(updatedAnswers, timeLeft);
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
              You will have <strong>{testDuration} minute{testDuration > 1 ? 's' : ''}</strong> to answer <strong>{TOTAL_QUESTIONS}</strong> questions. Do your best!
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
      const isLowTime = timeLeft <= 15;

      return (
        <div className="animate-fade-in pb-10">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={quitTest}
              className="px-4 py-3 bg-red-100 text-red-600 rounded-2xl shadow-sm font-bold border-2 border-red-200 hover:bg-red-200 transition-colors flex items-center gap-1"
            >
              <XCircle size={20} /> Quit
            </button>
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm font-bold text-indigo-800 border-2 border-indigo-100 text-lg">
              Q: {currentIdx + 1} / {TOTAL_QUESTIONS}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border-4 border-indigo-100 p-8 text-center relative overflow-hidden mb-8">
            {/* Big Bold Timer */}
            <div className={`text-center mb-8 pb-6 border-b-2 border-dashed ${isLowTime ? 'border-red-200' : 'border-indigo-50'}`}>
              <div className={`text-6xl md:text-7xl font-black tracking-tight flex items-center justify-center gap-3 ${
                isLowTime ? 'text-red-500 animate-pulse' : 'text-gray-800'
              }`}>
                <Clock size={48} className={isLowTime ? 'animate-bounce' : ''} /> 
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="text-7xl md:text-8xl font-black text-indigo-900 mb-8 tracking-tighter flex items-center justify-center gap-4 mt-4">
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
                className="w-full text-center text-5xl font-bold py-4 rounded-2xl border-4 bg-gray-50 border-indigo-200 focus:border-indigo-500 text-indigo-900 outline-none"
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
          
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-4 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>
      );
    }

    if (gameState === 'summary') {
      const stars = calculateStars(finalStats.score, TOTAL_QUESTIONS);
      
      return (
        <div className="animate-fade-in pb-10 text-center">
          {renderHeader('Results', false)}
          
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border-4 border-indigo-50 mt-6 relative overflow-hidden mb-6">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-50 rounded-full blur-3xl opacity-50"></div>
            
            <h2 className="text-3xl font-black text-gray-800 mb-6 relative z-10">
              {stars === 3 ? "Awesome Job! 🌟" : stars === 2 ? "Great Effort! 👍" : "Keep Practicing! 💪"}
            </h2>

            <div className="flex justify-center gap-4 mb-6 relative z-10">
              {[1, 2, 3].map(s => (
                <Star 
                  key={s} 
                  size={56} 
                  className={`transform transition-all ${
                    s <= stars ? 'fill-yellow-400 text-yellow-500 scale-110 drop-shadow-md' : 'fill-gray-100 text-gray-200'
                  }`} 
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-12 mb-8">
              <div>
                <div className="text-5xl font-black text-indigo-600">{finalStats.score} / {TOTAL_QUESTIONS}</div>
                <p className="text-gray-500 font-bold mt-1">Score</p>
              </div>
              <div className="w-1 h-16 bg-gray-100 rounded-full"></div>
              <div>
                <div className="text-4xl font-black text-gray-700 mt-1">{formatTime(finalStats.timeTaken)}</div>
                <p className="text-gray-500 font-bold mt-1">Time</p>
              </div>
            </div>

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

          {/* Answers Breakdown */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-500" /> Answer Summary
            </h3>
            <div className="space-y-3">
              {userAnswers.map((ans, idx) => (
                <div key={idx} className={`p-4 rounded-xl flex items-center justify-between border-2 ${
                  ans.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                }`}>
                  <div className="flex items-center gap-4 text-xl font-bold">
                    <span className="text-gray-400 w-6 text-sm">#{idx + 1}</span>
                    <span className="text-gray-800 w-32 tracking-wider">
                      {ans.n1} {ans.operation} {ans.n2} = 
                    </span>
                    <span className={ans.isCorrect ? 'text-green-600' : 'text-red-500 line-through decoration-2'}>
                      {ans.userAnswer}
                    </span>
                    {!ans.isCorrect && (
                      <span className="text-green-600 ml-2">{ans.correctAnswer}</span>
                    )}
                  </div>
                  <div>
                    {ans.isCorrect ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <XCircle className="text-red-500" size={24} />
                    )}
                  </div>
                </div>
              ))}
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
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-sm ${
                    record.operation === '+' ? 'bg-pink-400' :
                    record.operation === '-' ? 'bg-blue-400' :
                    record.operation === '×' ? 'bg-green-400' : 'bg-purple-400'
                  }`}>
                    {record.operation}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-gray-800 text-xl">{record.score}/{record.total}</span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded-lg">
                        {record.difficulty}
                      </span>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        ⏱️ {formatTime(record.timeTaken)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1 font-medium">{record.date}</div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {[1, 2, 3].map(s => (
                    <Star 
                      key={s} 
                      size={24} 
                      className={s <= record.stars ? 'fill-yellow-400 text-yellow-500 drop-shadow-sm' : 'fill-gray-100 text-gray-200'} 
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
