import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function App() {
  useEffect(() => {
    document.title = "Dashboard";
  });

  const [mode, setMode] = useState(0);
  const [value, setValue] = useState(0);
  const [startTime, setStartTime] = useState("06:00");
  const [stopTime, setStopTime] = useState("18:00");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const statusTimeout = useRef(null);

  const convertToSeconds = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 3600 + m * 60;
  };

  const secondsToTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    return `${h}:${m}`;
  };

  const fetchStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("❌ Token not found, please login.");
      return;
    }
    if (isEditing) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_HOST}/api/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data;
      setMode(data.mode ?? 0);
      setValue(data.value ?? 0);
      setStartTime(secondsToTime(data.startSec ?? 21600));
      setStopTime(secondsToTime(data.stopSec ?? 64800));
    } catch (err) {
      // console.error("Fetch status failed:", err);
      setStatus("❌ Failed to fetch status.");
      if (err.status == 403) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [isEditing]);

  const sendUpdate = async () => {
    const payload = {
      mode,
      value,
      startSec: convertToSeconds(startTime),
      stopSec: convertToSeconds(stopTime),
    };

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("❌ Token not found, please login.");
        setLoading(false);
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_HOST}/api/control`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setStatus("✅ Data sent successfully");
      setIsEditing(false);
    } catch (err) {
      // console.error("Send update failed:", err);
      setStatus("❌ Failed to send data");
      if (err.status == 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
      clearTimeout(statusTimeout.current);
      statusTimeout.current = setTimeout(() => setStatus(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setStatus("✅ Logged out successfully.");
    //setTimeout(() => {
      //window.location.reload();
    //}, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm transition-all duration-300">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Pompa Control Panel
        </h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Mode</label>
            <button
              className={`w-full py-2 rounded-lg transition-all duration-300 ${
                mode
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 hover:bg-gray-500"
              } text-white font-semibold`}
              onClick={() => {
                setMode(mode === 1 ? 0 : 1);
                setIsEditing(true);
              }}
            >
              {mode ? "Auto" : "Manual"}
            </button>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Pompa
            </label>
            <button
              className={`w-full py-2 rounded-lg transition-all duration-300 ${
                value
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => {
                setValue(value === 1 ? 0 : 1);
                setIsEditing(true);
              }}
              disabled={mode === 1}
            >
              {value ? "ON" : "OFF"}
            </button>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Start Time (Auto Mode)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setIsEditing(true);
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Stop Time (Auto Mode)
            </label>
            <input
              type="time"
              value={stopTime}
              onChange={(e) => {
                setStopTime(e.target.value);
                setIsEditing(true);
              }}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-gray-300"
            />
          </div>

          <button
            onClick={sendUpdate}
            disabled={loading}
            className={`w-full py-3 mt-2 rounded-lg font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              loading
                ? "bg-indigo-300 cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Sending..." : "Send to ESP"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 mt-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Logout
          </button>

          {status && (
            <div
              className={`mt-4 text-center text-sm px-4 py-2 rounded-lg ${
                status.includes("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
