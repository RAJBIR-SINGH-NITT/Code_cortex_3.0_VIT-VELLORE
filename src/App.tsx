import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Analyze from "./pages/Analyze.jsx";
import History from "./pages/History.jsx";
import { LogoMark } from "./components/Icons.jsx";
import { getHealth, getModelInfo } from "./api/triageApi.js";

type Route = "home" | "analyze" | "history";

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  return h === "analyze" || h === "history" ? h : "home";
}

const CHECKING_HEALTH = { overall: "checking", backend: null, ai: null, database: null, raw: null };

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [health, setHealth] = useState<any>(CHECKING_HEALTH);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  // Hash-based routing: #/ , #/analyze , #/history
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  // Health polling + model info (never throws — falls back gracefully).
  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      const h = await getHealth();
      if (!stopped) setHealth(h);
    };
    poll();
    const id = window.setInterval(poll, 20000);
    getModelInfo().then((m: any) => {
      if (!stopped) setModelInfo(m);
    });
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar route={route} />

      <main className="flex-1">
        <div key={route} className="animate-fade-in">
          {route === "home" && (
            <Home health={health} modelInfo={modelInfo} historyVersion={historyVersion} />
          )}
          {route === "analyze" && (
            <Analyze onAnalyzed={() => setHistoryVersion((v) => v + 1)} />
          )}
          {route === "history" && <History historyVersion={historyVersion} />}
        </div>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-6 w-6 text-brand-600" />
            <p className="text-sm font-bold text-ink-700">
              SecureFile AI{" "}
              <span className="font-semibold text-ink-400">— Simple malware triage for Windows files.</span>
            </p>
          </div>
          <p className="text-xs font-semibold text-ink-400">
            Hackathon prototype · Team Garnet Chronicles · Results are guidance, not a guarantee.
          </p>
        </div>
      </footer>
    </div>
  );
}
