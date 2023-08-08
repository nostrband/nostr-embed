import BoltIcon from "./boltIcon.jsx";

export const BoltIconList = ({ zapAmount }) => {
	const calcAmountBoltIcons = () => {
		if (zapAmount >= 3000 && zapAmount < 10000) return new Array(2).fill(0);
		if (zapAmount >= 10000 && zapAmount < 100000) return new Array(3).fill(0);
		if (zapAmount >= 100000 && zapAmount < 1000000) return new Array(4).fill(0);
		if (zapAmount >= 1000000) return new Array(5).fill(0);
    
		return new Array(1).fill(0);
	};
	const boltIcons = calcAmountBoltIcons();

	return (
		<div className="ne-flex ">
			{boltIcons.map((_, ind) => (
				<BoltIcon
					key={ind}
					additionalClasses="ne-fill-yellow-400 ne-w-7 ne-h-7"
				/>
			))}
		</div>
	);
};
