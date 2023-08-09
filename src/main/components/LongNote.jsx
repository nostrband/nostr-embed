import ProfileComponent from "../../components/profile.jsx";
import Meta from "../../components/meta.jsx";
import { formatZapAmount, getNpub } from "../../utils/common.js";
import { marked } from "marked";

export default function LongNote({ state, props }) {
	const title = state.event.tags.find((el) => el[0] === "title")[1];
	const summary = state.event.tags.find((el) => el[0] === "summary")[1];

	let npub, formattedZapAmount;

	if (state.profile && state.profile.pubkey) {
		npub = getNpub(state.profile.pubkey);
		formattedZapAmount = formatZapAmount(state.zapAmount);
	}

	function createMarkup() {
		return { __html: marked.parse(state?.event.content) };
	}

	return (
		<div className="nostrEmbedCard">
			<ProfileComponent
				profilePkey={state?.profilePkey}
				profile={state?.profile}
				options={props?.options}
			/>
			<div
				className={
					state?.event.error ? "cardContent ne-text-red-800" : "cardContent"
				}
			>
				<h2 className="ne-m-0">{title}</h2>
				<p className="ne-italic">{summary}</p>
				<div
					dangerouslySetInnerHTML={createMarkup()}
					className="ne-max-h-48 ne-overflow-hidden"
				/>
				<div>...</div>
				<div className="ne-flex ne-items-center ">
					<a
						target="_blank"
						rel="noopener noreferrer nofollow"
						href={`https:///nostr.band/${state.profileObj.naddr}`}
						className="linkLink"
					>
						<span className="displayText">View</span>
					</a>
					<div className="ne-flex ne-items-center">&#8702;</div>
				</div>
			</div>
			<Meta
				profilesList={state?.profileObj}
				likesCount={state?.likesCount}
				repliesCount={state?.repliesCount}
				repostsCount={state?.repostsCount}
				zapAmount={state?.zapAmount}
				options={props?.options}
				npub={npub}
			/>
		</div>
	);
}
