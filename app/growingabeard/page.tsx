"use client"

import { useEffect, useState } from 'react';
import styles from "./page.module.css";

type PhotoData = {
    photos: string[] | null;
    error?: string;
};

export default function Home() {
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/beard')
            .then(response => response.json())
            .then((data: PhotoData) => {
                // console.log("API data:", data);
                if (data.photos) {
                    setPhotos(data.photos);
                    // console.log("Photos loaded:", data.photos);
                } else {
                    // console.log("No photos or error:", data.error);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Fetching photos failed:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (!photos.length) return <p>No photos found.</p>; // Display a message if no photos

    return (
      <div className={styles.page}>
        <div className={styles.gallery}>
          {photos.map(photo => (
              <img key={photo} src={photo} alt="Photo" />
          ))}
        </div>
      </div>
    );
}
