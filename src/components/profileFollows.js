

const mockData = Array.from(Array(5).keys()).map(id => ({
    image: `https://picsum.photos/id/${id + 1}/200`
}))

const ProfileFollows = () => {
    return (
        <div>
            <hr />
            <div className="ne-flex ne-gap-6 ne-flex-wrap ne-items-center ne-mt-8">
                <ul className="ne-list-none ne-p-0 ne-flex ne-ms-[40px] ne-m-0">
                    {
                        mockData && mockData.map(img => {
                            return (
                                <li key={img.image}>
                                    <img className='ne-rounded-full ne-ms-[-40px]' src={img.image} alt='follows image' weight="75" height="75" />
                                </li>
                            )
                        })
                    }
                </ul>
                <div>
                    <h2 className="ne-m-0 ne-font-bold">
                        Follows 50 other...
                    </h2>
                    <p className="ne-m-0">
                        Including EVAN, liam@ andverbiricha
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfileFollows