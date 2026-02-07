import { useEffect, useRef, useState } from "react";
import { loadSmplrJs } from "@smplrspace/smplr-loader";
import "./App.css";

type ViewMode = "2d" | "3d";

export default function App() {
  const spaceRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let spaceInstance: any = null;

    async function init() {
      try {
        const spaceId = import.meta.env.VITE_SPACE_ID as string | undefined;
        const clientToken = import.meta.env.VITE_CLIENT_TOKEN as string | undefined;

        if (!spaceId || !clientToken) {
          throw new Error("Missing VITE_SPACE_ID or VITE_CLIENT_TOKEN. Add them to .env.local.");
        }

        const smplr = await loadSmplrJs("esm", "prod");

        spaceInstance = new smplr.Space({
          spaceId,
          clientToken,
          containerId: "smplr-container",
        });

        spaceRef.current = spaceInstance;

        spaceInstance.startViewer({
          preview: true,
          mode: "3d",
          allowModeChange: true,
          onModeChange: (m: ViewMode) => setViewMode(m),
          onReady: () => {
            if (disposed) return;
            setReady(true);
          },
          onError: (e: unknown) => {
            console.error("[Smplr] viewer error:", e);
            if (disposed) return;
            setError("Viewer failed to start. Check your Space ID / Token and console logs.");
          },
        });
      } catch (e: any) {
        console.error("[Smplr] init error:", e);
        if (!disposed) setError(e?.message || "Failed to initialize viewer.");
      }
    }

    init();

    return () => {
      disposed = true;
      try {
        spaceInstance?.remove?.();
      } catch {
        // ignore
      }
      spaceRef.current = null;
    };
  }, []);

  const toggleView = () => {
    const space = spaceRef.current;
    if (!space) return;
    const next: ViewMode = viewMode === "3d" ? "2d" : "3d";
    setViewMode(next);
    try {
      space.setMode(next);
    } catch (e) {
      console.error("[Smplr] setMode error:", e);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="mark" />
          <div className="brandText">
            <div className="title">Interactive 3D Rendering Demo</div>
            <div className="subtitle">Manager-facing example output</div>
          </div>
        </div>

        <div className="controls">
          <div className={`pill ${ready ? "ok" : ""}`}>{ready ? "Live" : "Loading"}</div>
          <button className="btn" onClick={toggleView} disabled={!ready} title="Toggle 2D/3D">
            {viewMode === "3d" ? "Switch to 2D" : "Switch to 3D"}
          </button>
        </div>
      </header>

      <main className="content">
        <section className="blurbCard">
          <p className="blurb">
            This project combines <b>physical</b> and <b>virtual</b> components, so it’s difficult to share the full
            system through a purely visual web interface. Instead, we provide this <b>interactive 3D rendering</b> as an
            example of the type of output our pipeline generates for managers.
          </p>
          <p className="muted">
            Tip: drag to orbit, scroll to zoom. Use the 2D/3D toggle in the top right.
          </p>
        </section>

        <section className="viewerCard">
          {error ? (
            <div className="error">
              <div className="errorTitle">Couldn’t load the viewer</div>
              <div className="errorMsg">{error}</div>
              <div className="errorHint">
                Make sure <code>.env.local</code> contains <code>VITE_SPACE_ID</code> and <code>VITE_CLIENT_TOKEN</code>.
              </div>
            </div>
          ) : (
            <>
              <div id="smplr-container" className="viewer" />
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} — Demo rendering</span>
      </footer>
    </div>
  );
}
