import { useEffect, useRef, useState } from "react";
import { report, number } from "./content/report";
import { dataset, simulate, evaluate } from "./lib/fakeData";

const points = dataset(report.seed);
export function Plot({ kind = "scatter" }: { kind?: string }) {
  const title =
    kind === "scatter"
      ? "Впевненість зростає, точність падає"
      : kind === "distribution"
        ? "Умовний розподіл доказів"
        : kind === "stability"
          ? "Коливання навколо хибної позиції"
          : kind === "cumulative"
            ? "Накопичення доказів"
            : "Помилковість зростає з кожним раундом";
  const series = Array.from({ length: 60 }, (_, i) => {
    const x = i / 59;
    return [
      54 + x * 600,
      288 -
        (kind === "cumulative"
          ? (1 - Math.exp(-x * 4)) * 230
          : kind === "distribution"
            ? Math.exp(-(((x - 0.73) / 0.16) ** 2)) * 230
            : kind === "stability"
              ? 135 + Math.sin(i * 1.5) * 7
              : 25 + x * 195 + Math.sin(i * 0.5) * 10),
    ];
  });
  return (
    <svg className="plot" viewBox="0 0 710 340" role="img" aria-label={title}>
      <title>{title} — вигадані дані</title>
      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}>
          <line
            x1="54"
            x2="654"
            y1={288 - t * 2.4}
            y2={288 - t * 2.4}
            className="gridline"
          />
          <text x="36" y={293 - t * 2.4} textAnchor="end">
            {t}
          </text>
          <text x={54 + t * 6} y="315" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x="54" y="22">
        {kind === "scatter" ? "ТОЧНІСТЬ, %" : "УМОВНИЙ ІНДЕКС"}
      </text>
      <text x="654" y="337" textAnchor="end">
        {kind === "scatter" ? "ВПЕВНЕНІСТЬ, %" : "НОРМАЛІЗОВАНА ШКАЛА →"}
      </text>
      {kind === "scatter" ? (
        <>
          <g className="dots">
            {points.map((p, i) => (
              <circle
                key={i}
                cx={54 + p.x * 6}
                cy={288 - p.y * 2.4}
                r={i === 90 ? 6 : 3.5}
                className={i === 90 ? "special" : ""}
              >
                <title>
                  {i === 90 ? "Потрібне джерело. " : ""}Впевненість{" "}
                  {number(p.x)}%, точність {number(p.y)}%
                </title>
              </circle>
            ))}
          </g>
          <path className="draw regression" d="M54 62L654 256" />
          <text x="420" y="80" className="annotation">
            r = −0,81
          </text>
          <text x="420" y="102">
            переконаність ≠ доказ
          </text>
        </>
      ) : (
        <path
          className="draw data-line"
          d={series.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ")}
        />
      )}
    </svg>
  );
}
export function Surface() {
  return (
    <svg
      className="surface"
      viewBox="0 0 580 430"
      role="img"
      aria-label="Умовна поверхня: впевненість і впертість збільшують індекс помилковості"
    >
      <title>
        W = C × S² / (E + 1). Декоративна проєкція вигаданої моделі.
      </title>
      {Array.from({ length: 19 }, (_, j) => (
        <path
          key={j}
          d={Array.from({ length: 25 }, (_, i) => {
            const x = i / 24,
              y = j / 18;
            return `${i ? "L" : "M"}${58 + x * 300 + y * 160},${355 - x * 70 - y * 38 - 190 * x * y * y}`;
          }).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
        />
      ))}
      {Array.from({ length: 25 }, (_, j) => (
        <path
          key={"b" + j}
          d={Array.from({ length: 19 }, (_, i) => {
            const x = j / 24,
              y = i / 18;
            return `${i ? "L" : "M"}${58 + x * 300 + y * 160},${355 - x * 70 - y * 38 - 190 * x * y * y}`;
          }).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
        />
      ))}
      <path
        d="M58 355L58 90M58 355L358 285M58 355L218 317"
        fill="none"
        stroke="currentColor"
      />
      <text x="40" y="75">
        W
      </text>
      <text x="385" y="304">
        ВПЕВНЕНІСТЬ
      </text>
      <text x="140" y="390">
        ВПЕРТІСТЬ →
      </text>
      <circle cx="518" cy="57" r="4" fill="currentColor" />
      <text x="350" y="30">
        ЗОНА ПЕРЕКОНАНОСТІ
      </text>
      <path d="M465 36L515 52" stroke="currentColor" />
    </svg>
  );
}
export function Interval() {
  return (
    <div className="interval">
      <div className="interval-value">
        {number(report.statistics.wrongness)}
        <span>індекс помилковості</span>
      </div>
      <svg
        viewBox="0 0 700 130"
        role="img"
        aria-label="Умовний 95-відсотковий інтервал: від 84,1 до 91,8"
      >
        <path d="M30 60H670" className="gridline" />
        {[80, 85, 90, 95, 100].map((n, i) => (
          <g key={n}>
            <path d={`M${30 + i * 160} 54v12`} stroke="currentColor" />
            <text x={30 + i * 160} y="103" textAnchor="middle">
              {n}
            </text>
          </g>
        ))}
        <g className="ci-range">
          <path
            d="M161 60H408M161 40V80M408 40V80"
            stroke="var(--accent)"
            strokeWidth="3"
          />
          <circle cx="267" cy="60" r="8" fill="var(--accent)" />
        </g>
        <text x="161" y="25" textAnchor="middle">
          84,1
        </text>
        <text x="408" y="25" textAnchor="middle">
          91,8
        </text>
      </svg>
      <p className="mono">95% ДІ: [помиляється; сильно помиляється]¹</p>
    </div>
  );
}
export function MonteCarlo({ motion }: { motion: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState(0);
  const data = useRef(
    simulate(report.seed, 10000, report.statistics.simulationWin),
  );
  useEffect(() => {
    if (!run) return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let start = 0;
    let previous = -1;
    setRunning(true);
    ctx.clearRect(0, 0, 1000, 560);
    const draw = (time: number) => {
      if (!start) start = time;
      const n = motion
        ? Math.min(10000, Math.floor(((time - start) / 2800) * 10000))
        : 10000;
      for (let i = previous + 1; i < n; i++) {
        ctx.fillStyle = data.current[i] ? "#d5ddc7" : "#ef816b";
        ctx.fillRect((i % 125) * 8, Math.floor(i / 125) * 7, 4, 4);
      }
      previous = n - 1;
      setCount(n);
      if (n < 10000) frame = requestAnimationFrame(draw);
      else setRunning(false);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [run, motion]);
  const wins = data.current.slice(0, count).filter(Boolean).length;
  return (
    <div className="simulation">
      <div className="sim-toolbar">
        <span className="mono">SEED {report.seed} / N = 10 000</span>
        <button
          disabled={running}
          onClick={() => {
            setCount(0);
            setRun((v) => v + 1);
          }}
        >
          {running
            ? "Обчислюємо…"
            : run
              ? "Повторити симуляцію ↻"
              : "Запустити 10 000 сценаріїв ↗"}
        </button>
      </div>
      <div className="canvas-wrap">
        <canvas
          ref={canvas}
          width="1000"
          height="560"
          role="img"
          aria-label={`Виграна частка: ${count ? number((wins / count) * 100) : 0}%. ${count} з 10000 синтетичних сценаріїв.`}
        />
        {!run && (
          <div className="canvas-idle">
            <span>10⁴</span>
            <p>способів дійти того самого висновку.</p>
          </div>
        )}
      </div>
      <div className="sim-results" aria-live="polite" aria-busy={running}>
        <div>
          <span>{report.myPosition}</span>
          <strong>
            {count ? number((wins / count) * 100) : "—"}
            <small>%</small>
          </strong>
        </div>
        <div>
          <span>{report.friendPosition}</span>
          <strong>
            {count ? number(((count - wins) / count) * 100) : "—"}
            <small>%</small>
          </strong>
        </div>
        <div>
          <span>Сценаріїв опрацьовано</span>
          <strong>{count.toLocaleString("uk-UA")}</strong>
        </div>
      </div>
      <p className="fine">
        У {number(report.statistics.gaveUp)}% сценаріїв дослідники також
        здалися. Це окрема вигадана ознака, яка перетинається з результатами, а
        не третя категорія.
      </p>
    </div>
  );
}
export function Risk() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="risk-layout">
      <div>
        <p className="mono">ВПЛИВ ↑</p>
        <div className="risk-grid">
          {Array.from({ length: 25 }, (_, i) => {
            const x = (i % 5) + 1,
              y = 5 - Math.floor(i / 5),
              risk = report.risks.findIndex((r) => r.x === x && r.y === y);
            return (
              <div
                key={i}
                style={{ background: `rgba(181,55,39,${0.03 + (x * y) / 70})` }}
              >
                {risk >= 0 ? (
                  <button
                    aria-label={report.risks[risk].name}
                    aria-pressed={selected === risk}
                    onFocus={() => setSelected(risk)}
                    onMouseEnter={() => setSelected(risk)}
                    onClick={() => setSelected(risk)}
                  >
                    {String(risk + 1).padStart(2, "0")}
                  </button>
                ) : (
                  <span aria-hidden="true">·</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mono align-right">ЙМОВІРНІСТЬ →</p>
      </div>
      <div className="risk-detail" aria-live="polite">
        <span className="big-index">0{selected + 1}</span>
        <h4>{report.risks[selected].name}</h4>
        <p>{report.risks[selected].detail}</p>
        <span className="mono">
          ЙМОВІРНІСТЬ {report.risks[selected].x}/5 · ВПЛИВ{" "}
          {report.risks[selected].y}/5
        </span>
      </div>
    </div>
  );
}
export function Network() {
  return (
    <svg
      className="network"
      viewBox="0 0 900 400"
      role="img"
      aria-label="Декоративна нейромережа: докази проходять крізь раціоналізацію та підсилення впевненості до виходу «Неправильно»"
    >
      <title>Ілюстрація, а не навчена нейромережа</title>
      {[0, 1, 2].flatMap((layer) =>
        Array.from({ length: layer === 0 ? 6 : 4 }, (_, i) =>
          Array.from({ length: 4 }, (_, j) => (
            <path
              key={`${layer}-${i}-${j}`}
              className="signal"
              d={`M${170 + layer * 205} ${layer === 0 ? 55 + i * 53 : 85 + i * 77}L${375 + layer * 205} ${85 + j * 77}`}
              style={{ animationDelay: `${(i + j) * 0.13}s` }}
            />
          )),
        ),
      )}
      {report.network.map((n, i) => (
        <g key={n}>
          <text x="145" y={60 + i * 53} textAnchor="end">
            {n}
          </text>
          <circle cx="170" cy={55 + i * 53} r="7" />
        </g>
      ))}
      {[1, 2, 3].map((l) =>
        Array.from({ length: 4 }, (_, i) => (
          <circle
            key={`${l}-${i}`}
            cx={170 + l * 205}
            cy={85 + i * 77}
            r={l === 3 ? 11 : 8}
          />
        )),
      )}
      <text x="375" y="370" textAnchor="middle">
        Раціоналізація
      </text>
      <text x="580" y="370" textAnchor="middle">
        Вибіркова пам’ять
      </text>
      <text x="785" y="370" textAnchor="middle">
        Підсилення
      </text>
      <text x="785" y="35" textAnchor="middle" className="annotation">
        НЕПРАВИЛЬНО
      </text>
    </svg>
  );
}
export function Argument() {
  const [active, setActive] = useState(0);
  return (
    <div className="argument">
      <div className="graph-root">{report.disagreement}</div>
      <div className="graph-branches">
        {report.graph.map(([name], i) => (
          <button
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            key={name}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="graph-explanation" aria-live="polite">
        {report.graph[active][1]}
      </p>
      <div className="graph-end">{report.friendName} помиляється ↓</div>
    </div>
  );
}
export function LiveModel() {
  const defaults = Object.fromEntries(
    report.sliders.map(([key, , value]) => [key, value]),
  );
  const [values, setValues] = useState(defaults);
  const result = evaluate(values);
  return (
    <div className="live-model">
      <div className="controls">
        {report.sliders.map(([key, label]) => (
          <label key={key} htmlFor={`control-${key}`}>
            <span>
              {label}
              <output htmlFor={`control-${key}`}>{values[key]}</output>
            </span>
            <input
              id={`control-${key}`}
              type="range"
              min="0"
              max="100"
              value={values[key]}
              onChange={(e) =>
                setValues({ ...values, [key]: Number(e.target.value) })
              }
            />
          </label>
        ))}
        <button className="text-button" onClick={() => setValues(defaults)}>
          Відновити параметри ↺
        </button>
      </div>
      <div className="model-output">
        <span className="mono">ЙМОВІРНІСТЬ ПОМИЛКИ</span>
        <output aria-live="polite" aria-atomic="true">
          <strong>
            {number(result.probability)}
            <small>%</small>
          </strong>
          <span>
            {result.compromised
              ? "Цілісність моделі порушено."
              : `${report.friendName} ПОМИЛЯЄТЬСЯ`}
          </span>
        </output>
        <svg viewBox="0 0 340 180" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <line
              key={i}
              x1={10 + i * 8}
              x2={10 + i * 8}
              y1="160"
              y2={
                160 -
                Math.exp(-(((i - (result.probability / 100) * 39) / 7) ** 2)) *
                  140
              }
              stroke={result.compromised ? "var(--muted)" : "var(--accent)"}
              strokeWidth="4"
            />
          ))}
        </svg>
        <p>
          Умовна оцінка, а не статистичний прогноз. Модель створена для жарту й
          відкрито упереджена.
        </p>
      </div>
    </div>
  );
}
