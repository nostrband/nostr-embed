import { getNpub } from "../common";
import ProfileImage from "./profileImage";

const ProfileFollows = ({ follows = [], options }) => {
    if (!options?.showFollowing) return <></>

    const getCachedImage = (pubkey) => {
        return `https://media.nostr.band/thumbs/${pubkey.slice(-4)}/${pubkey}-picture-64`
    }

    const parsedFollows = follows.slice(0, 10).map(follow => {
        const content = JSON.parse(follow.content)
        return {
            id: follow?.id,
            npubLink: `https://nostr.band/${getNpub(follow?.pubkey)}`,
            display_name: content?.display_name,
            picture: content?.picture,
            cachedImage: getCachedImage(follow?.pubkey)
        }
    })


    return (
        <div>
            <hr />
            <div className="ne-flex ne-gap-6 ne-flex-wrap ne-items-center ne-mt-8">
                <ul className="ne-list-none ne-p-0 ne-flex ne-ms-[25px] ne-m-0 ne-items-center">
                    {
                        parsedFollows.map(follow => {
                            return (
                                <li key={follow?.id}>
                                    <a rel="noopener noreferrer nofollow" target="_blank" href={follow.npubLink}>
                                        <ProfileImage
                                            fullImage={follow?.picture}
                                            thumbnail={follow?.cachedImage}
                                            isProfileImage={false} />
                                    </a>
                                </li>
                            )
                        })
                    }
                </ul>
                <div>
                    <h2 className="ne-m-0 ne-font-bold ne-text-lg">
                        Follows {follows.length} profiles
                    </h2>
                    <div className="ne-m-0 ne-text-sm">
                        Including {" "}
                        <a rel="noopener noreferrer nofollow" target="_blank" className='ne-text-black' href={parsedFollows[0]?.npubLink}>{parsedFollows[0]?.display_name}</a>
                        {follows[1] ? ', ' : ''}
                        <a rel="noopener noreferrer nofollow" target="_blank" className='ne-text-black' href={parsedFollows[1]?.npubLink}>{parsedFollows[1]?.display_name}</a>
                        {follows[2] ? ' and ' : ''}
                        <a rel="noopener noreferrer nofollow" target="_blank" className='ne-text-black' href={parsedFollows[2]?.npubLink}>{parsedFollows[2]?.display_name}</a>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileFollows