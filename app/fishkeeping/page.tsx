'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

type Fish = {
	image: string;
	name: string;
	latinName?: string;
  nickname?: string,
	age: string;
	characteristics: string;
};

const fishData: Fish[] = [
	{
		image: '/aquarium/fish-biluta.jpg',
		name: 'Striped Raphael catfish',
    latinName: 'Platydoras armatulus',
    nickname: 'Biluta, The Gentle Giant',
    age: '03-09-2018',
    characteristics: 'Nocturnal and elusive, likes dark holes, only comes out for lunch',
	},
	{
		image: '/aquarium/fish-clean.jpg',
		name: 'Siamese algae-eater',
    latinName: 'Crossocheilus oblongus',
    nickname: 'Cleanup Crew',
    age: '05-24-2018',
    characteristics: 'Social and active, often seen in a group, grazing on algae.',
	},
	{
		image: '/aquarium/fish-navi.jpg',
		name: 'White spotted cichlid',
    latinName: 'Tropheus duboisi',
    nickname: 'King',
    age: '06-16-2019',
    characteristics: 'Aggressive and territorial, often seen digging and guarding its nest, dances with its partner, has kids',
	},
];

// Helper function to calculate the age of the fish from its birth date
const calculateAge = (birthDateString: string) => {
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months = 12 + months;
  }
  if (today.getDate() < birthDate.getDate()) {
      months--;
  }
  return `${years} years, ${months} months`;
};

export default function Home() {
	const [fishes] = useState<Fish[]>(fishData);


	return (
		<div className={styles.page}>
			<div className={styles.background}>
				<Image
					src="/aquarium/aquarium-overview-bg.jpg"
					alt="Beard photo"
					layout="responsive"
					width={615}
					height={800}
					className={styles.background}
				/>
			</div>
			{/* <div className={styles.title}>inhabitants</div> */}
			<div className={styles.gallery}>
				{fishes.map((fish) => (
					<div key={fish.image} className={styles.fishDetails}>
						<Image
							src={fish.image}
							alt="Fish photo"
							layout="responsive"
							width={600}
							height={600}
							className={styles.image}
						/>
            <div className={styles.nameWrapper}>
              <span className={styles.nickname}>{fish.nickname}</span>
              <span className={styles.name}>{fish.name}</span>
              <span className={styles.latinName}>{fish.latinName}</span>
            </div>

            <span className={styles.age}>{calculateAge(fish.age)}</span>

            <span className={styles.characteristics}>{fish.characteristics}</span>
					</div>
				))}
			</div>
		</div>
	);
}
