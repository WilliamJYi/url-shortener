import { useState, useEffect, useMemo } from "react";
import { ShortURLResponse } from "../types/api";
import "./Homepage.css";

const Homepage = () => {
  const [allUrls, setAllUrls] = useState<ShortURLResponse[]>([]);
  const [urlInput, setUrlInput] = useState<string>("");
  const [shortUrlData, setShortUrlData] = useState<ShortURLResponse | null>(
    null
  );

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const shortUrl = useMemo(() => {
    return shortUrlData ? `${BASE_URL}/shorten/${shortUrlData.short_code}` : "";
  }, [shortUrlData]);

  useEffect(() => {
    const getAllUrls = async () => {
      try {
        const response = await fetch(`${BASE_URL}/all`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch URLs");
        }

        const data = await response.json();
        setAllUrls(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    getAllUrls();
  }, []);

  const handleChange = (e: any) => {
    setUrlInput(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data: ShortURLResponse = await response.json();
      setShortUrlData(data);
      setAllUrls((prev) => [...prev, data]);
      console.log("Shortened URL:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (shortUrlData) {
      await navigator.clipboard.writeText(shortUrl);
      alert("Copied to clipboard!");
    }
  };

  const handleDeleteShortUrl = async (shortCode: string) => {
    try {
      const response = await fetch(`${BASE_URL}/shorten/${shortCode}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete short URL");
      }

      const updatedUrls = allUrls.filter(
        ({ short_code }) => short_code !== shortCode
      );

      console.log(`Url ${shortCode} deleted!`, updatedUrls);
      setAllUrls(updatedUrls);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const displayAllUrls = () => {
    if (allUrls) {
      return allUrls.map(({ id, url, short_code, created_at, updated_at }) => {
        const shortUrl = `${BASE_URL}/shorten/${short_code}`;
        return (
          <tr key={id}>
            <td>
              <div className="long-url-container">
                <a href={url}>{url}</a>
              </div>
            </td>
            <td>
              <div className="short-url-container">
                <a href={shortUrl}>{shortUrl}</a>
                <button onClick={handleCopyToClipboard}>📋</button>
              </div>
            </td>
            <td>{new Date(created_at).toLocaleString()}</td>
            <td>{updated_at && new Date(updated_at).toLocaleString()}</td>
            <td>
              <button onClick={() => handleDeleteShortUrl(short_code)}>
                🗑️
              </button>
            </td>
          </tr>
        );
      });
    }
    return;
  };

  return (
    <div className="homepage-container">
      <form className="url-shortener-form" onSubmit={handleSubmit}>
        <h2>Welcome to URL shortener</h2>
        <label htmlFor="url">Paste the URL you want to shorten: </label>
        <input
          id="url"
          name="url"
          type="url"
          value={urlInput}
          onChange={handleChange}
        />
        <button type="submit">Shorten URL</button>
        {shortUrlData?.short_code && (
          <div>
            <p>Your shortened URL: {shortUrl}</p>
            <button onClick={handleCopyToClipboard}>Copy URL</button>
          </div>
        )}
      </form>
      <div className="urls-container">
        <h3>Your short URLs:</h3>
        <table className="urls-table">
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short URL</th>
              <th>Date Created</th>
              <th>Date Updated</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>{displayAllUrls()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Homepage;
