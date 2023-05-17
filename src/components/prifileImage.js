import {useState} from 'preact/hooks';
import './style.css';

function ProfileImage({thumbnail, fullImage, defaultImage}) {
    const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState(thumbnail)

    const onError = () => {
        if (!isFullImageLoaded) {
            setImageSrc(fullImage);
            setIsFullImageLoaded(true);
        } else {
            setImageSrc(defaultImage)
        }
    };

    return (
        <img className="profileImg" src={imageSrc} onError={onError}></img>
    );
}

export default ProfileImage;
