import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My education <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Development Intern</h4>
                <h5>Computer Point Nepal (CPN)</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Redesigned and launched the official company website using React.js
              and Next.js, increasing online inquiries by 30%, improving page
              load time by 45%, and improving accessibility for 500+ students.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech in Computer Science and Engineering</h4>
                <h5>SRM University AP · Andhra Pradesh, India</h5>
              </div>
              <h3>2023-27</h3>
            </div>
            <p>
              Current CGPA: 8.81/10. Core coursework includes Data Structures and
              Algorithms, Computer Networks, Operating Systems, DBMS, and
              Object-Oriented Programming with C++.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Higher Secondary Education (PCM)</h4>
                <h5>Trinity International College · Kathmandu, Nepal</h5>
              </div>
              <h3>2020-23</h3>
            </div>
            <p>
              Built a strong foundation in Physics, Chemistry, and Mathematics,
              which continues to support analytical problem-solving in software
              engineering and machine learning work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
