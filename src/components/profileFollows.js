import { getNpub } from "../common";

const ProfileFollows = ({ follows = [], options }) => {
    if (!options?.showFollowing) return <></>
    const includeProfiles = follows.slice(0, 2).map(follow => {
        return {
            npub: getNpub(follow.pubkey),
            display_name: JSON.parse(follow.content).display_name
        }
    })
    return (
        <div>
            <hr />
            <div className="ne-flex ne-gap-6 ne-flex-wrap ne-items-center ne-mt-8">
                <ul className="ne-list-none ne-p-0 ne-flex ne-ms-[20px] ne-m-0 ne-items-center">
                    {
                        follows.slice(0, 5).map(follow => {
                            const parsedProfile = JSON.parse(follow.content)
                            return (
                                <li key={parsedProfile?.id}>
                                    <a href={`https://nostr.band/${getNpub(follow.pubkey)}`}>
                                        <img className='ne-rounded-full ne-ms-[-20px] ne-object-cover ne-w-[40px]' src={parsedProfile?.picture} alt='follows image' height="40" />
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
                        Including &nbsp;
                        <a className='ne-text-black' href={`https://nostr.band/${includeProfiles[0]?.npub}`}>{includeProfiles[0]?.display_name}</a>
                        {follows[1] ? ' and ' : ''}
                        <a className='ne-text-black' href={`https://nostr.band/${includeProfiles[1]?.npub}`}>{includeProfiles[1]?.display_name}</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileFollows