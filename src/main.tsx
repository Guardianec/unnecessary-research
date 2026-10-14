import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@fontsource/pt-serif/cyrillic-400.css";
import "@fontsource/pt-serif/latin-400.css";
import "@fontsource/pt-serif/cyrillic-400-italic.css";
import "@fontsource/ibm-plex-sans/cyrillic-400.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/cyrillic-500.css";
import "@fontsource/ibm-plex-mono/cyrillic-400.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import { report as r, number } from "./content/report";
import {
  Plot,
  Surface,
  Interval,
  MonteCarlo,
  Risk,
  Network,
  Argument,
  LiveModel,
} from "./Charts";
import { weighted } from "./lib/fakeData";
import "./style.css";

function Exhibit({
  n,
  children,
  className = "",
}: {
  n: number;
  children?: ReactNode;
  className?: string;
}) {
  const [title, body] = r.exhibits[n - 1];
  return (
    <article className={`exhibit ${className}`} id={`exhibit-${n}`}>
      <div className="exhibit-head">
        <span className="mono">ЕКСПОНАТ {String(n).padStart(2, "0")}</span>
        <h3>{title}</h3>
      </div>
      <p className="exhibit-copy">{body}</p>
      {children}
    </article>
  );
}
function Chapter({
  id,
  no,
  title,
  subtitle,
  children,
  dark = false,
}: {
  id: string;
  no: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section id={id} className={`chapter ${dark ? "dark" : ""}`}>
      <div className="chapter-heading">
        <span className="chapter-number">{no}</span>
        <div>
          <p className="eyebrow">ДОСЛІДНИЦЬКИЙ РОЗДІЛ / {no}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function Formula({ tex }: { tex: string }) {
  const element = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  useEffect(() => {
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void import("katex").then(({ default: katex }) => {
            if (!cancelled)
              setHtml(
                katex.renderToString(tex, {
                  throwOnError: false,
                  displayMode: true,
                  output: "htmlAndMathml",
                }),
              );
          });
        }
      },
      { rootMargin: "300px" },
    );
    if (element.current) observer.observe(element.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [tex]);
  return (
    <div ref={element} className="formula" aria-busy={!html}>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code>{tex}</code>
      )}
    </div>
  );
}
function App() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("summary");
  const [progress, setProgress] = useState(0);
  const [motion, setMotion] = useState(
    () =>
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      r.animationIntensity > 0,
  );
  const [notice, setNotice] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.title = `Кількісний аналіз того, чому ${r.friendName} помиляється`;
    console.info("Peer review failed successfully.");
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setMotion(!media.matches && r.animationIntensity > 0);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
    document.documentElement.style.setProperty(
      "--duration",
      `${1400 / Math.max(0.1, r.animationIntensity)}ms`,
    );
  }, [motion]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          e.target.classList.toggle("in-view", e.isIntersecting);
          if (e.isIntersecting && e.target.classList.contains("chapter"))
            setActive(e.target.id);
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".chapter,.exhibit")
      .forEach((el) => observer.observe(el));
    let scheduled = false;
    const scroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        setProgress(
          (window.scrollY /
            Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight,
            )) *
            100,
        );
        scheduled = false;
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu) {
        setMenu(false);
        menuButton.current?.focus();
      }
      if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const i = r.chapters.findIndex(([id]) => id === active);
        const next =
          r.chapters[
            Math.max(
              0,
              Math.min(
                r.chapters.length - 1,
                i + (e.key === "ArrowDown" ? 1 : -1),
              ),
            )
          ];
        document.getElementById(next[0])?.scrollIntoView();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, menu]);
  const scores = weighted(r.criteria);
  return (
    <>
      <a className="skip" href="#summary">
        Перейти до дослідження
      </a>
      <header className="masthead">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            ✳
          </span>
          <span>
            БЮРО НЕЗНАЧНИХ
            <br />
            ДОСЛІДЖЕНЬ
          </span>
        </a>
        <span className="mast-note">НЕЗАЛЕЖНІ ВІД ЗДОРОВОГО ГЛУЗДУ.</span>
        <button
          ref={menuButton}
          aria-expanded={menu}
          aria-controls="contents"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Закрити ×" : "Зміст ↗"}
        </button>
      </header>
      <div
        className="reading-progress"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden="true"
      />
      {menu && (
        <nav id="contents" aria-label="Зміст звіту">
          <p className="eyebrow">ЗВІТ № 001 / НАВІГАЦІЯ</p>
          {r.chapters.map(([id, title], i) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {title}
              <span>↗</span>
            </a>
          ))}
          <p className="fine">Alt + ↓ / ↑ — перехід між розділами</p>
        </nav>
      )}
      <main>
        <section id="top" className="hero">
          <div className="hero-meta">
            <span>ДОСЛІДНИЦЬКИЙ ЗВІТ № 001</span>
            <span>ВІДКРИТИЙ ДОСТУП · ЗАКРИТЕ ПИТАННЯ</span>
          </div>
          <div className="hero-main">
            <div>
              <p className="eyebrow">
                Незначна суперечка. Непропорційні зусилля.
              </p>
              <h1>
                Кількісний аналіз
                <br />
                того, чому
                <br />
                <span className="friend">{r.friendName}</span>
                <br />
                <em>помиляється.</em>
              </h1>
            </div>
            <aside className="hero-aside">
              <span className="stamp">
                РЕЦЕНЗОВАНО*<small>*умовно</small>
              </span>
              <div className="hero-surface">
                <Surface />
              </div>
              <p className="mono">РИС. 00 — ПОВЕРХНЯ НЕЗГОДИ</p>
              <p>
                Що вища впевненість,
                <br />
                то цікавіші результати.
              </p>
            </aside>
          </div>
          <div className="hero-footer">
            <p>{r.subtitle}</p>
            <a className="primary" href="#summary">
              Переглянути докази <span>↓</span>
            </a>
            <div className="hero-facts">
              <span>
                Вибірка <b>n = 1</b>
              </span>
              <span>
                Об’єктивність <b>під питанням</b>
              </span>
              <span>
                Час читання <b>8–15 хв</b>
              </span>
            </div>
          </div>
          <p className="disclaimer">{r.disclaimer}</p>
        </section>
        <div className="chapter-nav" aria-label="Поточний розділ">
          <span>ЗВІТ / 001</span>
          <nav aria-label="Розділи">
            {r.chapters.map(([id, title], i) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                title={title}
              >
                {String(i + 1).padStart(2, "0")}
                <span>{title}</span>
              </a>
            ))}
          </nav>
          <button onClick={() => setMotion(!motion)} aria-pressed={!motion}>
            {motion ? "Рух: увімк." : "Рух: вимк."}
          </button>
        </div>
        <Chapter
          id="summary"
          no="01"
          title="Висновок перед доказами."
          subtitle="Для тих, хто цінує свій час більше, ніж автори цього звіту."
        >
          <Exhibit n={1}>
            <div className="executive">
              {r.friendName}
              <br />
              <em>помиляється.</em>
              <span className="conclusion-mark" aria-hidden="true">
                ↙
              </span>
            </div>
            <p>Далі — 40 експонатів та надмірна кількість пояснень.</p>
            <div className="stats-strip">
              <div>
                <strong className="red">
                  {number(r.statistics.correct)}
                  <small>%</small>
                </strong>
                <p>Імовірність мати рацію</p>
              </div>
              <div>
                <strong>
                  {number(r.statistics.confident)}
                  <small>%</small>
                </strong>
                <p>Імовірність вважати себе правим</p>
              </div>
              <div>
                <strong>−0,81</strong>
                <p>Зв’язок упевненості й точності</p>
              </div>
              <div>
                <strong>≈ 0</strong>
                <p>Суспільне значення</p>
              </div>
            </div>
          </Exhibit>
          <Exhibit n={2} className="impact">
            <div className="impact-bars">
              <div>
                <span>Важливість суперечки</span>
                <i style={{ width: "1%" }} />
              </div>
              <div>
                <span>Витрачені зусилля</span>
                <i style={{ width: "100%" }} />
              </div>
            </div>
            <p className="fine">
              Рекомендовано: прийняти поразку з гідністю. Або просто
              посміхнутися.
            </p>
          </Exhibit>
        </Chapter>
        <Chapter
          id="scope"
          no="02"
          title="Як ми сюди дійшли."
          subtitle="Спочатку була думка. Потім усе вийшло з-під контролю."
        >
          <Exhibit n={3}>
            <div className="disagreement">{r.disagreement}</div>
            <div className="positions">
              <p>
                <span className="mono">ПОЗИЦІЯ А</span>
                {r.myPosition}
              </p>
              <span className="versus">vs.</span>
              <p>
                <span className="mono">ПОЗИЦІЯ Б</span>
                {r.friendPosition}
              </p>
            </div>
          </Exhibit>
          <div className="scope-grid">
            <Exhibit n={4}>
              <ol className="timeline">
                {r.timeline.map(([t, text]) => (
                  <li key={t}>
                    <span>{t}</span>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </Exhibit>
            <div>
              <Exhibit n={5}>
                <blockquote>
                  Гучність не є<br />
                  одиницею вимірювання
                  <br />
                  <em>істини.</em>
                </blockquote>
              </Exhibit>
              <Exhibit n={6}>
                <details>
                  <summary>
                    Відкрити методологічний протокол <span>+</span>
                  </summary>
                  <dl className="methods">
                    {r.methods.map(([title, text]) => (
                      <React.Fragment key={title}>
                        <dt>{title}</dt>
                        <dd>{text}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </details>
                <p className="sample-size">
                  n = 1<small>суперечка²</small>
                </p>
              </Exhibit>
            </div>
          </div>
          <Exhibit n={7}>
            <div className="dataset">
              <span>120 спостережень</span>
              <span>SEED {r.seed}</span>
              <span>0 реальних фактів</span>
              <span>100% відтворюваності</span>
            </div>
          </Exhibit>
        </Chapter>
        <Chapter
          id="evidence"
          no="03"
          title="Дані мають що сказати."
          subtitle="Особливо коли ми самі їх вигадали."
        >
          <Exhibit n={8} className="featured-chart">
            <Plot />
            <p className="figure-caption">
              РИС. 08 / Кожна точка — синтетичне спостереження. Лінія —
              авторська ілюстрація тренду.
            </p>
          </Exhibit>
          <div className="two-column">
            <Exhibit n={9}>
              <Plot kind="line" />
            </Exhibit>
            <Exhibit n={10}>
              <Plot kind="cumulative" />
            </Exhibit>
          </div>
          <div className="two-column unequal">
            <Exhibit n={11}>
              <div className="efficiency">
                <div>
                  <b>100</b>
                  <span>слів</span>
                </div>
                <div>
                  <b>3</b>
                  <span>корисні докази</span>
                </div>
              </div>
              <p className="mono">ККД АРГУМЕНТУ: 3,00%</p>
              <Plot kind="stability" />
            </Exhibit>
            <Exhibit n={12}>
              <Surface />
              <Formula tex="W=\frac{C\cdot S^{2}}{E+1}" />
              <p className="fine">
                C — впевненість · S — впертість · E — докази
              </p>
            </Exhibit>
          </div>
        </Chapter>
        <Chapter
          id="statistics"
          no="04"
          title="Точність до абсурду."
          subtitle="Коли одного знака після коми недостатньо для перемоги."
        >
          <div className="two-column">
            <Exhibit n={13}>
              <Formula tex="\widehat{W}=12.8+0.74C+\varepsilon" />
              <div className="stat-pair">
                <span>
                  R² <b>0,87</b>
                </span>
                <span>
                  Відношення шансів <b>14,72</b>
                </span>
              </div>
            </Exhibit>
            <Exhibit n={14}>
              <Formula tex="P(H\mid E)\propto P(E\mid H)P(H)" />
              <Plot kind="distribution" />
              <p className="fine">Апріорна: 50% → умовна апостеріорна: 7,4%.</p>
            </Exhibit>
          </div>
          <Exhibit n={15} className="p-value">
            <span className="mono">СТАТИСТИЧНО НЕПРИСТОЙНО</span>
            <div>
              p = <em>{r.statistics.p}</em>
            </div>
            <p>Гіпотезу відхилено з непотрібним ентузіазмом.</p>
          </Exhibit>
          <Exhibit n={16}>
            <Interval />
          </Exhibit>
        </Chapter>
        <Chapter
          id="simulation"
          no="05"
          title="А якщо спробувати 10 000 разів?"
          subtitle="Масштаб обчислень змінився. Масштаб проблеми — ні."
          dark
        >
          <Exhibit n={17}>
            <MonteCarlo motion={motion} />
            <p className="figure-caption">
              РИС. 17 — Ми вже далеко за межами необхідного.
            </p>
          </Exhibit>
          <Exhibit n={18}>
            <div className="scenario-list">
              {[
                ["Базовий світ", "Докази мають значення.", "Без змін"],
                [
                  "Світ без заперечень",
                  "Ніхто не сперечається. Це не означає згоди.",
                  "Без змін",
                ],
                [
                  "Світ суцільної впевненості",
                  "Доказів немає. Усі переконані.",
                  "Модель зламана",
                ],
              ].map(([name, body, result]) => (
                <div key={name}>
                  <h4>{name}</h4>
                  <p>{body}</p>
                  <span>{result}</span>
                </div>
              ))}
            </div>
          </Exhibit>
        </Chapter>
        <Chapter
          id="strategy"
          no="06"
          title="Потрібен стратегічний підхід."
          subtitle="До проблеми, яку можна було розв’язати словами «ну добре»."
        >
          <Exhibit n={19}>
            <div className="swot">
              {r.swot.map(([letter, title, ...items]) => (
                <div key={letter}>
                  <span className="swot-letter">{letter}</span>
                  <h4>{title}</h4>
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Exhibit>
          <Exhibit n={20}>
            <Risk />
          </Exhibit>
          <Exhibit n={21}>
            <div className="table-scroll">
              <table>
                <caption>Вигадана оцінка позицій за шкалою від 0 до 10</caption>
                <thead>
                  <tr>
                    <th>Критерій</th>
                    <th>Вага</th>
                    <th>{r.myPosition}</th>
                    <th>{r.friendPosition}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.criteria.map(([label, weight, mine, theirs]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>{number(weight * 100, 0)}%</td>
                      <td>{number(mine, 2)}</td>
                      <td>{number(theirs, 2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Зважений результат</th>
                    <td>100%</td>
                    <td>{number(scores[0], 2)}</td>
                    <td>{number(scores[1], 2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Exhibit>
          <div className="two-column">
            <Exhibit n={22}>
              <div className="stakeholders">
                <span className="mono">ВПЛИВ ↑</span>
                <svg
                  viewBox="0 0 480 310"
                  role="img"
                  aria-label="Найбільший вплив та інтерес у двох сторін суперечки; історики — нуль"
                >
                  <path
                    d="M45 20V260H450M45 140H450M245 20V260"
                    className="gridline"
                  />
                  {r.stakeholders.map(([name, x, y]) => (
                    <g key={name}>
                      <circle
                        cx={45 + x * 3.7}
                        cy={260 - y * 2.5}
                        r="5"
                        fill="var(--accent)"
                      />
                      <text
                        x={45 + x * 3.7 + (x > 75 ? -10 : 10)}
                        y={252 - y * 2.5}
                        textAnchor={x > 75 ? "end" : "start"}
                      >
                        {name}
                      </text>
                    </g>
                  ))}
                  <text x="440" y="300" textAnchor="end">
                    ІНТЕРЕС →
                  </text>
                </svg>
              </div>
            </Exhibit>
            <Exhibit n={23}>
              <div className="cost-benefit">
                <div>
                  <h4>− Витрати</h4>
                  {r.costs.map((x) => (
                    <p key={x}>{x}</p>
                  ))}
                </div>
                <div>
                  <h4>+ Вигоди</h4>
                  {r.benefits.map((x) => (
                    <p key={x}>{x}</p>
                  ))}
                </div>
              </div>
              <p className="npv">
                NPV <em>позитивна.</em>
              </p>
            </Exhibit>
          </div>
          <Exhibit n={24}>
            <div className="horizons">
              <span>
                ЗАРАЗ
                <br />
                <b>Пауза.</b>
              </span>
              <span>
                ПОТІМ
                <br />
                <b>Нова тема.</b>
              </span>
              <span>
                ЗРЕШТОЮ
                <br />
                <b>Нічого.</b>
              </span>
            </div>
          </Exhibit>
        </Chapter>
        <Chapter
          id="mechanism"
          no="07"
          title="Усередині переконаності."
          subtitle="Складна архітектура простого небажання погодитися."
          dark
        >
          <Exhibit n={25}>
            <div className="system-flow">
              {r.system.map((item, i) => (
                <div key={item}>
                  <span className="mono">0{i + 1}</span>
                  {item}
                  <span aria-hidden="true">→</span>
                </div>
              ))}
            </div>
          </Exhibit>
          <Exhibit n={26}>
            <Network />
          </Exhibit>
          <div className="two-column">
            <Exhibit n={27}>
              <div className="causal">
                <span>Висока впевненість</span>
                <b>↓</b>
                <span>Менше переосмислення</span>
                <b>↓</b>
                <span>Більше повторення</span>
                <b>↓</b>
                <span>Більше помилковості</span>
                <aside>
                  ↗ Конфаундер:
                  <br />
                  енергія уявного чату
                </aside>
              </div>
            </Exhibit>
            <Exhibit n={28}>
              <Argument />
            </Exhibit>
          </div>
        </Chapter>
        <Chapter
          id="model"
          no="08"
          title="Спробуйте змінити висновок."
          subtitle="Ми залишили вам усі важелі. Майже."
        >
          <Exhibit n={29}>
            <LiveModel />
          </Exhibit>
          <div className="three-notes">
            <Exhibit n={30} />
            <Exhibit n={31} />
            <Exhibit n={32} />
          </div>
        </Chapter>
        <Chapter
          id="review"
          no="09"
          title="Наука потребує сумнівів."
          subtitle="Ми запросили їх. Вони залишили зауваження."
        >
          <Exhibit n={33}>
            <div className="limitations">
              <span>n = 1</span>
              <span>валідність = 0</span>
              <span>амбіції → ∞</span>
            </div>
          </Exhibit>
          <Exhibit n={34}>
            <div className="reviewers">
              {r.reviewers.map(([name, quote]) => (
                <blockquote key={name}>
                  <span className="mono">{name} / ВИГАДАНИЙ</span>«{quote}»
                </blockquote>
              ))}
            </div>
          </Exhibit>
          <Exhibit n={35}>
            {r.objections.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </Exhibit>
          <Exhibit n={36}>
            <div className="final-score">
              <div>
                <span>{r.myPosition}</span>
                <strong>{number(scores[0], 2)}</strong>
              </div>
              <span>:</span>
              <div>
                <span>{r.friendPosition}</span>
                <strong>{number(scores[1], 2)}</strong>
              </div>
            </div>
          </Exhibit>
          <div className="two-column">
            <Exhibit n={37}>
              <p className="mono">ГЕНЕРАТОР: LCG / SEED {r.seed}</p>
              {r.footnotes.map((text) => (
                <p className="fine" key={text}>
                  {text}
                </p>
              ))}
            </Exhibit>
            <Exhibit n={38}>
              <ol className="references">
                {r.citations.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
            </Exhibit>
          </div>
        </Chapter>
        <Chapter
          id="verdict"
          no="10"
          title="Питання закрито."
          subtitle="Не тому, що ми маємо рацію. Тому, що сторінка закінчується."
        >
          <Exhibit n={39} />
          <Exhibit n={40} className="last-exhibit">
            <div className="verdict">
              <p>{r.friendName}</p>
              <h2>{r.finalMessage}</h2>
              <span>з повагою.</span>
            </div>
          </Exhibit>
          <div className="postcredits">
            <dl>
              <div>
                <dt>Бюджет дослідження</dt>
                <dd>прикрий.</dd>
              </div>
              <div>
                <dt>Суспільний вплив</dt>
                <dd>мізерний.</dd>
              </div>
              <div>
                <dt>Особисте задоволення</dt>
                <dd>статистично значуще.</dd>
              </div>
            </dl>
            <div className="post-actions">
              <button
                onClick={() => setNotice("Ні. Ви вже прочитали достатньо.")}
              >
                Завантажити повний звіт ↗
              </button>
              <button
                onClick={() =>
                  setNotice("Апеляцію відхилено. Дружбу збережено.")
                }
              >
                Оскаржити висновки ↗
              </button>
            </div>
            <p role="status" className="notice">
              {notice}
            </p>
          </div>
        </Chapter>
      </main>
      <footer className="footer">
        <a href="#top">↑ До початку цієї помилки</a>
        <p>{r.disclaimer}</p>
        <span className="mono">БНД / КІНЕЦЬ ЗВІТУ</span>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
