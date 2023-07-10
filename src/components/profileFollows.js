const ProfileFollows = ({ follows = [], options }) => {
    if (!options?.showFollowing) return <></>
    return (
        <div>
            <hr />
            <div className="ne-flex ne-gap-6 ne-flex-wrap ne-items-center ne-mt-8">
                <ul className="ne-list-none ne-p-0 ne-flex ne-ms-[40px] ne-m-0">
                    {
                        follows && follows.slice(0, 5).map(follow => {
                            return (
                                <li key={follow?.id}>
                                    <img className='ne-rounded-full ne-ms-[-40px] ne-object-cover ne-w-[75px]' src={follow?.picture} alt='follows image' height="75" />
                                </li>
                            )
                        })
                    }
                </ul>
                <div>
                    <h2 className="ne-m-0 ne-font-bold">
                        Follows {follows.length} other...
                    </h2>
                    <p className="ne-m-0">
                        Including {follows[0]?.display_name}, {follows[1]?.display_name}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfileFollows