// import necessary react hooks, d3 for visualizations, and global styles
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './App.css';

// custom d3 gauge component to visualize the sustainability score
function SustainabilityGauge({ score }) {
  const svgRef = useRef();

  useEffect(() => {
    // prevent rendering if score is undefined or null
    if (!score && score !== 0) return;

    // define svg dimensions and arc radii
    const width = 200;
    const height = 120;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius - 20;

    // clear previous d3 elements to prevent memory leaks on re-render
    d3.select(svgRef.current).selectAll("*").remove();

    // setup the main svg group and transform it to the bottom center
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height})`);

    // determine color based on score thresholds (green, yellow, red)
    const color = score >= 80 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";

    // calculate the start and end angles for the score arc
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle(Math.PI)
      .endAngle(Math.PI + (Math.PI * (score / 100)));

    // background arc for the empty gauge track
    const bgArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle(Math.PI)
      .endAngle(2 * Math.PI);

    // render the background track
    svg.append("path").attr("d", bgArc).attr("fill", "#e5e7eb");

    // render the score arc with a smooth 1-second transition
    svg.append("path")
      .attr("d", arc)
      .attr("fill", color)
      .transition()
      .duration(1000)
      .attrTween("d", function() {
        const interpolate = d3.interpolate(
          { startAngle: Math.PI, endAngle: Math.PI },
          { startAngle: Math.PI, endAngle: Math.PI + (Math.PI * (score / 100)) }
        );
        return function(t) { return arc(interpolate(t)); };
      });

    // add the large score number in the center
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-20")
      .attr("font-size", "32px")
      .attr("font-weight", "bold")
      .attr("fill", "#111827")
      .text(score);

    // add the "score" label below the number
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "5")
      .attr("font-size", "14px")
      .attr("fill", "#6b7280")
      .text("Score");

  }, [score]);

  return <svg ref={svgRef}></svg>;
}

// static suggestion buttons to quickly populate the search bar
function BrandSuggestions({ onSelect }) {
  const brands = ["Pact", "Allbirds", "Tentree", "Everlane" ];

  return (
    <div className="brand-suggestions">
      <p className="suggestions-label">Try searching:</p>
      <div className="suggestions-container">
        {brands.map((brand) => (
          <button
            key={brand}
            className="suggestion-btn"
            onClick={() => onSelect(brand)}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}

// main application component handling state and api fetching
function App() {
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('brand'); // 'brand' or 'url'

  // fetch sustainability data from the c# backend
  const handleSearch = async (inputValue) => {
    if (!inputValue) return;
    
    // update the correct state based on mode
    if (mode === 'brand') setSearch(inputValue);
    else setUrlInput(inputValue);

    setLoading(true);
    setError('');
    setData(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5190';
      let response;

      // FIX: Route to the correct endpoint based on the active mode
      if (mode === 'brand') {
        response = await fetch(`${apiUrl}/api/sustainability/${inputValue}`);
      } else {
        response = await fetch(`${apiUrl}/api/sustainability/analyze-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputValue })
        });
      }

      // ensure the backend actually returned json and not an html error page
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend returned HTML instead of JSON. Check proxy settings.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch');
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // handle form submission from the search bar
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(mode === 'brand' ? search : urlInput);
  };

  return (
    <div className="app-container">
      {/* main header and app description */}
      <header>
        <h1>🌿 Green Threads</h1>
        <p>Transparent sustainability data for your favorite clothing brands.</p>
      </header>

      {/* mode toggle buttons to switch between brand search and custom url analysis */}
      <div className="mode-toggle">
        <button className={mode === 'brand' ? 'active' : ''} onClick={() => setMode('brand')}>Search by Brand</button>
        <button className={mode === 'url' ? 'active' : ''} onClick={() => setMode('url')}>Analyze Custom URL</button>
      </div>

      {/* search form for manual brand lookup or url analysis */}
      <form onSubmit={handleSubmit} className="search-form">
        <input 
          type={mode === 'brand' ? "text" : "url"} 
          placeholder={mode === 'brand' ? "Search for a brand (e.g., Pact)..." : "Paste a brand's sustainability page URL..."} 
          value={mode === 'brand' ? search : urlInput} 
          onChange={(e) => mode === 'brand' ? setSearch(e.target.value) : setUrlInput(e.target.value)} 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : (mode === 'brand' ? 'Search' : 'Analyze')}
        </button>
      </form>

      {/* quick-select suggestion buttons (only show in brand mode) */}
      {mode === 'brand' && <BrandSuggestions onSelect={handleSearch} />}

      {/* display error messages if the fetch fails */}
      {error && <div className="error">{error}</div>}

      {/* render the results card only if data is successfully fetched */}
      {data && (
        <div className="results-card">
          <h2>{data.brand || "Unknown Brand"}</h2>
          
          {/* dynamic status banner based on scrape success or fallback state */}
          {data.scrapeStatus === "CACHED_HISTORICAL" && (
            <div className="status-banner cached">
              <span className="status-icon">📂</span>
              <div>
                <strong>Cached Data</strong>
                <p>{data.dataNote || "Showing historical data."}</p>
              </div>
            </div>
          )}
          {data.scrapeStatus === "FAILED_NO_HISTORY" && (
            <div className="status-banner failed">
              <span className="status-icon">❌</span>
              <div>
                <strong>Data Unavailable</strong>
                <p>{data.dataNote || "Live scrape failed and no history available."}</p>
              </div>
            </div>
          )}
          {data.scrapeStatus === "SUCCESS" && (
            <div className="status-banner success">
              <span className="status-icon">✅</span>
              <div>
                <strong>Live Data</strong>
                <p>{data.dataNote || "Live data successfully fetched."}</p>
              </div>
            </div>
          )}
          {data.scrapeStatus === "LIVE_ON_DEMAND" && (
            <div className="status-banner success">
              <span className="status-icon">⚡</span>
              <div>
                <strong>Real-Time Analysis</strong>
                <p>{data.dataNote || "Analyzed on demand."}</p>
              </div>
            </div>
          )}

          {/* d3 gauge visualization for the overall score */}
          <div className="gauge-container">
            <SustainabilityGauge score={data.sustainabilityScore ?? 0} />
          </div>
          
          {/* detailed breakdown of materials, labor, and alternatives */}
          <div className="details">
            <h3>🧵 Material Impact</h3>
            {data.materials && Object.keys(data.materials).length > 0 ? (
              <ul>
                {Object.entries(data.materials).map(([material, percentage]) => (
                  <li key={material}>
                    <strong>{material.replace('_', ' ').toUpperCase()}:</strong> {percentage}%
                  </li>
                ))}
              </ul>
            ) : (
              <p>No material data available.</p>
            )}

            <h3>⚖️ Labor Practices</h3>
            <p>{data.laborPractices || "No data available."}</p>

            <h3>💡 Sustainable Alternatives</h3>
            <div className="alternatives">
              {data.alternatives && data.alternatives.length > 0 ? (
                data.alternatives.map((alt, idx) => (
                  <span key={idx} className="alt-tag">{alt}</span>
                ))
              ) : (
                <span className="alt-tag">None listed</span>
              )}
            </div>
          </div>

          {/* transparency section explaining the data source and scoring methodology */}
          <div className="transparency-section">
            <h3>🔍 Data Transparency</h3>
            <p className="transparency-intro">
              We believe in full transparency. Here's exactly how we calculated this score and where the data came from.
            </p>

            {/* display the exact url the python scraper pulled data from, or the custom url */}
            <div className="transparency-card">
              <h4>📍 Data Source</h4>
              {data.sourceUrl ? (
                <p><strong>Analyzed from:</strong> <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">{data.sourceUrl}</a></p>
              ) : (
                <p>No source URL available.</p>
              )}
            </div>

            {/* show the exact sustainability keywords detected by the scraper */}
            {data.realSignalsDetected && Object.keys(data.realSignalsDetected).length > 0 && (
              <div className="transparency-card">
                <h4>🎯 Sustainability Indicators Detected</h4>
                <p className="keyword-explanation">
                  Our algorithm scanned the page and counted occurrences of these sustainability indicators:
                </p>
                <div className="keywords-grid">
                  {Object.entries(data.realSignalsDetected).map(([keyword, count]) => (
                    <div key={keyword} className="keyword-item">
                      <span className="keyword-name">{keyword.replace('_', ' ')}</span>
                      <span className="keyword-count">{count}x found</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* static explanation of the heuristic scoring algorithm */}
            <div className="transparency-card">
              <h4>📊 How We Calculate Scores</h4>
              <div className="methodology">
                <p><strong>Keyword Analysis:</strong></p>
                <ul>
                  <li>Positive indicators (organic, recycled, fair trade): +3 points each</li>
                  <li>Negative indicators (fast fashion, conventional): -5 points each</li>
                  <li>Base score starts at 50, clamped between 0 and 100</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;