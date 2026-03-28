import { useState } from "react";
import { MdArrowOutward, MdImage } from "react-icons/md";

interface Props {
  image: string;
  alt?: string;
  video?: string;
  link?: string;
}

const WorkImage = (props: Props) => {
  const [isVideo, setIsVideo] = useState(false);
  const [video, setVideo] = useState("");
  const [imgError, setImgError] = useState<string | null>(null);
  const handleMouseEnter = async () => {
    if (props.video) {
      setIsVideo(true);
      const response = await fetch(`src/assets/${props.video}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideo(blobUrl);
    }
  };

  const handleError = () => {
    setImgError(props.image);
  };

  const handleLoad = () => {
    setImgError(null);
  };

  return (
    <div className="work-image">
      <a
        className="work-image-in"
        href={props.link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVideo(false)}
        target="_blank"
        data-cursor={"disable"}
      >
        {props.link && (
          <div className="work-link">
            <MdArrowOutward />
          </div>
        )}
        {imgError === props.image ? (
          <div className="work-image-fallback">
            <MdImage size={40} />
            <span>No Preview</span>
          </div>
        ) : (
          <img 
            src={props.image} 
            alt={props.alt} 
            loading="lazy" 
            decoding="async"
            onError={handleError}
            onLoad={handleLoad}
            key={props.image}
          />
        )}
        {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
      </a>
    </div>
  );
};

export default WorkImage;
