"use client";

import { useEffect, useState } from "react";
import { SYMBOLS, SymbolType, API_BASE_URL } from "@/constants/symbols";

interface Summary {
  scrapedAt: string;
  symbol: string;
  trend: string;
  latest: {
    date: string;
    day: string;
    high: number;
    low: number;
    close: number;
    settlement: number;
  };
  nextTradingDay: {
    date: string;
    day: string;
  };
  camarillaLevels: Record<string, number>;
}

// สีพื้นหลังของวัน
const dayColors: Record<string, string> = {
  Mon: "bg-yellow-400 text-white",
  Tue: "bg-pink-400 text-white",
  Wed: "bg-green-400 text-white",
  Thu: "bg-orange-400 text-white",
  Fri: "bg-sky-400 text-white",
  Sat: "bg-purple-400 text-white",
  Sun: "bg-red-400 text-white",
};

function SummaryCard({
  data,
  type,
  showBacklog,
}: {
  data: Summary;
  type: SymbolType;
  showBacklog: boolean;
}) {
  const [trend, setTrend] = useState(data.trend);

  const [latestDay, setLatestDay] = useState({
    ...data.latest,
  });

  const [nextDay, setNextDay] = useState({
    ...data.nextTradingDay,
  });

  const isOut = trend.toLowerCase() === "out";
  const trendColor = isOut ? "bg-red-500 text-white" : "bg-green-500 text-white";

  const latestDayColor = dayColors[latestDay.day] || "bg-gray-400 text-white";
  const nextDayColor = dayColors[nextDay.day] || "bg-gray-400 text-white";

  const toggleTrend = () => {
    setTrend((prev) => (prev.toLowerCase() === "out" ? "In" : "Out"));
  };

  function addOneDay(dateStr: string): { date: string; day: string } {
    const [d, m, y] = dateStr.split("/").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + 1);

    const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
    const newDate = dt.toLocaleDateString("en-GB");

    return { date: newDate, day: dayShort };
  }

  const handleLatestDay = () => {
    const next = addOneDay(latestDay.date);
    setLatestDay({
      ...latestDay,
      date: next.date,
      day: next.day,
    });
  };

  const handleNextDay = () => {
    const next = addOneDay(nextDay.date);
    setNextDay({
      ...nextDay,
      date: next.date,
      day: next.day,
    });
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-2xl 
      shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-sm mx-auto 
      backdrop-blur-md bg-white/40 border border-white/30 text-gray-900"
    >
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {type === SYMBOLS.GO ? (
          <>
            <button
              onClick={handleLatestDay}
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${latestDayColor}`}
            >
              {latestDay.date} {latestDay.day}
            </button>

            <button
              onClick={handleNextDay}
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${nextDayColor}`}
            >
              {nextDay.date} {nextDay.day}
            </button>
          </>
        ) : (
          <button
            onClick={handleNextDay}
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${nextDayColor}`}
          >
            {nextDay.date} {nextDay.day}
          </button>
        )}

        <button
          onClick={toggleTrend}
          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${trendColor}`}
        >
          {trend}
        </button>
      </div>

      <h2 className="text-xl font-bold mb-3">{data.symbol}</h2>

      {/* Camarilla */}
      <div className="w-full flex justify-center">
        <div className="w-fit text-sm space-y-0.5">
          {Object.entries(data.camarillaLevels).map(([key, value]) => {
            const formattedValue = value.toFixed(2);

            let textColor = "";
            if (key.startsWith("H"))
              textColor = key === "H06" || key === "H05" ? "text-red-700" : "text-red-500";
            else if (key.startsWith("L"))
              textColor = key === "L05" || key === "L06" ? "text-green-700" : "text-green-600";

            return (
              <div
                key={key}
                className="w-full px-3 py-0.5 rounded-lg bg-white/50 
                border border-white/30 shadow-sm backdrop-blur-sm 
                flex justify-center"
              >
                <div className="flex items-center font-mono">
                  <span className={`font-semibold ${textColor}`}>{key}</span>
                  <span className="mx-5" />
                  <span className={textColor}>{formattedValue}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔥 Backlog Section */}
      {showBacklog && (
        <div className="w-full border-t border-white/40 pt-2 mt-2 text-xs text-gray-800 text-center">
          <p>
            <b>High:</b> {latestDay.high.toFixed(2)} &nbsp;
            <b>Low:</b> {latestDay.low.toFixed(2)}
          </p>
          <p>
            <b>Close:</b> {latestDay.close.toFixed(2)} &nbsp;
            <b>Settle:</b> {latestDay.settlement.toFixed(2)}
          </p>
          <p>
            <b>Ref. Date:</b> {latestDay.date} {latestDay.day} &nbsp;
            <b>Trend:</b> {trend}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [s50, setS50] = useState<Summary | null>(null);
  const [go, setGO] = useState<Summary | null>(null);
  const [showBacklog, setShowBacklog] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [s50Data, goData] = await Promise.all([
        fetch(`${API_BASE_URL}/${SYMBOLS.S50.toLowerCase()}/summary`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/${SYMBOLS.GO.toLowerCase()}/summary`).then((r) => r.json()),
      ]);
      setS50(s50Data);
      setGO(goData);
    }
    fetchData();
  }, []);

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen
      bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100 p-3 space-y-4"
    >
      {s50 && <SummaryCard data={s50} type={SYMBOLS.S50} showBacklog={showBacklog} />}
      {go && <SummaryCard data={go} type={SYMBOLS.GO} showBacklog={showBacklog} />}
      {(!s50 || !go) && <p className="text-gray-600 text-sm animate-pulse">Loading data...</p>}
      <button
        onClick={() => setShowBacklog((s) => !s)}
        className="px-4 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        {showBacklog ? "Hide Backlog" : "Show Backlog"}
      </button>
    </main>
  );
}
