"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type AnalysisResult = {
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  improvement_suggestions: string[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://resume-analyzer-backend.onrender.com";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {
    if (!resumeText && !file) {
      alert("Please paste resume text OR upload a PDF");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append("resume", file);

        response = await fetch(`${API_BASE}/analyze-pdf`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText }),
        });
      }

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 text-white">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-3 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Resume Analyzer
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Smart ATS evaluation powered by AI
        </p>

        {/* Textarea */}
        <textarea
          placeholder="Paste your resume here..."
          className="w-full h-40 p-4 rounded-xl bg-white/15 border border-white/25 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 resize-none"
          value={resumeText}
          onChange={(e) => {
            setResumeText(e.target.value);
            setFile(null);
          }}
        />

        {/* Divider */}
        <div className="text-center text-gray-500 mb-4">— OR —</div>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
                setResumeText("");
              }
            }}
            className="w-full p-3 rounded-xl bg-white/15 border border-white/25 text-gray-200 file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-none hover:file:bg-blue-700 transition"
          />
        </div>

        {/* Button */}
        <button
          onClick={analyzeResume}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg
          ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-[1.02] hover:shadow-xl"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </div>
          ) : (
            "Analyze Resume"
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-10">
            {/* ATS SCORE SECTION */}
            <div className="flex flex-col items-center mb-8">
              <ScoreCircle score={result.ats_score} />

              <button
                onClick={async () => {
                  const response = await fetch(
                    "http://your-backend-name.onrender.com/download-report",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(result),
                    },
                  );

                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "resume-analysis-report.pdf";
                  a.click();
                }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold text-white shadow-lg hover:scale-105 transition-all duration-300"
              >
                Download Detailed PDF Report
              </button>
            </div>

            {/* ANALYSIS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card title="Strengths" items={result.strengths} />
              <Card title="Weaknesses" items={result.weaknesses} />
              <Card title="Missing Skills" items={result.missing_skills} />
              <Card
                title="Improvement Suggestions"
                items={result.improvement_suggestions}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800/70 border border-slate-700 p-6 rounded-2xl shadow-xl hover:shadow-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
    >
      <h3 className="text-lg font-semibold mb-4 text-blue-300 tracking-wide">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-gray-400 italic">No major issues detected.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-gray-100 leading-relaxed"
            >
              <span className="text-blue-400 mt-1 text-lg">•</span>
              <span className="text-gray-100 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 90;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(counter);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [score]);

  const getStrokeColor = () => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#facc15";
    return "#ef4444";
  };

  return (
    <div className="relative w-56 h-56">
      <svg height="100%" width="100%">
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="50%"
          cy="50%"
        />
        <motion.circle
          stroke={getStrokeColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="50%"
          cy="50%"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold text-white">
          {displayScore}
        </span>
        <span className="text-gray-400 text-sm uppercase tracking-wider">
          ATS Score
        </span>
      </div>
    </div>
  );
}
