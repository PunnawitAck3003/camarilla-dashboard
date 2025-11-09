"use client";

import { useEffect, useState } from "react";

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
  Sun: "bg-gray-400 text-white",
};

export default function Page() {
  const [s50z25, setS50Z25] = useState<Summary | null>(null);
  const [goz25, setGOZ25] = useState<Summary | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [s50, goz] = await Promise.all([
        fetch("https://camarilla-api.vercel.app/api/v1/tfex/s50z25/summary").then((r) => r.json()),
        fetch("https://camarilla-api.vercel.app/api/v1/tfex/goz25/summary").then((r) => r.json()),
      ]);
      setS50Z25(s50);
      setGOZ25(goz);
    }
    fetchData();
  }, []);

  const renderSummary = (data: Summary, type: "S50Z25" | "GOZ25") => {
    const isOut = data.trend.toLowerCase() === "out";
    const trendColor = isOut ? "bg-red-500 text-white" : "bg-green-500 text-white";

    const nextDayColor = dayColors[data.nextTradingDay.day] || "bg-gray-400 text-white";
    const latestDayColor = dayColors[data.latest.day] || "bg-gray-400 text-white";

    return (
      <div
        className="flex flex-col items-center justify-center p-4 rounded-2xl 
        shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-sm mx-auto 
        backdrop-blur-md bg-white/40 border border-white/30 text-gray-900"
      >
        {/* Header section */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {type === "GOZ25" ? (
            <>
              <button
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${latestDayColor}`}
              >
                {data.latest.date} {data.latest.day}
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${nextDayColor}`}
              >
                {data.nextTradingDay.date} {data.nextTradingDay.day}
              </button>
            </>
          ) : (
            <button
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm ${nextDayColor}`}
            >
              {data.nextTradingDay.date} {data.nextTradingDay.day}
            </button>
          )}

          {/* Trend button */}
          <button
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${trendColor}`}
          >
            {data.trend}
          </button>
        </div>

        {/* Symbol header */}
        <h2 className="text-xl font-bold mb-3 drop-shadow-sm">{data.symbol}</h2>

        {/* Camarilla levels */}
        <div className="w-full flex justify-center">
          <div className="w-fit text-sm space-y-0.5">
            {Object.entries(data.camarillaLevels).map(([key, value]) => {
              const formattedValue = value.toFixed(2); // ✅ ทศนิยม 2 ตำแหน่งเสมอ

              // ✅ เงื่อนไขสี
              let textColor = "";
              if (key.startsWith("H")) {
                textColor =
                  key === "H06" || key === "H05" ? "text-red-700" : "text-red-500";
              } else if (key.startsWith("L")) {
                textColor =
                  key === "L05" || key === "L06" ? "text-green-700" : "text-green-600";
              }

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
                    <span className={`${textColor}`}>{formattedValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backlog section */}
        <div className="w-full border-t border-white/40 pt-2 mt-2 text-xs text-gray-800 text-center">
          <p>
            <b>High:</b> {data.latest.high.toFixed(2)} &nbsp;
            <b>Low:</b> {data.latest.low.toFixed(2)}
          </p>
          <p>
            <b>Close:</b> {data.latest.close.toFixed(2)} &nbsp;
            <b>Settle:</b> {data.latest.settlement.toFixed(2)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen
      bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100 p-3 space-y-4"
    >
      {s50z25 && renderSummary(s50z25, "S50Z25")}
      {goz25 && renderSummary(goz25, "GOZ25")}
      {!s50z25 && !goz25 && (
        <p className="text-gray-600 text-sm animate-pulse">Loading data...</p>
      )}
    </main>
  );
}
