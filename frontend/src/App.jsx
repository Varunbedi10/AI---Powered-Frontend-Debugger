import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState("");

  const handleSubmit = async () => {
    setError("");
    setAnalysis("");

    if (!url || !/^https?:\/\/[^\s]+$/.test(url)) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      console.log("Fetched HTML:", data.html);

      if (!data.html) {
        setError("No HTML received from the webpage.");
        return;
      }

      const aiResponse = await fetch("http://localhost:5000/analyze-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: data.html }),
      });

      const aiData = await aiResponse.json();
      console.log("AI Analysis:", aiData.analysis);
      setAnalysis(aiData.analysis);
    } catch (error) {
      setError("Error fetching webpage data or analyzing it");
      console.error("Error during fetch:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Section (1/3) - Input & Button */}
      <div className="w-1/3 bg-gray-800 p-6 flex flex-col justify-center">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          AI-Powered Frontend Debugger
        </h1>

        <input
          type="text"
          className="w-full p-2 border border-gray-500 rounded-lg mb-4 bg-gray-700 text-white"
          placeholder="Enter URL to analyze"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg mt-4"
        >
          Analyze
        </button>
      </div>

      {/* Right Section (Expands Fully) - Display Response */}
      <div className="flex-1 p-6 overflow-auto bg-black">
        <h3 className="text-lg font-bold mb-2">AI Analysis Result:</h3>

        {analysis ? (
          <div className="p-4 border border-gray-500 rounded-lg bg-gray-800 overflow-auto max-h-[80vh]">
            {analysis.split("\n").map((line, index) => (
              <p key={index} className="text-gray-300 mb-2">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">
            No analysis yet. Enter a URL and click Analyze.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
