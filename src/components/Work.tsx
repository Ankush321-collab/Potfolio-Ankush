import { useState, useCallback } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { MdArrowBack, MdArrowForward, MdOpenInNew } from "react-icons/md";
import { FaGithub } from "react-icons/fa";

const projects = [
  {
    title: "Automated Git-Based Deployment Platform",
    category: "Cloud-Native CI/CD from Git Repositories",
    tools:
      "AWS, Kafka, ClickHouse, PostgreSQL, Next.js, Docker | Reduced manual deployment effort by 80%",
    image: "/images/gitbased.png",
    link: "https://github.com/Ankush321-collab/StackLift",
  },
  {
    title: "AI-Powered Resume Analyzer & Job Matcher",
    category: "Semantic Resume Evaluation and Job Matching",
    tools:
      "Next.js, GraphQL, Kafka, PostgreSQL, Redis, LLM | Built scalable async processing and semantic scoring",
    image: "/images/resume-analyzer.png",
    link: "https://github.com/Ankush321-collab/AI-Powered-Smart-Resume-Analyzer-Job-Matcher",
  },
  {
    title: "Policy Pulse",
    category: "AI-Powered Policy Simulation Platform",
    tools:
      "Python, Scikit-learn, Streamlit, Gemini API | Simulated up to 50,000 virtual citizens for policy impact analysis",
    image: "/images/policy-pulse.png",
    link: "https://github.com/Ankush321-collab/Policy-Pulse",
  },
  {
    title: "Event Pass",
    category: "College Event Management System",
    tools:
      "MERN Stack, QR Verification, Real-Time Validation | Handled 1,000+ registrations with 99.2% uptime",
    image: "/images/event-pass.png",
    link: "https://github.com/Ankush321-collab/College_Event_pass",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const goToPrev = useCallback(() => {
    const newIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="carousel-wrapper">
          {/* Navigation Arrows */}
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={goToPrev}
            aria-label="Previous project"
            data-cursor="disable"
          >
            <MdArrowBack />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={goToNext}
            aria-label="Next project"
            data-cursor="disable"
          >
            <MdArrowForward />
          </button>

          {/* Slides */}
          <div className="carousel-track-container">
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={index}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.category}
                        </p>
                        <div className="carousel-tools">
                          <span className="tools-label">Tools & Features</span>
                          <p>{project.tools}</p>
                        </div>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="project-github-link"
                          data-cursor="disable"
                        >
                          <FaGithub /> View on GitHub <MdOpenInNew />
                        </a>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage
                        image={project.image}
                        alt={project.title}
                        link={project.link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "carousel-dot-active" : ""
                  }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to project ${index + 1}`}
                data-cursor="disable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
