'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

type Photo = {
	src: string;
	details?: string;
	date?: string;
};

const photoData: Photo[] = [
	{
		src: '/beard/beard-1.jpg',
		details: 'Naive.',
		date: '17 Mar 2024',
	},
	{
    src: '/beard/beard-2.jpg'
  },
	{ src: '/beard/beard-3.jpg',
    date: '3 Apr 2024' },
	{ src: '/beard/beard-4.jpg' },
	{
    src: '/beard/beard-5.jpg',
    details: 'Itchy & Scratchy', },
	{
    src: '/beard/beard-6.jpg',
    date: '1 Month'
  },
	{ src: '/beard/beard-7.jpg' },
	{
		src: '/beard/beard-8.jpg',
		details: 'First contact with a barber.',
		date: '25 Apr 2024',
	},
	{ src: '/beard/beard-9.jpg' },
	{
    src: '/beard/beard-10.jpg',
    date: '2 May 2024', },
	{ src: '/beard/beard-11.jpg' },
	{ src: '/beard/beard-12.jpg' },
	{
    src: '/beard/beard-13.jpg',
    details: 'Wild.', },
	{
		src: '/beard/beard-14.jpg',
		details: 'Trying to regain control.',
		date: '2 Months',
	},
	{
    src: '/beard/beard-15.jpg',
    details: 'Didn\'t', },
];

export default function Home() {
	const [photos] = useState<Photo[]>(photoData);

	return (
		<div className={styles.page}>
      <div className={styles.title}>Bearded Diaries</div>
			<div className={styles.gallery}>
				{photos.map((photo) => (
					<div key={photo.src} className={styles.photoContainer}>
						<Image
							src={photo.src}
							alt="Beard photo"
							layout="responsive"
							width={615}
							height={800}
							className={styles.image}
						/>
            
              {photo.date && (
                <p className={styles.date}>{photo.date}</p>
              )}
              {photo.details && (
                <p className={styles.details}>{photo.details}</p>
              )}
              
					</div>
				))}
			</div>
		</div>
	);
}
