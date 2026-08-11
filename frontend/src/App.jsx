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

// popular brands for quick searching
function BrandCarousel({ onSelect }) {
  const brands = ["Pact", "Allbirds", "Tentree", "Patagonia", "H&M", "Zara"];
  const [currentIndex, setCurrentIndex] = useState(0);


  return (
    <div className="brand-carousel">
      <p className="carousel-label">Popular Brands:</p>
      <div className="carousel-container">
        {brands.map((brand, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={brand}
              className={`brand-button ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(brand)}
            >
              {brand}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// main application component handling state and api fetching
function App() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // fetch sustainability data from the c# backend
  const handleSearch = async (brandName) => {
    if (!brandName) return;
    setSearch(brandName);
    setLoading(true);
    setError('');
    setData(null);

    try {
      // use environment variable for production api url, fallback to local for dev
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5190';
      const response = await fetch(`${apiUrl}/api/sustainability/${brandName}`);

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
    handleSearch(search);
  };

  return (
    <div className="app-container">
      {/* main header and app description */}
      <header>
        <h1>🌿 GreenThreads</h1>
        <p>Transparent sustainability data for your favorite clothing brands.</p>
      </header>

      {/* search form for manual brand lookup */}
      <form onSubmit={handleSubmit} className="search-form">
        <input 
          type="text" 
          placeholder="Search for a brand..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* quick-select brand carousel */}
      <BrandCarousel onSelect={handleSearch} />

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

          {/* d3 gauge visualization for the overall score */}
          <div className="gauge-container">
            <SustainabilityGauge score={data.sustainabilityScore ?? 0} />
          </div>
          
          {/* detailed breakdown of materials, labor, and alternatives */}
          <div className="details">
            <h3> Material Impact</h3>
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

            {/* display the exact url the python scraper pulled data from */}
            <div className="transparency-card">
              <h4>📍 Data Source</h4>
              {data.sourceUrl ? (
                <p><strong>Scraped from:</strong> <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">{data.sourceUrl}</a></p>
              ) : (
                <p>No source URL available.</p>
              )}
              {data.scrapeStatus === "CACHED_HISTORICAL" && (
                <p className="cache-note">⚠️ Live scrape failed. This data was last verified on a previous run.</p>
              )}
            </div>

            {/* show the exact sustainability keywords detected by the scraper */}
            {data.realSignalsDetected && Object.keys(data.realSignalsDetected).length > 0 && (
              <div className="transparency-card">
                <h4>🎯 Sustainability Keywords Detected</h4>
                <p className="keyword-explanation">
                  Our algorithm scanned the brand's website and counted occurrences of these sustainability indicators:
                </p>
                <div className="keywords-grid">
                  {Object.entries(data.realSignalsDetected).map(([keyword, count]) => (
                    <div key={keyword} className="keyword-item">
                      <span className="keyword-name">"{keyword}"</span>
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
                <p><strong>Material Composition (60% of score):</strong></p>
                <ul>
                  <li>Organic materials: +0.8 points per percentage</li>
                  <li>Recycled materials: +0.6 points per percentage</li>
                  <li>Conventional materials: -0.3 points per percentage</li>
                </ul>
                <p><strong>Labor Practices (40% of score):</strong></p>
                <ul>
                  <li>Fair Trade certification: +20 points</li>
                  <li>Supply chain transparency: +10 points</li>
                  <li>Other certifications: +10 points</li>
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