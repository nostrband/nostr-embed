import CopyText from "../../components/copyText.jsx";
import { BoltIconList } from "../../components/icons/boltIconList.jsx";
import KeyIcon from "../../components/icons/keyIcon.jsx";
import ProfileImage from "../../components/profileImage.jsx";
import { ZapComment } from "../../components/zapComment.jsx";
import { formatNpub, getNpub } from "../../utils/common";
import { formatDate } from "../../utils/formatDate";

export default function Zap({ state }) {
	const profile = state.zap?.senderProfile;

	return (
		<div className="nostrEmbedCard">
			<div className="ne-flex ne-flex-col ne-gap-2">
				<Profile profile={profile} profilePkey={profile?.pubkey} />
        <hr />
				<div className="ne-flex ne-flex-col ne-gap-2 ne-text-xl">
          <div>Zapped</div>
          <BoltIconList zapAmount={state.zap?.amount}/>
					<p className="ne-m-0 ne-text-3xl ne-mr-5 sm:ne-m-0">
						{state.zap?.amount} sats
					</p>
				</div>
				<div className="ne-flex ne-flex-col ne-gap-2">
          <ZapComment zap={state.zap}/>
					<div className="ne-text-xl">
						{state.zap?.targetEvent ? "For" : "To"}
					<Profile profile={state.zap?.recipientProfile} />
					{state.zap?.targetEvent && (
						<div className="ne-justify-self-center">
							{state.zap?.targetEvent.content}
						</div>
					)}
					</div>
				</div>
				<hr />
				<div className="ne-flex ne-items-center ne-gap-2 ne-text-[12px]">
					<span className="ne-font-bold">Wallet: </span>
					<Profile profile={state.zap?.providerProfile} variant="xs" />
					<time className="ne-block sm:ne-inline-block ne-ml-auto">
						{formatDate(state.event?.created_at * 1000)}
					</time>
				</div>
			</div>
		</div>
	);
}

export function Profile({
	isReverse = false,
	profile,
	profilePkey = null,
	variant = "xl"
}) {
	if (!profile) return;
	let cachedProfilePicture, encodedProfilePkey, truncatedProfilePkey;
	if (profilePkey) {
		encodedProfilePkey = getNpub(profilePkey);
		truncatedProfilePkey = `${formatNpub(encodedProfilePkey)}`;
		cachedProfilePicture = `https://media.nostr.band/thumbs/${profilePkey.slice(
			-4
		)}/${profilePkey}-picture-64`;
	}
	const parsedProfile = JSON.parse(profile?.content);
	return (
		<a
			href={`https://nostr.band/${getNpub(profile?.pubkey)}`}
			target="_blank"
			rel="noopener noreferrer nofollow"
			className={`ne-no-underline ne-text-black ne-flex ne-items-center ne-gap-4 ne-flex-row ${
				isReverse ? "sm:ne-flex-row-reverse " : ""
			}`}
		>
			<ProfileImage
				fullImage={parsedProfile.picture}
				thumbnail={`https://media.nostr.band/thumbs/${profile.pubkey.slice(
					-4
				)}/${profile.pubkey}-picture-64`}
				additionalClass={variant === "xs" ? "zapProfileImgXs" : "zapProfileImg"}
			/>
			<div>
				<span
					className={`hover:ne-underline  ${
						variant === "xs" ? "ne-text-[12px]" : "ne-text-xl"
					} ne-font-bold  hover:ne-decoration-solid`}
				>
					{parsedProfile.display_name || parsedProfile.name}
				</span>
				{profilePkey && (
					<div className="profilePkey">
						<KeyIcon additionalClasses="w-4 h-4" />
						<span className={`pkey ne-text-xl`}>
							{truncatedProfilePkey || "npub..."}
						</span>
						<CopyText iconClasses="w-4 h-4" copyText={encodedProfilePkey} />
					</div>
				)}
			</div>
		</a>
	);
}
