import React, { useState, useEffect } from "react";
import axios from "axios";
// import "dotenv/config";

export default function App() {
  const [mode, setMode] = useState(0); // 0 = manual, 1 = auto
  const [value, setValue] = useState(0); // 0 = OFF, 1 = ON
  const [startTime, setStartTime] = useState("00:00");
  const [stopTime, setStopTime] = useState("00:00");
  const [status, setStatus] = useState("");

  // Fetch current status from backend
  // console.log(process.env.BACKEND_HOST);
  useEffect(() => {
    axios
      .get("https://backend-pump-control-production.up.railway.app/api/status")
      .then((res) => {
        const data = res.data;
        setMode(data.mode);
        setValue(data.value);
        setStartTime(data.startSec);
        setStopTime(data.stopSec);
      })
      .catch((err) => console.error("Fetch status error:", err));
  }, []);

  const convertToSeconds = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 3600 + m * 60;
  };

  const sendUpdate = async () => {
    console.log(convertToSeconds(startTime));
    const payload = {
      mode,
      value,
      startSec: convertToSeconds(startTime),
      stopSec: convertToSeconds(stopTime),
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_HOST}/api/control`,
        payload
      );
      setStatus("✅ Data sent to ESP!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to send data.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Pompa Control Panel
        </h1>

        <div className="mb-4">
          <label className="block mb-1">Mode</label>
          <button
            className={`w-full py-2 rounded ${
              mode ? "bg-blue-500" : "bg-gray-400"
            } text-white`}
            onClick={() => setMode((prev) => 1 - prev)}
          >
            {mode ? "Auto" : "Manual"}
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Pompa</label>
          <button
            className={`w-full py-2 rounded ${
              value ? "bg-green-500" : "bg-red-500"
            } text-white`}
            onClick={() => setValue((prev) => 1 - prev)}
            disabled={mode === 1}
          >
            {value ? "ON" : "OFF"}
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Start Time (Auto Mode)</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Stop Time (Auto Mode)</label>
          <input
            type="time"
            value={stopTime}
            onChange={(e) => setStopTime(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <button
          onClick={sendUpdate}
          className="w-full py-2 mt-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Sent to ESP
        </button>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
        )}
      </div>
    </div>
  );
}
